const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getStoredTokens = () => {
    try {
        const raw = localStorage.getItem('brightskill_tokens');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.access || parsed?.refresh) return parsed;
        }

        const legacyAccess = localStorage.getItem('access');
        if (legacyAccess) {
            return { access: legacyAccess, refresh: null };
        }
        return null;
    } catch {
        return null;
    }
};

const refreshAccessToken = async () => {
    const tokens = getStoredTokens();
    const refresh = tokens?.refresh;
    if (!refresh) return null;

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;
    const data = await response.json().catch(() => ({}));
    if (!data?.access) return null;

    const nextTokens = { ...tokens, access: data.access };
    localStorage.setItem('brightskill_tokens', JSON.stringify(nextTokens));
    return data.access;
};

const request = async (method, path, body) => {
    const run = async (accessToken) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            data = {};
        }
        return { response, data };
    };

    const currentToken = getStoredTokens()?.access || null;
    let { response, data } = await run(currentToken);

    if (response.status === 401) {
        const refreshedAccess = await refreshAccessToken();
        if (refreshedAccess) {
            ({ response, data } = await run(refreshedAccess));
        }
    }

    if (!response.ok) {
        throw new Error(data?.detail || data?.error || `${method} ${path} failed`);
    }

    return data;
};

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiDelete = (path) => request('DELETE', path);

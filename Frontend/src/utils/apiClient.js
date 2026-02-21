const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAccessToken = () => {
    try {
        const raw = localStorage.getItem('brightskill_tokens');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.access || null;
    } catch {
        return null;
    }
};

const request = async (method, path, body) => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    let data = {};
    try {
        data = await response.json();
    } catch {
        data = {};
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

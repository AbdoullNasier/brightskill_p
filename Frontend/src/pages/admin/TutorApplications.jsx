import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const getAccessToken = () => {
    const direct = localStorage.getItem('access');
    if (direct) return direct;

    try {
        const tokens = JSON.parse(localStorage.getItem('brightskill_tokens') || '{}');
        return tokens?.access || null;
    } catch {
        return null;
    }
};

const TutorApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [actionId, setActionId] = useState(null);

    const authHeaders = useMemo(() => {
        const token = getAccessToken();
        return {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tutor-applications/`, {
                method: 'GET',
                headers: authHeaders,
            });

            const data = await response.json().catch(() => []);
            if (!response.ok) {
                throw new Error(data?.detail || 'Failed to load tutor applications.');
            }

            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load tutor applications.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleDecision = async (id, action) => {
        setActionId(id);
        setError('');
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tutor-applications/${id}/${action}/`, {
                method: 'PATCH',
                headers: authHeaders,
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.detail || `Failed to ${action} application.`);
            }

            setMessage(data?.message || `Application ${action}d successfully.`);
            await fetchApplications();
        } catch (err) {
            setError(err.message || `Failed to ${action} application.`);
        } finally {
            setActionId(null);
        }
    };

    const getCvUrl = (value) => {
        if (!value) return '';
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        return `${SERVER_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
    };

    const statusClass = (status) => {
        if (status === 'approved') return 'bg-green-100 text-green-700';
        if (status === 'rejected') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tutor Applications</h1>

            {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Applicant Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Qualification</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Experience Years</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Teaching Level</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">CV</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!loading && applications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-700">{app.applicant_email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-700">{app.qualification}</td>
                                    <td className="px-6 py-4 text-gray-700">{app.experience_years}</td>
                                    <td className="px-6 py-4 text-gray-700">{app.teaching_level}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {app.cv ? (
                                            <a
                                                href={getCvUrl(app.cv)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                Download CV
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDecision(app.id, 'approve')}
                                                disabled={actionId === app.id || app.status !== 'pending'}
                                                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDecision(app.id, 'reject')}
                                                disabled={actionId === app.id || app.status !== 'pending'}
                                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {loading && <p className="p-6 text-sm text-gray-500">Loading tutor applications...</p>}
                    {!loading && applications.length === 0 && (
                        <p className="p-6 text-sm text-gray-500">No tutor applications found.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TutorApplications;

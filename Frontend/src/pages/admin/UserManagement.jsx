import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { MdDelete } from 'react-icons/md';
import { apiDelete, apiGet, apiPatch } from '../../utils/apiClient';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const query = new URLSearchParams();
            if (search.trim()) query.set('search', search.trim());
            if (roleFilter) query.set('role', roleFilter);
            const suffix = query.toString() ? `?${query.toString()}` : '';
            const data = await apiGet(`/auth/admin/users/${suffix}`);
            setUsers(data);
        } catch (err) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const updateUser = async (id, payload) => {
        try {
            await apiPatch(`/auth/admin/users/${id}/`, payload);
            await loadUsers();
        } catch (err) {
            setError(err.message || 'Failed to update user');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user account?')) return;
        try {
            await apiDelete(`/auth/admin/users/${id}/`);
            await loadUsers();
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search username or email"
                        className="border border-gray-300 rounded-lg p-2.5"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2.5"
                    >
                        <option value="">All roles</option>
                        <option value="learner">Learner</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                    <button onClick={loadUsers} className="bg-indigo-600 text-white rounded-lg p-2.5 hover:bg-indigo-700">
                        Apply
                    </button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Active</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!loading && users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                            className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2"
                                        >
                                            <option value="learner">Learner</option>
                                            <option value="tutor">Tutor</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={user.is_active}
                                            onChange={(e) => updateUser(user.id, { is_active: e.target.checked })}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete user"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <p className="p-6 text-sm text-gray-500">Loading users...</p>}
                </div>
            </Card>
        </div>
    );
};

export default UserManagement;

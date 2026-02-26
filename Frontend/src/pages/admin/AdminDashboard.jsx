import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { MdPeople, MdLibraryBooks, MdSchool, MdTrendingUp } from 'react-icons/md';
import { apiGet } from '../../utils/apiClient';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await apiGet('/auth/admin/stats/');
                setStats(data);
            } catch (err) {
                setError(err.message || 'Failed to load admin dashboard data');
            }
        };
        loadStats();
    }, []);

    const cards = [
        {
            title: 'Total Users',
            value: stats?.total_users ?? 0,
            icon: <MdPeople />,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Active Learners',
            value: stats?.active_learners ?? 0,
            icon: <MdSchool />,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Total Courses',
            value: stats?.total_courses ?? 0,
            icon: <MdLibraryBooks />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
        },
        {
            title: 'Completion Rate',
            value: `${stats?.completion_rate ?? 0}%`,
            icon: <MdTrendingUp />,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat) => (
                    <Card key={stat.title} className="p-6 flex items-center space-x-4">
                        <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Signups</h2>
                    <div className="space-y-4">
                        {(stats?.recent_signups || []).map((user) => (
                            <div key={user.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-semibold text-gray-800">{user.first_name || user.username}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(user.date_joined).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">System Status</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Database</span>
                            <span className="font-semibold text-green-600">Healthy</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">AI API</span>
                            <span className="font-semibold text-green-600">Connected</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Certificates Issued</span>
                            <span className="font-semibold text-indigo-600">{stats?.certificates_issued ?? 0}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

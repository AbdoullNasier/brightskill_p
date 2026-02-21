import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { MdTrendingUp, MdBarChart } from 'react-icons/md';
import { apiGet } from '../../utils/apiClient';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const data = await apiGet('/auth/admin/stats/');
                setStats(data);
            } catch (err) {
                setError(err.message || 'Failed to load analytics');
            }
        };
        loadAnalytics();
    }, []);

    const popularity = stats?.module_popularity || [];
    const maxPopularity = Math.max(...popularity.map((m) => m.completed_by_users), 1);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Growth Snapshot</h2>
                        <MdTrendingUp className="text-green-500 text-2xl" />
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-semibold">{stats?.total_users ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Active Learners</span>
                            <span className="font-semibold">{stats?.active_learners ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Lessons Completed</span>
                            <span className="font-semibold">{stats?.lessons_completed ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-semibold">{stats?.completion_rate ?? 0}%</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Module Popularity</h2>
                        <MdBarChart className="text-indigo-500 text-2xl" />
                    </div>
                    <div className="space-y-3">
                        {popularity.length === 0 && (
                            <p className="text-sm text-gray-500">No completion data yet.</p>
                        )}
                        {popularity.map((item) => {
                            const width = `${Math.max(8, Math.round((item.completed_by_users / maxPopularity) * 100))}%`;
                            return (
                                <div key={item.module_id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{item.module_title}</span>
                                        <span className="font-bold">{item.completed_by_users}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Engagement Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-500">Certificates</p>
                        <p className="text-xl font-bold text-blue-700">{stats?.certificates_issued ?? 0}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-500">Modules</p>
                        <p className="text-xl font-bold text-purple-700">{stats?.total_modules ?? 0}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-500">Learners</p>
                        <p className="text-xl font-bold text-orange-700">{stats?.active_learners ?? 0}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;

import React, { useEffect, useState } from 'react';
import { MdSchool, MdUploadFile, MdAssignment } from 'react-icons/md';
import { apiGet, apiPost } from '../../utils/apiClient';

const TutorDashboard = () => {
    const [modules, setModules] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        module: '',
        title: '',
        order: 1,
        content: '',
        video_url: '',
        duration_minutes: 10,
    });

    const loadModules = async () => {
        try {
            const data = await apiGet('/courses/modules/');
            setModules(data);
            if (!form.module && data.length > 0) {
                setForm((prev) => ({ ...prev, module: String(data[0].id) }));
            }
        } catch (err) {
            setError(err.message || 'Failed to load modules');
        }
    };

    useEffect(() => {
        loadModules();
    }, []);

    const submitLesson = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.module || !form.title.trim() || !form.content.trim()) {
            setError('Module, title and content are required');
            return;
        }
        try {
            await apiPost('/courses/lessons/', {
                module: Number(form.module),
                title: form.title.trim(),
                order: Number(form.order) || 1,
                content: form.content.trim(),
                video_url: form.video_url.trim() || null,
                duration_minutes: Number(form.duration_minutes) || 10,
            });
            setSuccess('Lesson created successfully.');
            setForm((prev) => ({
                ...prev,
                title: '',
                content: '',
                video_url: '',
                order: 1,
                duration_minutes: 10,
            }));
        } catch (err) {
            setError(err.message || 'Failed to create lesson');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center text-gray-800">
                <MdSchool className="mr-3 text-secondary" /> Tutor Content Studio
            </h1>

            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <MdUploadFile className="mr-2 text-primary" /> Create New Lesson
                    </h2>
                    <form className="space-y-4" onSubmit={submitLesson}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={form.module}
                                onChange={(e) => setForm((prev) => ({ ...prev, module: e.target.value }))}
                            >
                                {modules.map((mod) => (
                                    <option key={mod.id} value={mod.id}>{mod.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Advanced Leadership Skills"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                rows="4"
                                value={form.content}
                                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="Lesson content in markdown"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
                            <input
                                type="url"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={form.video_url}
                                onChange={(e) => setForm((prev) => ({ ...prev, video_url: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={form.order}
                                    onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={form.duration_minutes}
                                    onChange={(e) => setForm((prev) => ({ ...prev, duration_minutes: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                                Save Lesson
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <MdAssignment className="mr-2 text-secondary" /> Available Modules
                    </h2>
                    <div className="space-y-4">
                        {modules.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.lesson_count} lessons</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;

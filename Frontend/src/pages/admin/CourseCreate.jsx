import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { createCourse } from '../../services/courseService';

const CourseCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        is_published: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!form.description.trim()) {
            setError('Description is required.');
            return;
        }

        setLoading(true);
        try {
            const created = await createCourse({
                title: form.title.trim(),
                description: form.description.trim(),
                is_published: form.is_published,
            });
            setSuccess('Course created successfully. Redirecting...');
            setTimeout(() => navigate(`/admin/courses/${created.id}`), 900);
        } catch (err) {
            setError(err.message || 'Failed to create course.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Course</h1>
                <p className="text-sm text-gray-500">Create a new course and start adding modules.</p>
            </div>

            <Card className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            placeholder="Course title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            rows={5}
                            placeholder="Describe what learners will achieve"
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                        />
                        Publish immediately
                    </label>

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">{success}</div>
                    )}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Create Course'}
                        </Button>
                        <Button type="button" className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => navigate('/admin/content')}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CourseCreate;

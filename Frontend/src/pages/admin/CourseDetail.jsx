import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import {
    createModule,
    deleteCourse,
    deleteModule,
    getCourse,
    getCourseModules,
    updateCourse,
    updateModule,
} from '../../services/courseService';

const emptyModule = {
    title: '',
    description: '',
    content: '',
    youtube_url: '',
    order_index: 1,
    is_preview: false,
};

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', is_published: false });
    const [modules, setModules] = useState([]);
    const [moduleForm, setModuleForm] = useState(emptyModule);
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingCourse, setSavingCourse] = useState(false);
    const [savingModule, setSavingModule] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const sortedModules = useMemo(
        () => [...modules].sort((a, b) => a.order_index - b.order_index),
        [modules]
    );

    const loadCourseData = async () => {
        setLoading(true);
        setError('');
        try {
            const [courseData, moduleData] = await Promise.all([getCourse(id), getCourseModules(id)]);
            setCourse(courseData);
            setCourseForm({
                title: courseData.title || '',
                description: courseData.description || '',
                is_published: Boolean(courseData.is_published),
            });
            setModules(Array.isArray(moduleData) ? moduleData : []);
        } catch (err) {
            setError(err.message || 'Failed to load course details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourseData();
    }, [id]);

    const saveCourse = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!courseForm.title.trim() || !courseForm.description.trim()) {
            setError('Course title and description are required.');
            return;
        }
        setSavingCourse(true);
        try {
            const updated = await updateCourse(id, {
                ...course,
                title: courseForm.title.trim(),
                description: courseForm.description.trim(),
                is_published: courseForm.is_published,
            });
            setCourse(updated);
            setSuccess('Course updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update course.');
        } finally {
            setSavingCourse(false);
        }
    };

    const submitModule = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!moduleForm.title.trim()) {
            setError('Module title is required.');
            return;
        }
        if (!moduleForm.content.trim() && !moduleForm.youtube_url.trim()) {
            setError('Provide module content text, video URL, or both.');
            return;
        }

        const payload = {
            title: moduleForm.title.trim(),
            description: moduleForm.description.trim(),
            content: moduleForm.content.trim(),
            youtube_url: moduleForm.youtube_url.trim(),
            order_index: Number(moduleForm.order_index),
            is_preview: Boolean(moduleForm.is_preview),
        };

        setSavingModule(true);
        try {
            if (editingModuleId) {
                await updateModule(editingModuleId, payload);
                setSuccess('Module updated successfully.');
            } else {
                await createModule(id, payload);
                setSuccess('Module added successfully.');
            }
            setModuleForm(emptyModule);
            setEditingModuleId(null);
            const latestModules = await getCourseModules(id);
            setModules(Array.isArray(latestModules) ? latestModules : []);
        } catch (err) {
            setError(err.message || 'Failed to save module.');
        } finally {
            setSavingModule(false);
        }
    };

    const onEditModule = (module) => {
        setEditingModuleId(module.id);
        setModuleForm({
            title: module.title || '',
            description: module.description || '',
            content: module.content || '',
            youtube_url: module.youtube_url || '',
            order_index: module.order_index || 1,
            is_preview: Boolean(module.is_preview),
        });
    };

    const onDeleteModule = async (moduleId) => {
        if (!window.confirm('Delete this module?')) return;
        setError('');
        setSuccess('');
        try {
            await deleteModule(moduleId);
            setModules((prev) => prev.filter((m) => m.id !== moduleId));
            setSuccess('Module deleted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to delete module.');
        }
    };

    const onDeleteCourse = async () => {
        if (!window.confirm('Delete this course? This performs a soft delete.')) return;
        setError('');
        setSuccess('');
        try {
            await deleteCourse(id);
            navigate('/admin/content');
        } catch (err) {
            setError(err.message || 'Failed to delete course.');
        }
    };

    if (loading) {
        return <p className="text-sm text-gray-500">Loading course...</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{course?.title || 'Course Detail'}</h1>
                    <p className="text-sm text-gray-500">
                        Status: {courseForm.is_published ? 'Published' : 'Draft'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => navigate('/admin/content')}>
                        Back
                    </Button>
                    <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={onDeleteCourse}>
                        Delete Course
                    </Button>
                </div>
            </div>

            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">{success}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Course Information</h2>
                <form onSubmit={saveCourse} className="space-y-3">
                    <input
                        value={courseForm.title}
                        onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Course title"
                    />
                    <textarea
                        value={courseForm.description}
                        onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        rows={4}
                        placeholder="Course description"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={courseForm.is_published}
                            onChange={(e) => setCourseForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                        />
                        Published
                    </label>
                    <Button type="submit" disabled={savingCourse}>
                        {savingCourse ? 'Saving...' : 'Save Course'}
                    </Button>
                </form>
            </Card>

            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    {editingModuleId ? 'Edit Module' : 'Add Module'}
                </h2>
                <form onSubmit={submitModule} className="space-y-3">
                    <input
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Module title"
                    />
                    <textarea
                        value={moduleForm.description}
                        onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        rows={3}
                        placeholder="Module description (optional)"
                    />
                    <textarea
                        value={moduleForm.content}
                        onChange={(e) => setModuleForm((prev) => ({ ...prev, content: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        rows={5}
                        placeholder="Reading content for this module (optional if video is provided)"
                    />
                    <input
                        type="url"
                        value={moduleForm.youtube_url}
                        onChange={(e) => setModuleForm((prev) => ({ ...prev, youtube_url: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Video URL (optional)"
                    />
                    <input
                        type="number"
                        min="1"
                        value={moduleForm.order_index}
                        onChange={(e) => setModuleForm((prev) => ({ ...prev, order_index: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Order index"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={moduleForm.is_preview}
                            onChange={(e) => setModuleForm((prev) => ({ ...prev, is_preview: e.target.checked }))}
                        />
                        Preview module
                    </label>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={savingModule}>
                            {savingModule ? 'Saving...' : editingModuleId ? 'Update Module' : 'Add Module'}
                        </Button>
                        {editingModuleId && (
                            <Button
                                type="button"
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                onClick={() => {
                                    setEditingModuleId(null);
                                    setModuleForm(emptyModule);
                                }}
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
                {sortedModules.length === 0 && (
                    <Card className="p-4 text-sm text-gray-500">No modules yet.</Card>
                )}
                {sortedModules.map((module) => (
                    <Card key={module.id} className="p-4 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {module.order_index}. {module.title}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {module.is_preview ? 'Preview enabled' : 'Preview disabled'}
                                </p>
                                {module.description && <p className="text-sm text-gray-600 mt-1">{module.description}</p>}
                                {module.content && (
                                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{module.content}</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" className="bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={() => onEditModule(module)}>
                                    Edit
                                </Button>
                                <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => onDeleteModule(module.id)}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                        {module.youtube_url && (
                            <div className="aspect-video w-full overflow-hidden rounded-lg border">
                                {module.embed_url ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={module.embed_url}
                                        title={module.title}
                                        allowFullScreen
                                    />
                                ) : (
                                    <a href={module.youtube_url} target="_blank" rel="noreferrer" className="block p-4 text-indigo-600 underline">
                                        Open video link
                                    </a>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CourseDetail;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { deleteCourse, getCourses } from '../../services/courseService';

const ContentManagement = () => {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadCourses = async (query = '') => {
        setLoading(true);
        setError('');
        try {
            const data = await getCourses(query ? { search: query } : {});
            const rows = Array.isArray(data?.results) ? data.results : data;
            setCourses(Array.isArray(rows) ? rows : []);
        } catch (err) {
            setError(err.message || 'Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const onSearch = async (e) => {
        e.preventDefault();
        await loadCourses(search.trim());
    };

    const onDeleteCourse = async (courseId) => {
        if (!window.confirm('Delete this course? This performs a soft delete.')) return;
        setError('');
        setSuccess('');
        try {
            await deleteCourse(courseId);
            setCourses((prev) => prev.filter((course) => course.id !== courseId));
            setSuccess('Course deleted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to delete course.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
                    <p className="text-sm text-gray-500">Create, publish, and manage course modules.</p>
                </div>
                <Link to="/admin/courses/new">
                    <Button>Create Course</Button>
                </Link>
            </div>

            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">{success}</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">{error}</div>}

            <Card className="p-4">
                <form onSubmit={onSearch} className="flex gap-2">
                    <input
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Search by title"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!loading && courses.map((course) => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{course.is_published ? 'Published' : 'Draft'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{course.created_by_email || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex gap-2">
                                            <Link to={`/admin/courses/${course.id}`}>
                                                <Button type="button" className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                                                    Manage
                                                </Button>
                                            </Link>
                                            <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => onDeleteCourse(course.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <p className="p-6 text-sm text-gray-500">Loading courses...</p>}
                    {!loading && courses.length === 0 && (
                        <p className="p-6 text-sm text-gray-500">No courses found.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ContentManagement;

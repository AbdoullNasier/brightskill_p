import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { MdDelete, MdAdd } from 'react-icons/md';
import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';

const ContentManagement = () => {
    const [categories, setCategories] = useState([]);
    const [modules, setModules] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [newCategory, setNewCategory] = useState('');
    const [newModule, setNewModule] = useState({
        title: '',
        description: '',
        thumbnail: '',
        category: '',
    });

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});
    }, [categories]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [cats, mods] = await Promise.all([
                apiGet('/courses/categories/'),
                apiGet('/courses/modules/'),
            ]);
            setCategories(cats);
            setModules(mods);
        } catch (err) {
            setError(err.message || 'Failed to load course content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await apiPost('/courses/categories/', { name: newCategory.trim(), description: '' });
            setNewCategory('');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to create category');
        }
    };

    const handleAddModule = async () => {
        if (!newModule.title.trim() || !newModule.category) {
            setError('Module title and category are required');
            return;
        }
        try {
            await apiPost('/courses/modules/', {
                title: newModule.title.trim(),
                description: newModule.description.trim(),
                thumbnail: newModule.thumbnail.trim() || null,
                category: Number(newModule.category),
            });
            setNewModule({ title: '', description: '', thumbnail: '', category: '' });
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to create module');
        }
    };

    const handleDeleteModule = async (id) => {
        if (!window.confirm('Delete this module?')) return;
        try {
            await apiDelete(`/courses/modules/${id}/`);
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to delete module');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5 space-y-3">
                    <h2 className="font-bold text-gray-800">Create Category</h2>
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="e.g. Leadership"
                    />
                    <Button onClick={handleAddCategory} className="w-full">
                        <span className="inline-flex items-center gap-2"><MdAdd /> Add Category</span>
                    </Button>
                </Card>

                <Card className="p-5 space-y-3">
                    <h2 className="font-bold text-gray-800">Create Module</h2>
                    <input
                        value={newModule.title}
                        onChange={(e) => setNewModule((p) => ({ ...p, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Module title"
                    />
                    <textarea
                        value={newModule.description}
                        onChange={(e) => setNewModule((p) => ({ ...p, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        rows={3}
                        placeholder="Module description"
                    />
                    <input
                        value={newModule.thumbnail}
                        onChange={(e) => setNewModule((p) => ({ ...p, thumbnail: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                        placeholder="Thumbnail URL (optional)"
                    />
                    <select
                        value={newModule.category}
                        onChange={(e) => setNewModule((p) => ({ ...p, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg p-2.5"
                    >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <Button onClick={handleAddModule} className="w-full">
                        <span className="inline-flex items-center gap-2"><MdAdd /> Add Module</span>
                    </Button>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-800">Modules</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!loading && modules.map((module) => (
                                <tr key={module.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{module.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{categoryMap[module.category] || module.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteModule(module.id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete module"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <p className="p-6 text-sm text-gray-500">Loading content...</p>}
                </div>
            </Card>
        </div>
    );
};

export default ContentManagement;

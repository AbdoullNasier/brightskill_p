import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { MdArrowBack, MdQuiz } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const LessonView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const courseId = Number(id);
    const { apiRequest, updateCourseProgress } = useAuth();

    const [course, setCourse] = useState(null);
    const [moduleItem, setModuleItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const [courseRes, moduleRes] = await Promise.all([
                    apiRequest(`/courses/${courseId}/`),
                    apiRequest(`/courses/${courseId}/modules/`),
                ]);

                if (courseRes.ok) {
                    setCourse(await courseRes.json());
                }

                if (moduleRes.ok) {
                    const modules = await moduleRes.json();
                    if (Array.isArray(modules) && modules.length > 0) {
                        setModuleItem(modules[0]);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadLesson();
    }, [courseId]);

    const handleTakeQuiz = async () => {
        // Keep existing progress behavior tied to lessons if present in course setup.
        try {
            const legacyLessonRes = await apiRequest(`/courses/lessons/?course=${courseId}`);
            if (legacyLessonRes.ok) {
                const legacyLessons = await legacyLessonRes.json();
                if (Array.isArray(legacyLessons) && legacyLessons.length > 0) {
                    await updateCourseProgress(courseId, legacyLessons[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        }
        navigate(`/quiz/${courseId}`);
    };

    if (loading) {
        return <div className="max-w-4xl mx-auto py-8 px-4">Loading lesson...</div>;
    }

    if (!moduleItem) {
        return <div className="max-w-4xl mx-auto py-8 px-4">No modules found for this course yet.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center">
                <MdArrowBack className="mr-2" /> Back to Learning Path
            </Button>

            <Card className="p-0 overflow-hidden mb-6">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{moduleItem.title}</h1>
                    <p className="text-gray-600 mb-2">Course: {course?.title}</p>
                    <p className="text-gray-600 mb-6">Module order: {moduleItem.order_index}</p>

                    {moduleItem.youtube_url && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Module Video</p>
                            {moduleItem.embed_url ? (
                                <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                                    <iframe
                                        title={`${moduleItem.title} video`}
                                        src={moduleItem.embed_url}
                                        className="h-full w-full"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <a
                                    href={moduleItem.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 underline"
                                >
                                    Open lesson video
                                </a>
                            )}
                        </div>
                    )}

                    <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                        {moduleItem.content || moduleItem.description || 'No reading content provided for this module.'}
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleTakeQuiz} className="flex items-center text-lg px-8 py-3">
                    <MdQuiz className="mr-2" /> Mark Lesson Complete & Take Quiz
                </Button>
            </div>
        </div>
    );
};

export default LessonView;

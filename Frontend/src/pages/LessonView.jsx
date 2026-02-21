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
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const [courseRes, lessonRes] = await Promise.all([
                    apiRequest(`/courses/courses/${courseId}/`),
                    apiRequest(`/courses/lessons/?course=${courseId}`),
                ]);

                if (courseRes.ok) {
                    setCourse(await courseRes.json());
                }

                if (lessonRes.ok) {
                    const lessons = await lessonRes.json();
                    if (Array.isArray(lessons) && lessons.length > 0) {
                        setLesson(lessons[0]);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadLesson();
    }, [courseId]);

    const handleTakeQuiz = async () => {
        if (lesson?.id) {
            try {
                await updateCourseProgress(courseId, lesson.id);
            } catch (error) {
                console.error(error);
            }
        }
        navigate(`/quiz/${courseId}`);
    };

    if (loading) {
        return <div className="max-w-4xl mx-auto py-8 px-4">Loading lesson...</div>;
    }

    if (!lesson) {
        return <div className="max-w-4xl mx-auto py-8 px-4">No lessons found for this course yet.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center">
                <MdArrowBack className="mr-2" /> Back to Learning Path
            </Button>

            <Card className="p-0 overflow-hidden mb-6">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
                    <p className="text-gray-600 mb-2">Course: {course?.title}</p>
                    <p className="text-gray-600 mb-6">Lesson order: {lesson.order}</p>

                    <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{lesson.content}</div>
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

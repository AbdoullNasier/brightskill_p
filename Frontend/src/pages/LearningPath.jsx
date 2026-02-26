import React, { useEffect, useMemo, useState } from 'react';
import { MdCheckCircle, MdLock, MdSchool, MdLightbulb } from 'react-icons/md';
import Button from '../components/Button';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LearningPath = () => {
    const navigate = useNavigate();
    const { activeCourseId, userProgress, apiRequest } = useAuth();

    const [learningPath, setLearningPath] = useState(null);
    const [activeCourse, setActiveCourse] = useState(null);
    const [courseModules, setCourseModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const pathRes = await apiRequest('/interview/path/');
                if (pathRes.ok) {
                    const pathData = await pathRes.json();
                    setLearningPath(pathData);
                }

                if (activeCourseId) {
                    const [courseRes, modulesRes] = await Promise.all([
                        apiRequest(`/courses/${activeCourseId}/`),
                        apiRequest(`/courses/${activeCourseId}/modules/`),
                    ]);

                    if (courseRes.ok) {
                        setActiveCourse(await courseRes.json());
                    }
                    if (modulesRes.ok) {
                        const modules = await modulesRes.json();
                        setCourseModules(Array.isArray(modules) ? modules : []);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeCourseId]);

    const aiSteps = useMemo(() => {
        if (!learningPath) return [];
        const fromWeekly = String(learningPath.weekly_plan || '')
            .split(';')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item, index) => ({
                id: index + 1,
                title: item,
                description: learningPath.summary,
                reason: learningPath.focus_areas?.[index] || 'AI Focus',
                status: index === 0 ? 'in-progress' : 'locked',
                duration: '1 week',
                type: 'plan',
            }));

        return fromWeekly;
    }, [learningPath]);

    const courseSteps = useMemo(() => {
        if (!activeCourse) return [];
        const percent = Number(userProgress[activeCourse.id] || 0);
        return courseModules.map((module, index) => ({
            id: module.id,
            title: module.title,
            description: `Module ${module.order_index} in ${activeCourse.title}`,
            reason: activeCourse.skill_name || 'Course progression',
            status: percent >= (((index + 1) / Math.max(courseModules.length, 1)) * 100) ? 'completed' : index === 0 ? 'in-progress' : 'locked',
            duration: '30m',
            type: 'module',
        }));
    }, [activeCourse, courseModules, userProgress]);

    const steps = aiSteps.length > 0 ? aiSteps : courseSteps;

    if (loading) {
        return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">Loading learning path...</div>;
    }

    if (!steps.length) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                    <MdSchool className="text-6xl text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Learning Path</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Complete your assessment to generate an AI learning path, or enroll in a course.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg" className="px-8">
                        Go to Dashboard
                    </Button>
                    <Button onClick={() => navigate('/skills')} size="lg" className="px-8">
                        Browse Skills
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{learningPath?.title || activeCourse?.title || 'Learning Path'}</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">{learningPath?.summary || activeCourse?.description}</p>
            </div>

            <div className="relative max-w-3xl mx-auto">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={step.id || index} className="relative pl-24 group">
                            <div className="absolute left-8 top-8 w-16 h-0.5 bg-gray-200"></div>

                            <div
                                className={`
                                absolute left-4 top-4 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center
                                ${step.status === 'completed' ? 'bg-emerald-500' : step.status === 'in-progress' ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-gray-300'}
                            `}
                            >
                                {step.status === 'completed' && <MdCheckCircle className="text-white text-lg" />}
                                {step.status === 'locked' && <MdLock className="text-white text-sm" />}
                            </div>

                            <Card
                                className={`
                                transition-all duration-300 relative overflow-hidden
                                ${step.status === 'in-progress' ? 'border-2 border-indigo-100 shadow-lg transform scale-[1.02]' : 'hover:shadow-md'}
                                ${step.status === 'locked' ? 'opacity-75 grayscale-[0.5]' : ''}
                            `}
                            >
                                {step.reason && (
                                    <div className="absolute top-0 right-0 bg-indigo-50 px-3 py-1 rounded-bl-xl border-l border-b border-indigo-100 flex items-center gap-1">
                                        <MdLightbulb className="text-yellow-500 text-xs" />
                                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">AI Why: {step.reason}</span>
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                                    <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                                        <span className="uppercase font-semibold tracking-wider text-xs">{step.type}</span>
                                        <span>•</span>
                                        <span>{step.duration}</span>
                                    </div>
                                    <p className="text-gray-600 mb-6">{step.description}</p>

                                    {step.status !== 'locked' ? (
                                        <Button onClick={() => navigate(`/lesson/${activeCourseId || step.id}`)} className="w-full sm:w-auto">
                                            {step.status === 'completed' ? 'Review Module' : 'Start Module'}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center text-gray-400 text-sm italic">
                                            <MdLock className="mr-2" /> Complete previous step to unlock
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LearningPath;

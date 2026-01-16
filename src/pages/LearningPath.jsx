import React, { useEffect, useState } from 'react';
import { MdCheckCircle, MdRadioButtonUnchecked, MdLock, MdPlayArrow, MdSchool } from 'react-icons/md';
import Button from '../components/Button';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillsData } from '../data/skillsData';

const LearningPath = () => {
    const navigate = useNavigate();
    const { activeCourseId, userProgress, completedCourses } = useAuth();
    const [currentCourse, setCurrentCourse] = useState(null);

    useEffect(() => {
        if (activeCourseId) {
            const course = skillsData.find(s => s.id === activeCourseId);
            setCurrentCourse(course);
        } else if (completedCourses.length > 0) {
            // Optional: Show last completed course context
            const lastId = completedCourses[completedCourses.length - 1];
            const course = skillsData.find(s => s.id === lastId);
            setCurrentCourse(course);
        } else {
            setCurrentCourse(null);
        }
    }, [activeCourseId, completedCourses]);

    // Mock steps generator based on course
    const getCourseSteps = (course) => {
        if (!course) return [];
        // In a real app, this would come from a database based on course ID
        return [
            {
                id: course.id, // Linking broadly to the course ID for now
                title: `${course.title}: Fundamentals`,
                description: `Master the basics of ${course.title}.`,
                status: userProgress[course.id] >= 100 ? "completed" : "in-progress",
                duration: "2h 30m"
            },
            {
                id: 99, // Placeholder
                title: "Advanced Concepts",
                description: "Deep dive into complex scenarios.",
                status: "locked",
                duration: "1h 45m"
            }
        ];
    };

    if (!currentCourse) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                    <MdSchool className="text-6xl text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">No Active Learning Path</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    You haven't enrolled in any course yet. Visit the Skills page to start your journey.
                </p>
                <Button onClick={() => navigate('/skills')} size="lg" className="px-8">
                    Explore Skills
                </Button>
            </div>
        );
    }

    const steps = getCourseSteps(currentCourse);
    const progress = userProgress[currentCourse.id] || 0;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Path</h1>
                    <p className="text-gray-600">Track: <span className="font-semibold text-primary">{currentCourse.title}</span></p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500 mb-1">Overall Progress</p>
                    <div className="text-2xl font-bold text-primary">{progress}%</div>
                </div>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-gray-200 hidden md:block"></div>

                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col md:flex-row md:items-start group">

                            {/* Icon Marker */}
                            <div className="hidden md:flex flex-shrink-0 z-10 w-12 h-12 rounded-full items-center justify-center bg-white border-4 border-white shadow-sm mr-6">
                                {step.status === 'completed' ? (
                                    <MdCheckCircle className="text-3xl text-emerald-500" />
                                ) : step.status === 'in-progress' ? (
                                    <div className="relative flex items-center justify-center">
                                        <span className="absolute w-full h-full rounded-full bg-primary/20 animate-ping"></span>
                                        <MdRadioButtonUnchecked className="text-3xl text-primary relative z-10" />
                                    </div>
                                ) : (
                                    <MdLock className="text-2xl text-gray-300" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1">
                                <Card className={`relative ${step.status === 'locked' ? 'bg-gray-50 opacity-70' : ''}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                                    {step.status.replace('-', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400">• {step.duration}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-gray-600 text-sm">{step.description}</p>
                                        </div>

                                        <div>
                                            {step.status === 'in-progress' && (
                                                <Button onClick={() => navigate(`/lesson/${step.id}`)} className="flex items-center gap-2">
                                                    <MdPlayArrow /> Continue
                                                </Button>
                                            )}
                                            {step.status === 'completed' && (
                                                <Button onClick={() => navigate(`/lesson/${step.id}`)} variant="outline" className="text-sm">Review</Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default LearningPath;

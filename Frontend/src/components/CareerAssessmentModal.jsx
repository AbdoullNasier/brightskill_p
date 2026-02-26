import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdWork, MdClose, MdPsychology } from 'react-icons/md';
import { postAI } from '../utils/aiClient';

const CareerAssessmentModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [view, setView] = useState('intro');
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [assessmentId, setAssessmentId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setView('intro');
        setStep(0);
        setError('');
        setAssessmentId(null);
        setQuestions([]);
        setResponses({});
        setAnalysisResult(null);
        setIsSubmitting(false);
    }, [isOpen]);

    const progress = Math.min(Math.round(((step + 1) / 10) * 100), 100);
    const currentQuestion = questions[step];

    const handleStart = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const data = await postAI('/interview/start/', {});
            const firstQuestion = data?.question;
            if (!data?.assessment_id || !firstQuestion?.question_key || !firstQuestion?.question_text) {
                throw new Error('Failed to start interview.');
            }

            setAssessmentId(data.assessment_id);
            setQuestions([{ key: firstQuestion.question_key, title: firstQuestion.question_text }]);
            setStep(0);
            setView('form');
        } catch (err) {
            setError(err.message || 'Failed to start interview.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateResponse = (key, value) => {
        setResponses((prev) => ({ ...prev, [key]: value }));
        setError('');
    };

    const handleNext = async () => {
        if (!currentQuestion || !assessmentId) {
            setError('Interview session not initialized. Please restart.');
            return;
        }

        const value = responses[currentQuestion.key];
        if (!value || !String(value).trim()) {
            setError('Please answer this question before continuing.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const answerData = await postAI('/interview/answer/', {
                assessment_id: assessmentId,
                question_key: currentQuestion.key,
                question_text: currentQuestion.title,
                response_text: String(value).trim(),
            });

            if (answerData?.is_complete) {
                setView('analyzing');
                const finishData = await postAI('/interview/finish/', { assessment_id: assessmentId });
                setAnalysisResult(finishData?.learning_path || null);
                setView('complete');
                return;
            }

            const nextQuestion = answerData?.next_question;
            if (!nextQuestion?.question_key || !nextQuestion?.question_text) {
                throw new Error('Interview returned an invalid next question.');
            }
            setQuestions((prev) => [...prev, { key: nextQuestion.question_key, title: nextQuestion.question_text }]);
            setStep((prev) => prev + 1);
        } catch (err) {
            setError(err.message || 'Failed to save interview responses.');
            if (view === 'analyzing') setView('form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = () => {
        navigate('/learning-path');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden transform transition-all ${view === 'intro' ? 'max-w-md' : 'max-w-2xl min-h-[560px] flex flex-col'}`}>
                {view === 'intro' && (
                    <div className="bg-indigo-600 p-6 text-center relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                            <MdClose size={24} />
                        </button>
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MdPsychology className="text-white text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Career Assessment</h2>
                        <p className="text-white/90 text-sm mt-2">Answer required questions to generate your real AI learning path.</p>
                    </div>
                )}

                {view === 'form' && (
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-full"><MdPsychology size={20} /></div>
                            <span className="font-bold">Personalization Form</span>
                        </div>
                        <button onClick={onClose}><MdClose size={24} /></button>
                    </div>
                )}

                <div className={`${view === 'intro' ? 'p-6' : 'flex-1 bg-gray-50 p-6'}`}>
                    {view === 'intro' && (
                        <div className="text-center">
                            <p className="text-gray-600 mb-6">This form saves your responses in the database and creates a personalized path.</p>
                            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                            <div className="space-y-3">
                                <button onClick={handleStart} disabled={isSubmitting} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                    <MdWork /> Start Assessment
                                </button>
                                <button onClick={onClose} className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'form' && currentQuestion && (
                        <div className="h-full flex flex-col">
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Question {step + 1}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">{currentQuestion.title}</h3>
                                <textarea
                                    rows="5"
                                    value={responses[currentQuestion.key] || ''}
                                    onChange={(e) => updateResponse(currentQuestion.key, e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                            </div>

                            <div className="mt-5 flex items-center justify-end">
                                <button onClick={handleNext} disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Saving...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'analyzing' && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-gray-800">Analyzing Responses...</h3>
                            <p className="text-gray-500 mt-2">Building your personalized learning path now.</p>
                        </div>
                    )}

                    {view === 'complete' && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <MdWork size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Assessment Complete</h3>
                            <p className="text-gray-600 mt-2 mb-8 max-w-sm">{analysisResult?.title || 'Your learning path is ready.'}</p>
                            <button onClick={handleFinish} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
                                View My Learning Path
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerAssessmentModal;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdWork, MdClose, MdPsychology } from 'react-icons/md';

const CareerAssessmentModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleTakeInterview = () => {
        navigate('/ai-interview');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <MdPsychology className="text-white text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Find Your Path</h2>
                    <p className="text-white/90 text-sm mt-2">Let AI guide your career journey</p>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Take a quick AI-powered interview to discover the perfect career path tailored to your soft skills and strengths.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleTakeInterview}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <MdWork />
                            Start Career Interview
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerAssessmentModal;

import React, { useState, useRef, useEffect } from 'react';
import { MdSend, MdMic, MdSmartToy, MdPerson } from 'react-icons/md';
import Button from '../components/Button';
import { useGamification } from '../context/GamificationContext';
import { useLanguage } from '../context/LanguageContext';
import { getAI, postAI } from '../utils/aiClient';

const AIRolePlay = () => {
    const { addXp } = useGamification();
    const { language } = useLanguage();
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Conversation State
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const autoGrowTextarea = () => {
        if (!inputRef.current) return;
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    };

    useEffect(() => {
        autoGrowTextarea();
    }, [inputText]);

    // Load last session for reference
    useEffect(() => {
        if (messages.length !== 0) return;

        const loadSessionOrGreeting = async () => {
            setIsTyping(true);
            try {
                const history = await getAI('/roleplay/history/');
                if (Array.isArray(history) && history.length > 0) {
                    const latest = history[0];
                    setSessionId(latest.id);
                    const mapped = (latest.messages || []).map((msg) => ({
                        id: msg.id,
                        sender: msg.role === 'ai' ? 'ai' : 'user',
                        text: msg.content,
                    }));
                    if (mapped.length > 0) {
                        setMessages(mapped);
                    } else {
                        setMessages([{
                            id: 1,
                            sender: 'ai',
                            text: 'Share a workplace soft-skill scenario and I will role-play it with you.',
                        }]);
                    }
                } else {
                    setMessages([{
                        id: 1,
                        sender: 'ai',
                        text: 'Share a workplace soft-skill scenario and I will role-play it with you.',
                    }]);
                }
            } catch (err) {
                setMessages([{
                    id: 1,
                    sender: 'ai',
                    text: "AI roleplay is unavailable right now. Please try again shortly.",
                }]);
                console.error(err);
            } finally {
                setIsTyping(false);
            }
        };

        loadSessionOrGreeting();
    }, [messages.length]);

    // Auto-scroll logic
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const submittedText = inputText;
        const userMsg = { id: messages.length + 1, sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const data = await postAI('/roleplay/', {
                prompt: submittedText,
                session_id: sessionId || undefined,
                language: language === 'HA' ? 'hausa' : 'english',
            });
            const aiMsg = { id: messages.length + 2, sender: 'ai', text: data.reply };
            setMessages(prev => [...prev, aiMsg]);
            if (data.session_id) {
                setSessionId(data.session_id);
            }
            setIsTyping(false);

            if (data.xp_awarded) addXp(data.xp_awarded);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: messages.length + 2,
                sender: 'ai',
                text: err?.message || "I could not reach the AI service. Please try again.",
            }]);
            setIsTyping(false);
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">AI Assistant Coach</h1>
                <p className="text-gray-600">Your personal guide for career advice and soft skill development.</p>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Chat Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scroll-smooth"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex max-w-[80%] ${msg.sender === 'user'
                                    ? 'flex-row-reverse space-x-reverse'
                                    : 'flex-row'
                                    } space-x-3`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-emerald-500 text-white'
                                    }`}>
                                    {msg.sender === 'user' ? <MdPerson /> : <MdSmartToy />}
                                </div>

                                <div
                                    className={`p-4 rounded-2xl whitespace-pre-wrap ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <MdSmartToy />
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition-colors">
                            <MdMic size={24} />
                        </button>
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask me anything..."
                            rows={1}
                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-40 overflow-y-auto leading-relaxed"
                        />
                        <Button
                            onClick={handleSend}
                            className="!p-3 rounded-xl flex items-center justify-center"
                            disabled={!inputText.trim() || isTyping}
                        >
                            <MdSend size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AIRolePlay;


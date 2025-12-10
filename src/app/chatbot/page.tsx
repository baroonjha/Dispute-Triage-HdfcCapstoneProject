'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! I am your Dispute Resolution Assistant. I can help you with policy questions, status checks, or lodging a dispute. How can I assist you today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [escalationTriggered, setEscalationTriggered] = useState(false);
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'pending' | 'happy' | 'unhappy' | 'submitted'>('pending');
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [disputeDetails, setDisputeDetails] = useState({
        amount: '',
        issueCategory: '',
        channel: 'Chatbot',
        priority: 'L2',
        description: '',
    });
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [extractionError, setExtractionError] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: messages,
                }),
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.content },
            ]);

            if (data.shouldEscalate) {
                setEscalationTriggered(true);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: '⚠️ System is experiencing high traffic or API limits. AI features are temporarily unavailable. Please use the "Raise Dispute" button below to proceed manually.' },
            ]);
            // Force end chat to show options
            setIsChatEnded(true);
            setFeedbackStatus('unhappy'); // Skip straight to "unhappy" flow which shows Raise Dispute
        } finally {
            setLoading(false);
        }
    };

    const handleEscalation = () => {
        // Redirect to portal with pre-filled intent (mocked by just redirecting for now)
        router.push('/portal');
    };

    const handleEndChat = () => {
        setIsChatEnded(true);
    };

    const handleFeedback = (status: 'happy' | 'unhappy') => {
        setFeedbackStatus(status);
        if (status === 'happy') {
            // Thank user
        }
    };

    const handleRaiseDispute = async () => {
        setIsExtracting(true);
        setExtractionError(false);
        try {
            const res = await fetch('/api/extract-dispute-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: messages }),
            });

            if (!res.ok) throw new Error('Extraction failed');

            const data = await res.json();
            setDisputeDetails({
                amount: data.amount || '',
                issueCategory: data.issueCategory || '',
                channel: data.channel || 'Chatbot',
                priority: data.priority || 'L2',
                description: '',
            });
            setShowDisputeForm(true);
        } catch (error) {
            console.error('Error extracting details:', error);
            setExtractionError(true);
            // Show form with empty details (but valid defaults) and error flag
            setDisputeDetails({
                amount: '',
                issueCategory: '',
                channel: 'Chatbot',
                priority: 'L2',
                description: '',
            });
            setShowDisputeForm(true);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmitDispute = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-123', // Mock User ID
                    ...disputeDetails,
                }),
            });
            const data = await res.json();
            if (data.ticketId) {
                setTicketId(data.ticketId);
                setFeedbackStatus('submitted');
                setShowDisputeForm(false);
            }
        } catch (error) {
            console.error('Error submitting dispute:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-2">
                            <Bot className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">AI Assistant</h2>
                            <p className="text-sm text-slate-500">Powered by Gemini</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {escalationTriggered && (
                            <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600 animate-pulse">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Escalation Recommended</span>
                            </div>
                        )}
                        {!isChatEnded && (
                            <button
                                onClick={handleEndChat}
                                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                End Chat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            'flex w-full',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={clsx(
                                'flex max-w-[80%] items-start gap-3 rounded-2xl p-4',
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-900'
                            )}
                        >
                            <div className="mt-1 shrink-0">
                                {msg.role === 'user' ? (
                                    <User className="h-5 w-5 opacity-70" />
                                ) : (
                                    <Bot className="h-5 w-5 opacity-70" />
                                )}
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Escalation Action */}
            {escalationTriggered && (
                <div className="bg-red-50 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-red-800">
                            It seems like you have an urgent issue. Would you like to lodge a formal dispute?
                        </p>
                        <button
                            onClick={handleEscalation}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Lodge Dispute Now
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            {/* Feedback & Dispute Section */}
            {isChatEnded && feedbackStatus !== 'submitted' && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                    {feedbackStatus === 'pending' ? (
                        <div className="text-center">
                            <h3 className="mb-4 text-lg font-medium text-slate-900">
                                Are you happy with the resolution?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => handleFeedback('happy')}
                                    className="flex items-center gap-2 rounded-lg bg-green-100 px-6 py-3 text-green-700 hover:bg-green-200"
                                >
                                    <ThumbsUp className="h-5 w-5" />
                                    Yes, thanks!
                                </button>
                                <button
                                    onClick={() => handleFeedback('unhappy')}
                                    className="flex items-center gap-2 rounded-lg bg-red-100 px-6 py-3 text-red-700 hover:bg-red-200"
                                >
                                    <ThumbsDown className="h-5 w-5" />
                                    No, I need help
                                </button>
                            </div>
                        </div>
                    ) : feedbackStatus === 'happy' ? (
                        <div className="text-center text-green-600">
                            <p className="font-medium">Thank you for your feedback!</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="mb-4 text-slate-600">
                                We are sorry to hear that. Would you like to raise a formal dispute?
                            </p>
                            <button
                                onClick={handleRaiseDispute}
                                disabled={isExtracting}
                                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isExtracting ? 'Analyzing Chat...' : 'Raise Dispute'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Ticket Success Message */}
            {ticketId && (
                <div className="border-t border-slate-200 bg-green-50 p-6 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <ThumbsUp className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Dispute Registered Successfully</h3>
                    <p className="text-green-700">Your Ticket ID is: <span className="font-mono font-bold">{ticketId}</span></p>
                    {/* <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 text-sm font-medium text-green-700 underline"
                    >
                        Go to Dashboard
                    </button> */}
                </div>
            )}

            {/* Input - Hide if chat ended */}
            {!isChatEnded && (
                <div className="border-t border-slate-200 p-4">
                    <form onSubmit={handleSend} className="flex gap-4">
                        <input
                            type="text"
                            className="text-black flex-1 rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Dispute Form Modal */}
            {showDisputeForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Lodge Dispute</h3>
                            <button onClick={() => setShowDisputeForm(false)} className="text-slate-500 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {extractionError && (
                            <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
                                <p className="font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Auto-fill failed
                                </p>
                                <p className="mt-1">System is busy. Please fill in the details manually.</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmitDispute} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                                    value={disputeDetails.amount}
                                    onChange={(e) => setDisputeDetails({ ...disputeDetails, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Describe your issue</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                                    value={disputeDetails.issueCategory}
                                    onChange={(e) => setDisputeDetails({ ...disputeDetails, issueCategory: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Channel</label>
                                <select
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                                    value={disputeDetails.channel}
                                    onChange={(e) => setDisputeDetails({ ...disputeDetails, channel: e.target.value })}
                                >
                                    <option value="Chatbot">Chatbot</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="Net Banking">Net Banking</option>
                                    <option value="ATM">ATM</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDisputeForm(false)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

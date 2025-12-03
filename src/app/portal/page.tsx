'use client';

import { useState } from 'react';
import { Search, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { IDispute } from '@/models/Dispute';

export default function PortalPage() {
    const [activeTab, setActiveTab] = useState<'lodge' | 'status'>('lodge');

    // Lodge Form State
    const [formData, setFormData] = useState({
        userId: '',
        amount: '',
        txnId: '',
        channel: 'UPI',
        issueCategory: 'Amount Deducted but not Credited',
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submittedTicket, setSubmittedTicket] = useState<IDispute | null>(null);

    // Status Check State
    const [checkId, setCheckId] = useState('');
    const [statusResult, setStatusResult] = useState<IDispute[]>([]);
    const [checkStatus, setCheckStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleLodgeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('idle');

        try {
            const res = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: formData.userId,
                    amount: Number(formData.amount),
                    channel: formData.channel,
                    issueCategory: formData.issueCategory,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setSubmittedTicket(data);
                setSubmitStatus('success');
                setFormData({ ...formData, amount: '', txnId: '' }); // Reset some fields
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting dispute:', error);
            setSubmitStatus('error');
        }
    };

    const handleStatusCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckStatus('loading');

        try {
            // Try fetching by Ticket ID first, then User ID
            // Our API supports filtering by userId. For Ticket ID we might need to filter client side or add specific param.
            // Let's use the general GET and filter client side for now or improve API.
            // Actually, let's try to fetch by userId if it looks like one, or we can add a search param.
            // For simplicity, let's assume the user enters User ID to see all their tickets.

            const res = await fetch(`/api/disputes?userId=${checkId}`);
            const data = await res.json();

            if (data && data.length > 0) {
                setStatusResult(data);
                setCheckStatus('success');
            } else {
                // Try checking if it's a specific ticket ID
                const resTicket = await fetch(`/api/disputes/${checkId}`);
                if (resTicket.ok) {
                    const ticketData = await resTicket.json();
                    setStatusResult([ticketData]);
                    setCheckStatus('success');
                } else {
                    setStatusResult([]);
                    setCheckStatus('error');
                }
            }
        } catch (error) {
            console.error('Error checking status:', error);
            setCheckStatus('error');
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Customer Portal</h1>
                <p className="mt-2 text-slate-500">
                    Lodge a new dispute or check the status of an existing one.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('lodge')}
                    className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'lodge'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    📝 Lodge a New Dispute
                </button>
                <button
                    onClick={() => setActiveTab('status')}
                    className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'status'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    🔍 Check Dispute Status
                </button>
            </div>

            {/* Content */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                {activeTab === 'lodge' ? (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                We are sorry you are facing an issue. Please provide details below for instant assistance.
                            </p>
                        </div>

                        <form onSubmit={handleLodgeSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">User ID / Customer ID</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g., CUST-12345"
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Transaction Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Transaction ID</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.txnId}
                                        onChange={(e) => setFormData({ ...formData, txnId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Channel</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.channel}
                                        onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                    >
                                        <option>UPI</option>
                                        <option>Card</option>
                                        <option>NetBanking</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700">Issue Type</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.issueCategory}
                                        onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                                    >
                                        <option>Amount Deducted but not Credited</option>
                                        <option>Transaction Failed</option>
                                        <option>Fraudulent Transaction</option>
                                        <option>Double Debit</option>
                                        <option>Wrong Beneficiary</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Dispute
                                </button>
                            </div>
                        </form>

                        {submitStatus === 'success' && submittedTicket && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">Dispute Registered Successfully!</h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Ticket ID: <span className="font-bold">{submittedTicket.ticketId}</span></p>
                                            <p>Priority Assigned: {submittedTicket.priority}</p>
                                            <p>Status: {submittedTicket.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <form onSubmit={handleStatusCheck} className="flex gap-4">
                            <div className="flex-1">
                                <label className="sr-only">Ticket ID or User ID</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg border border-slate-300 pl-10 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Enter Ticket ID or User ID"
                                        value={checkId}
                                        onChange={(e) => setCheckId(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                            >
                                Check Status
                            </button>
                        </form>

                        {checkStatus === 'loading' && <p className="text-center text-slate-500">Searching...</p>}

                        {checkStatus === 'error' && (
                            <div className="text-center text-red-500">
                                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                No records found. Please check the ID.
                            </div>
                        )}

                        {checkStatus === 'success' && statusResult.length > 0 && (
                            <div className="space-y-4">
                                {statusResult.map((ticket) => (
                                    <div key={ticket.ticketId} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900">Ticket: {ticket.ticketId}</p>
                                                <p className="text-sm text-slate-500">Issue: {ticket.issueCategory}</p>
                                                <p className="text-sm text-slate-500">Amount: ₹{ticket.amount}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                                <p className="mt-1 text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 border-t border-slate-100 pt-3">
                                            <p className="text-sm text-slate-700"><strong>Action:</strong> {ticket.recommendedAction}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

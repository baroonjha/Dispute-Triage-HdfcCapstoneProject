'use client';

import { useState } from 'react';
import { Search, Send, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { IDispute } from '@/models/Dispute';

export default function PortalPage() {
    const [activeTab, setActiveTab] = useState<'lodge' | 'status'>('status');

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
        <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 sm:p-10">
            <div className="mx-auto max-w-5xl">
                {/* Header Section */}
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Check <span className="text-blue-600">Dispute</span> Status
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                        Track the status of your existing disputes or lodge a new complaint. We are here to help you resolve issues quickly.
                    </p>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        {/* Lodge Tab (Disabled/Hidden based on user request, but keeping structure) */}
                        {/* 
                        <button
                            onClick={() => setActiveTab('lodge')}
                            className={`flex-1 py-6 text-center text-sm font-semibold transition-all hover:bg-white ${activeTab === 'lodge'
                                    ? 'border-b-2 border-blue-600 bg-white text-blue-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Lodge a Dispute
                        </button>
                        */}
                        <button
                            onClick={() => setActiveTab('status')}
                            className={`flex-1 py-6 text-center text-base font-semibold transition-all ${activeTab === 'status'
                                ? 'border-b-2 border-blue-600 bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:bg-white hover:text-slate-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Search className="h-5 w-5" />
                                Check Dispute Status
                            </div>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 sm:p-12">
                        {activeTab === 'lodge' ? (
                            <div className="space-y-8">
                                <div className="rounded-xl bg-blue-50 p-6 border border-blue-100">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <ShieldCheck className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-blue-900">Secure Dispute Filing</h3>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Please provide accurate details to help us process your request faster. All submissions are encrypted and secure.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleLodgeSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">User ID / Customer ID</label>
                                            <input
                                                type="text"
                                                required
                                                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                placeholder="e.g., CUST-12345"
                                                value={formData.userId}
                                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Transaction Amount (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Transaction ID</label>
                                            <input
                                                type="text"
                                                className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={formData.txnId}
                                                onChange={(e) => setFormData({ ...formData, txnId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Channel</label>
                                            <div className="relative">
                                                <select
                                                    className="block w-full appearance-none rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    value={formData.channel}
                                                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                                >
                                                    <option>UPI</option>
                                                    <option>Card</option>
                                                    <option>NetBanking</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Issue Type</label>
                                            <div className="relative">
                                                <select
                                                    className="block w-full appearance-none rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    value={formData.issueCategory}
                                                    onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                                                >
                                                    <option>Amount Deducted but not Credited</option>
                                                    <option>Transaction Failed</option>
                                                    <option>Fraudulent Transaction</option>
                                                    <option>Double Debit</option>
                                                    <option>Wrong Beneficiary</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="group flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Submit Dispute
                                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </form>

                                {submitStatus === 'success' && submittedTicket && (
                                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                                            <div className="ml-4">
                                                <h3 className="text-lg font-bold text-green-900">Dispute Registered Successfully!</h3>
                                                <div className="mt-2 space-y-1 text-green-800">
                                                    <p>Ticket ID: <span className="font-mono font-bold bg-green-100 px-2 py-0.5 rounded">{submittedTicket.ticketId}</span></p>
                                                    <p>Priority: <span className="font-medium">{submittedTicket.priority}</span></p>
                                                    <p>Current Status: <span className="font-medium">{submittedTicket.status}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="text-center max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-bold text-slate-900">Check Your Status</h2>
                                    <p className="mt-2 text-slate-600">
                                        Enter your unique Ticket ID to get real-time updates on your dispute progress.
                                    </p>
                                </div>

                                <form onSubmit={handleStatusCheck} className="relative mx-auto max-w-3xl">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-4 h-6 w-6 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            className="block w-full rounded-full border-2 border-slate-200 placeholder:text-gray text-black  bg-white pl-12 pr-36 py-4 text-lg shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                            placeholder="Enter Ticket ID (e.g., TKT-123) or User ID"
                                            value={checkId}
                                            onChange={(e) => setCheckId(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Check Status
                                        </button>
                                    </div>
                                </form>

                                {checkStatus === 'loading' && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                                        <p className="mt-4 text-sm font-medium text-slate-500">Searching records...</p>
                                    </div>
                                )}

                                {checkStatus === 'error' && (
                                    <div className="mx-auto max-w-md rounded-xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                                            <AlertCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-red-900">No Records Found</h3>
                                        <p className="mt-2 text-sm text-red-700">
                                            We couldn't find any disputes matching that ID. Please double-check and try again.
                                        </p>
                                    </div>
                                )}

                                {checkStatus === 'success' && statusResult.length > 0 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                            <h3 className="text-lg font-bold text-slate-900">Search Results</h3>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                {statusResult.length} found
                                            </span>
                                        </div>

                                        <div className="grid gap-6">
                                            {statusResult.map((ticket) => (
                                                <div key={ticket.ticketId} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                                                    <div className={`absolute left-0 top-0 h-full w-1.5 ${ticket.status === 'Resolved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

                                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between pl-4">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-mono text-sm font-bold text-slate-400">#{ticket.ticketId}</span>
                                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${ticket.status === 'Resolved'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                        {ticket.status}
                                                                    </span>
                                                                </div>
                                                                <h4 className="mt-2 text-xl font-bold text-slate-900">{ticket.issueCategory}</h4>
                                                            </div>

                                                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-slate-900">₹{ticket.amount.toLocaleString()}</span>
                                                                    <span>Amount</span>
                                                                </div>
                                                                <div className="h-4 w-px bg-slate-200"></div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex-shrink-0 rounded-xl bg-slate-50 p-4 sm:w-64">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recommended Action</p>
                                                            <p className="mt-2 text-sm font-medium text-slate-700 leading-relaxed">
                                                                {ticket.recommendedAction}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    IndianRupeeIcon,
    Search,
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import { IDispute } from '@/models/Dispute';
import clsx from 'clsx';

export default function DashboardPage() {
    const [disputes, setDisputes] = useState<IDispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDisputes();
        }, 500); // Debounce search

        return () => clearTimeout(timer);
    }, [searchQuery, filterPriority, filterStatus]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterPriority) params.append('priority', filterPriority);
            if (filterStatus) params.append('status', filterStatus);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/disputes?${params.toString()}`);
            const data = await res.json();
            setDisputes(data);
        } catch (error) {
            console.error('Failed to fetch disputes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                fetchDisputes();
                alert('File uploaded successfully!');
            } else {
                alert('Upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file.');
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const markResolved = async (ticketId: string) => {
        try {
            await fetch(`/api/disputes/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Resolved',
                    stage: 'Closed - Resolved',
                    priority: 'Resolved',
                    recommendedAction: 'None - Case Closed',
                }),
            });
            fetchDisputes(); // Refresh
        } catch (error) {
            console.error('Failed to resolve dispute', error);
        }
    };

    // Metrics Calculation
    const activeDisputes = disputes.filter((d) => d.status !== 'Resolved');
    const totalValue = activeDisputes.reduce((sum, d) => sum + d.amount, 0);
    const criticalCount = activeDisputes.filter((d) => d.priority === 'L0').length;

    // Filtering - Now handled server-side
    const filteredDisputes = disputes;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray">Admin Dashboard</h1>
                <p className="mt-2 text-slate-500 text-gray-600">
                    Overview of dispute triage and resolution status.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Active Disputes"
                    value={activeDisputes.length}
                    icon={Clock}
                    color="blue"
                />
                <MetricCard
                    title="Value at Risk"
                    value={`₹${totalValue.toLocaleString()}`}
                    icon={IndianRupeeIcon}
                    color="yellow"
                />
                <MetricCard
                    title="Critical Cases (L0)"
                    value={criticalCount}
                    icon={AlertTriangle}
                    color="red"
                />
                <MetricCard
                    title="Resolved Today"
                    value={disputes.filter((d) => d.status === 'Resolved').length}
                    icon={CheckCircle2}
                    color="green"
                />
            </div>

            {/* Critical Alert */}
            {criticalCount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-pulse">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                SLA Breach Alert
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    {criticalCount} critical cases detected. Immediate action
                                    required.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-medium leading-6 text-slate-900">
                            Dispute Worklist
                        </h3>
                        <div className="flex items-center gap-4">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                                {uploading ? 'Uploading...' : 'Upload Excel'}
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 placeholder:text-gray-500 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    className="h-10 w-64 text-black rounded-lg border border-slate-300 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-10 rounded-lg text-gray-500 border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <select
                                className="h-10 rounded-lg text-gray-500 border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <option value="">All Priorities</option>
                                <option value="L0">L0 (Critical)</option>
                                <option value="L1">L1 (High)</option>
                                <option value="L2">L2 (Medium)</option>
                                <option value="L3">L3 (Low)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[75vh] overflow-y-auto relative">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-50">
                                    Ticket ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Channel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Days Open
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Issue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Present Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Days In Stage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Status
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-gray-500 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredDisputes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="mb-4 text-lg text-gray-500">No disputes found.</p>
                                            <button
                                                onClick={async () => {
                                                    setLoading(true);
                                                    await fetch('/api/seed', { method: 'POST' });
                                                    fetchDisputes();
                                                }}
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Load Sample Data
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDisputes.map((dispute) => (
                                    <tr key={dispute.ticketId} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                            {dispute.ticketId}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.channel}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            ₹{dispute.amount.toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.daysOpen} days
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.issueCategory}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span
                                                className={clsx(
                                                    'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                                                    {
                                                        'bg-red-100 text-red-800': dispute.priority === 'L0',
                                                        'bg-orange-100 text-orange-800':
                                                            dispute.priority === 'L1',
                                                        'bg-yellow-100 text-yellow-800':
                                                            dispute.priority === 'L2',
                                                        'bg-blue-100 text-blue-800':
                                                            dispute.priority === 'L3',
                                                        'bg-green-100 text-green-800':
                                                            dispute.priority === 'Resolved',
                                                    }
                                                )}
                                            >
                                                {dispute.priority}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            <div className="max-w-xs truncate" title={dispute.presentStage}>
                                                {dispute.presentStage}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.stage}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.daysInPresentStage}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                            {dispute.status}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            {dispute.status !== 'Resolved' && (
                                                <button
                                                    onClick={() => markResolved(dispute.ticketId)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

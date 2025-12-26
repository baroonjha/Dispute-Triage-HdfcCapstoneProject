'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserCircle, MessageSquareText, ShieldAlert, BookOpen, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen },
    { name: 'Dispute Status', href: '/portal', icon: UserCircle },
    { name: 'Dispute Assistant', href: '/chatbot', icon: MessageSquareText },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="fixed left-4 top-4 z-50 block rounded-md bg-slate-900 p-2 text-white shadow-lg md:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={clsx(
                    'flex flex-col bg-slate-900 text-white shadow-xl transition-all duration-300 ease-in-out',
                    // Mobile: Fixed position, slide in/out
                    'fixed inset-y-0 left-0 z-50 h-full',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                    // Desktop: Relative position, stay in flow, toggle width
                    'md:relative md:translate-x-0',
                    isDesktopCollapsed ? 'md:w-20' : 'md:w-64'
                )}
            >
                {/* Header */}
                <div className={clsx(
                    "flex items-center border-b border-slate-800 transition-all duration-300",
                    isDesktopCollapsed ? "justify-center h-16 px-0" : "justify-between h-16 px-4"
                )}>
                    {!isDesktopCollapsed && (
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <ShieldAlert className="h-8 w-8 text-blue-500 shrink-0" />
                            <span className="text-xl font-bold tracking-tight">DisputeGuard</span>
                        </div>
                    )}
                    {isDesktopCollapsed && (
                        <ShieldAlert className="h-8 w-8 text-blue-500 shrink-0" />
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className="hidden rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white md:block"
                    >
                        {isDesktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 px-2 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)} // Close on navigate (mobile)
                                className={clsx(
                                    'group flex items-center rounded-md py-2 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                    isDesktopCollapsed ? 'justify-center px-0' : 'px-2'
                                )}
                                title={isDesktopCollapsed ? item.name : undefined}
                            >
                                <item.icon
                                    className={clsx(
                                        'h-6 w-6 flex-shrink-0 transition-all duration-200',
                                        isDesktopCollapsed ? 'mr-0' : 'mr-3',
                                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                    )}
                                    aria-hidden="true"
                                />
                                {!isDesktopCollapsed && (
                                    <span className="whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-200">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-800 p-4">
                    <div className={clsx("flex items-center overflow-hidden", isDesktopCollapsed && "justify-center")}>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0"></div>
                        {!isDesktopCollapsed && (
                            <div className="ml-3 whitespace-nowrap">
                                <p className="text-sm font-medium text-white">Admin User</p>
                                <p className="text-xs text-slate-400">Bank Official</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

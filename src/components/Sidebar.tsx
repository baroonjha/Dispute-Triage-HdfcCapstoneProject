'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserCircle, MessageSquareText, ShieldAlert, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen },
    { name: 'Customer Portal', href: '/portal', icon: UserCircle },
    { name: 'AI Assistant', href: '/chatbot', icon: MessageSquareText },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
            <div className="flex h-16 items-center justify-center border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-blue-500" />
                    <span className="text-xl font-bold tracking-tight">DisputeGuard</span>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    'mr-3 h-6 w-6 flex-shrink-0',
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-slate-800 p-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-slate-400">Bank Official</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

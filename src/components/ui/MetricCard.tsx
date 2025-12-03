import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'blue' | 'red' | 'green' | 'yellow';
    trend?: string;
}

export default function MetricCard({
    title,
    value,
    icon: Icon,
    color = 'blue',
    trend,
}: MetricCardProps) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={clsx('rounded-lg p-3', colorStyles[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="font-medium text-green-600">{trend}</span>
                    <span className="ml-2 text-slate-500">vs last month</span>
                </div>
            )}
        </div>
    );
}

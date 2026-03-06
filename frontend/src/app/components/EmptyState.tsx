import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function EmptyState({
    icon: Icon = Search,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
                <Icon size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
            {action && (
                action.href ? (
                    <a
                        href={action.href}
                        className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                    >
                        {action.label}
                    </a>
                ) : action.onClick ? (
                    <button
                        onClick={action.onClick}
                        className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                    >
                        {action.label}
                    </button>
                ) : null
            )}
        </div>
    );
}

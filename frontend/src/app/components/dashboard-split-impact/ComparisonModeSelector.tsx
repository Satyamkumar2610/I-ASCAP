
"use client";
import React from 'react';
import { History, Network } from 'lucide-react';

interface ComparisonModeSelectorProps {
    mode: string;
    onChange: (m: string) => void;
}

export function ComparisonModeSelector({ mode, onChange }: ComparisonModeSelectorProps) {
    const modes = [
        { id: 'before_after', label: 'Before vs After', fullLabel: 'Before vs After (Reconstructed)', icon: History },
        { id: 'entity_comparison', label: 'Parent vs Child', fullLabel: 'Parent vs Child', icon: Network },
    ];

    return (
        <div className="flex gap-1 md:gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 mb-3 md:mb-4">
            {modes.map(m => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:px-3 text-[10px] md:text-xs font-medium rounded transition-colors
                        ${mode === m.id
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <m.icon size={12} className="md:w-[14px] md:h-[14px]" />
                    <span className="hidden sm:inline">{m.fullLabel}</span>
                    <span className="sm:hidden">{m.label}</span>
                </button>
            ))}
        </div>
    );
}

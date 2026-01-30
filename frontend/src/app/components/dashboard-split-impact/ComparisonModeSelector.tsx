
"use client";
import React from 'react';
import { GitCompare, History, Network, Map } from 'lucide-react';

interface ComparisonModeSelectorProps {
    mode: string;
    onChange: (m: string) => void;
}

export function ComparisonModeSelector({ mode, onChange }: ComparisonModeSelectorProps) {
    const modes = [
        { id: 'before_after', label: 'Before vs After (Reconstructed)', icon: History },
        { id: 'entity_comparison', label: 'Parent vs Child', icon: Network },
        // { id: 'child_parent', label: 'Child vs Parent', icon: GitCompare }, // Merged conceptually
        // { id: 'district_disrict', label: 'District vs District', icon: Map }, // Future
    ];

    return (
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 mb-4">
            {modes.map(m => (
                <button
                    key={m.id}
                    onClick={() => onChange(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded transition-colors
                        ${mode === m.id
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                >
                    <m.icon size={14} />
                    {m.label}
                </button>
            ))}
        </div>
    );
}


"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, GitFork } from 'lucide-react';

interface SplitDistrictTableProps {
    state: string;
    onSelect: (event: any) => void;
    selectedEventId?: string;
}

export function SplitDistrictTable({ state, onSelect, selectedEventId }: SplitDistrictTableProps) {
    const [splits, setSplits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!state) return;
        setLoading(true);
        fetch(`/api/split-impact/districts?state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(d => {
                if (Array.isArray(d)) setSplits(d);
                else setSplits([]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [state]);

    if (!state) return <div className="text-slate-500 text-sm text-center py-10">Select a state to view lineage events</div>;

    if (loading) return <div className="text-slate-500 text-sm text-center py-10 animate-pulse">Loading Lineage Data...</div>;

    if (splits.length === 0) return <div className="text-slate-500 text-sm text-center py-10">No recorded district splits found for {state}.</div>;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <GitFork size={18} className="text-emerald-500" />
                    Split Events ({splits.length})
                </h3>
            </div>

            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/30">
                            <th className="px-6 py-3 font-medium">Parent District</th>
                            <th className="px-6 py-3 font-medium">Split Year</th>
                            <th className="px-6 py-3 font-medium">Child Districts</th>
                            <th className="px-6 py-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {splits.map((split) => (
                            <tr
                                key={split.id}
                                className={`group transition-colors ${selectedEventId === split.id ? 'bg-emerald-900/20' : 'hover:bg-slate-800/30'}`}
                            >
                                <td className="px-6 py-4 font-medium text-slate-200">
                                    {split.parentName}
                                    <div className="text-[10px] text-slate-500 font-mono">{split.parentCdk}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-300 font-mono">
                                    {split.splitYear}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-300 font-medium">{split.childrenCount} Districts</span>
                                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                            {split.childrenNames.join(', ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onSelect(split)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ml-auto
                                            ${selectedEventId === split.id
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        {selectedEventId === split.id ? 'Analyzing' : 'Compare'}
                                        {selectedEventId !== split.id && <ArrowRight size={12} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

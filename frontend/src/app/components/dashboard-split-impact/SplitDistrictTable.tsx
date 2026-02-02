
"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, GitFork, ChevronRight } from 'lucide-react';

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

        let isMounted = true;

        const fetchSplits = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/split-impact/districts?state=${encodeURIComponent(state)}`);
                const d = await res.json();

                if (isMounted) {
                    if (Array.isArray(d)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const transformed = d.map((item: any) => ({
                            id: item.id,
                            parentCdk: item.parent_cdk || item.parentCdk,
                            parentName: item.parent_name || item.parentName,
                            splitYear: item.split_year || item.splitYear,
                            childrenCdks: item.children_cdks || item.childrenCdks || [],
                            childrenNames: item.children_names || item.childrenNames || [],
                            childrenCount: item.children_count || item.childrenCount || 0,
                            coverage: item.coverage,
                        }));
                        setSplits(transformed);
                    } else {
                        setSplits([]);
                    }
                }
            } catch (e) {
                console.error(e);
                if (isMounted) setSplits([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSplits();

        return () => { isMounted = false; };
    }, [state]);

    if (!state) return <div className="text-slate-500 text-sm text-center py-10">Select a state to view lineage events</div>;

    if (loading) return <div className="text-slate-500 text-sm text-center py-10 animate-pulse">Loading Lineage Data...</div>;

    if (splits.length === 0) return <div className="text-slate-500 text-sm text-center py-10">No recorded district splits found for {state}.</div>;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm md:text-base">
                    <GitFork size={16} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
                    Split Events ({splits.length})
                </h3>
            </div>

            {/* Mobile Card View */}
            <div className="overflow-auto flex-1 custom-scrollbar md:hidden">
                <div className="divide-y divide-slate-800/50">
                    {splits.map((split) => (
                        <button
                            key={split.id}
                            onClick={() => onSelect(split)}
                            className={`w-full text-left p-4 transition-colors ${selectedEventId === split.id
                                ? 'bg-emerald-900/20 border-l-2 border-emerald-500'
                                : 'hover:bg-slate-800/30'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-200 truncate">{split.parentName}</span>
                                        <span className="shrink-0 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded">
                                            {split.splitYear}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">{split.childrenCount} child districts</span>
                                        <ArrowRight size={10} className="text-slate-500" />
                                        <span className="text-xs text-slate-500 truncate">
                                            {split.childrenNames.slice(0, 2).join(', ')}
                                            {split.childrenNames.length > 2 && '...'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className={`shrink-0 ${selectedEventId === split.id ? 'text-emerald-500' : 'text-slate-600'
                                    }`} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="overflow-auto flex-1 custom-scrollbar hidden md:block">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/30">
                            <th className="px-4 lg:px-6 py-3 font-medium">Parent District</th>
                            <th className="px-4 lg:px-6 py-3 font-medium">Split Year</th>
                            <th className="px-4 lg:px-6 py-3 font-medium hidden lg:table-cell">Child Districts</th>
                            <th className="px-4 lg:px-6 py-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {splits.map((split) => (
                            <tr
                                key={split.id}
                                className={`group transition-colors ${selectedEventId === split.id ? 'bg-emerald-900/20' : 'hover:bg-slate-800/30'}`}
                            >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-slate-200">
                                    {split.parentName}
                                    <div className="text-[10px] text-slate-500 font-mono hidden lg:block">{split.parentCdk}</div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-300 font-mono">
                                    {split.splitYear}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-300 font-medium">{split.childrenCount} Districts</span>
                                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                            {split.childrenNames.join(', ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
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

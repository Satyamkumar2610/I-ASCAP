import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SplitDistrictTableProps {
    splits: any[];
    onSelect?: (event: any) => void;
    selectedEventId?: string;
    isLoading?: boolean;
}

export default function SplitDistrictTable({ splits, onSelect, selectedEventId, isLoading }: SplitDistrictTableProps) {
    const [activeDecade, setActiveDecade] = useState<string | null>(null);

    // Derive available decades from the split events
    const decades = useMemo(() => {
        if (!splits || splits.length === 0) return [];
        const ds = new Set<string>();
        for (const s of splits) {
            const decade = `${Math.floor(s.split_year / 10) * 10}s`;
            ds.add(decade);
        }
        return Array.from(ds).sort();
    }, [splits]);

    // Filter by selected decade
    const filtered = useMemo(() => {
        if (!splits) return [];
        if (!activeDecade) return splits;
        const decadeStart = parseInt(activeDecade);
        return splits.filter((s: any) => {
            const yr = s.split_year;
            return yr >= decadeStart && yr < decadeStart + 10;
        });
    }, [splits, activeDecade]);

    if (isLoading) return <div className="text-xs text-slate-500 italic p-4">Analyzing district split lineage...</div>;

    if (!splits || splits.length === 0) return <div className="p-4 text-xs text-slate-500">No split events found for this state.</div>;

    return (
        <div className="space-y-3">
            {/* Decade filter pills */}
            {decades.length > 1 && (
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/50">
                    <button
                        onClick={() => setActiveDecade(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${!activeDecade
                            ? 'glass-active text-indigo-300 border border-indigo-500/40'
                            : 'glass-panel text-slate-500 hover:border-slate-600'
                            }`}
                    >
                        All ({splits.length})
                    </button>
                    {decades.map(d => {
                        const decadeStart = parseInt(d);
                        const count = splits.filter((s: any) => s.split_year >= decadeStart && s.split_year < decadeStart + 10).length;
                        return (
                            <button
                                key={d}
                                onClick={() => setActiveDecade(activeDecade === d ? null : d)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${activeDecade === d
                                    ? 'glass-active text-indigo-300 border border-indigo-500/40'
                                    : 'glass-panel text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                {d} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Split event cards */}
            {filtered.map((item: any) => {
                const resolvedCount = item.resolved_count ?? item.children_cdks?.filter((c: string | null) => c != null).length ?? 0;
                const totalCount = item.total_count ?? item.children_cdks?.length ?? 0;
                const allResolved = resolvedCount === totalCount && totalCount > 0;

                return (
                    <div
                        key={item.id}
                        onClick={() => onSelect && onSelect(item)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedEventId === item.id
                            ? 'glass-active border-indigo-500/50'
                            : 'glass-panel hover:border-slate-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${selectedEventId === item.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                    {item.parent_name}
                                </span>
                                <ArrowRight size={12} className="text-slate-600" />
                                <span className="text-xs text-slate-500">Split in {item.split_year}</span>
                            </div>
                            {/* Resolution badge */}
                            {allResolved ? (
                                <span title="All districts resolved"><CheckCircle2 size={14} className="text-emerald-500/70 shrink-0" /></span>
                            ) : (
                                <span title={`${resolvedCount}/${totalCount} resolved`}><AlertTriangle size={14} className="text-amber-500/70 shrink-0" /></span>
                            )}
                        </div>

                        <div className="space-y-1 pl-4 border-l-2 border-indigo-500/20">
                            {item.children_names && Array.isArray(item.children_names) ? (
                                item.children_names.map((childName: string, idx: number) => {
                                    const isRetainedParent = childName === item.parent_name;
                                    return (
                                        <div key={`${childName}-${idx}`} className="flex items-center gap-1.5 text-xs">
                                            {isRetainedParent ? (
                                                <>
                                                    <span className="text-slate-400">{childName}</span>
                                                    <span className="text-[9px] text-slate-600 bg-slate-800/80 px-1.5 py-0.5 rounded">retained</span>
                                                </>
                                            ) : (
                                                <span className="text-indigo-300">{childName}</span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-slate-500">No children data</span>
                            )}
                        </div>
                    </div>
                );
            })}

            {filtered.length === 0 && activeDecade && (
                <div className="p-4 text-xs text-slate-500 text-center">
                    No split events in the {activeDecade}.
                </div>
            )}
        </div>
    );
}


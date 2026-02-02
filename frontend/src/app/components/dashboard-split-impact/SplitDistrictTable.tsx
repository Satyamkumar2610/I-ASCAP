"use client";
import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SplitDistrictTableProps {
    splits: any[];
    onSelect?: (event: any) => void;
    selectedEventId?: string;
}

export default function SplitDistrictTable({ splits, onSelect, selectedEventId }: SplitDistrictTableProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            setLoading(true);
            await new Promise(r => setTimeout(r, 600)); // Simulated loading
            if (isMounted) setLoading(false);
        }

        loadData();
        return () => { isMounted = false; };
    }, [splits]);

    if (loading) return <div className="text-xs text-slate-500 italic p-4">Analyzing district split lineage...</div>;

    if (!splits || splits.length === 0) return <div className="p-4 text-xs text-slate-500">No split events found for this state.</div>;

    return (
        <div className="space-y-3">
            {splits.map((item: any) => (
                <div
                    key={item.original}
                    onClick={() => onSelect && onSelect(item)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedEventId === item.id
                            ? 'bg-indigo-500/20 border-indigo-500/50'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-bold ${selectedEventId === item.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                            {item.original}
                        </span>
                        <ArrowRight size={12} className="text-slate-600" />
                        <span className="text-xs text-slate-500">Split in {item.year}</span>
                    </div>

                    <div className="space-y-1 pl-4 border-l-2 border-indigo-500/20">
                        {item.new_districts.map((d: any) => (
                            <div key={d.name} className="flex justify-between items-center text-xs">
                                <span className="text-indigo-300">{d.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400">{d.yield.toLocaleString()} kg/ha</span>
                                    {d.change > 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-orange-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";
import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SplitDistrictTable({ splits, splitYear }: { splits: any[], splitYear: number }) {
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

    if (!splits || splits.length === 0) return null;

    return (
        <div className="space-y-3">
            {splits.map((item: any) => (
                <div key={item.original} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-300">{item.original}</span>
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

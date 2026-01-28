
"use client";
import React from 'react';
import { Info, AlertCircle } from 'lucide-react';

export function ComparisonContextBanner({ event, mode, metric }: any) {
    if (!event) return null;

    return (
        <div className="mb-4 bg-slate-900/50 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 p-4 rounded-r-lg shadow-sm">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={14} /> Analysis Context
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                    <span className="text-slate-500 block">Comparison Type</span>
                    <span className="text-slate-200 font-mono">
                        {mode === 'before_after' ? 'Longitudinal Reconstruction' : 'Entity Comparison'}
                    </span>
                </div>
                <div>
                    <span className="text-slate-500 block">Parent District</span>
                    <span className="text-slate-200 font-semibold">{event.parentName}</span>
                    <span className="text-slate-600 ml-1">(Pre-{event.splitYear})</span>
                </div>
                <div>
                    <span className="text-slate-500 block">Descendants</span>
                    <div className="flex flex-wrap gap-1">
                        {event.childrenNames.map((c: string) => (
                            <span key={c} className="bg-slate-800 px-1.5 rounded text-slate-300">{c}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <span className="text-slate-500 block">Methodology</span>
                    <span className="text-slate-200 flex items-center gap-1">
                        Boundary Adjusted
                        <AlertCircle size={10} className="text-slate-600" />
                    </span>
                </div>
            </div>
        </div>
    );
}

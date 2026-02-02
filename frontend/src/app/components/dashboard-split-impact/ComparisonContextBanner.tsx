"use client";
import React from 'react';
import { Info } from 'lucide-react';



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComparisonContextBanner({ event, mode }: { event: any; mode: string }) {
    if (!event) return null;

    return (
        <div className="mb-3 md:mb-4 bg-slate-900/50 border-l-4 border-l-emerald-500 border-y border-r border-slate-800 p-3 md:p-4 rounded-r-lg shadow-sm">
            <h4 className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 md:gap-2">
                <Info size={12} className="md:w-[14px] md:h-[14px]" />
                Analysis Context
            </h4>
            <div className="grid grid-cols-2 gap-2 md:gap-4 text-[10px] md:text-xs">
                {/* Row 1 */}
                <div>
                    <span className="text-slate-500 block">Comparison Type</span>
                    <span className="text-slate-200 font-mono truncate block">
                        {mode === 'before_after' ? 'Longitudinal' : 'Entity Comparison'}
                    </span>
                </div>
                <div>
                    <span className="text-slate-500 block">Parent District</span>
                    <span className="text-slate-200 font-semibold truncate block">
                        {event.parentName}
                        <span className="text-slate-600 ml-1 hidden sm:inline">(Pre-{event.splitYear})</span>
                    </span>
                </div>

                {/* Row 2 */}
                <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">Descendants</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {event.childrenNames.slice(0, 3).map((c: string) => (
                            <span key={c} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 text-[9px] md:text-xs truncate max-w-[80px] md:max-w-none">
                                {c}
                            </span>
                        ))}
                        {event.childrenNames.length > 3 && (
                            <span className="text-slate-500">+{event.childrenNames.length - 3}</span>
                        )}
                    </div>
                </div>

                <div className="hidden sm:block">
                    <span className="text-slate-500 block">Fragmentation Index</span>
                    <span className="text-slate-200 flex items-center gap-1 font-mono">
                        {(event.childrenNames.length / 1.0).toFixed(1)}
                        <span className="text-slate-600 text-[10px] ml-1">splits/parent</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

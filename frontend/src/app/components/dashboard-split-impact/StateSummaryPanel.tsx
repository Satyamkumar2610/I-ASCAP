
"use client";

import React from 'react';
import { Map, AlertTriangle, Layers, Database } from 'lucide-react';

interface StateSummaryPanelProps {
    stateName: string;
    stats: {
        total: number;
        changed: number;
        coverage: number;
    } | null;
}

export function StateSummaryPanel({ stateName, stats }: StateSummaryPanelProps) {
    if (!stats || !stateName) return null;

    return (
        <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Map className="text-blue-500" size={18} />
                    </div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Districts</span>
                </div>
                <div className="text-2xl font-bold text-white pl-1">{stats.total}</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="text-amber-500" size={18} />
                    </div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Boundary Changes</span>
                </div>
                <div className="text-2xl font-bold text-white pl-1">{stats.changed}</div>
                <div className="text-[10px] text-slate-500 mt-1 pl-1">Districts impacted by splits</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Database className="text-purple-500" size={18} />
                    </div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Data Coverage</span>
                </div>
                <div className="text-2xl font-bold text-white pl-1">High</div>
                <div className="text-[10px] text-slate-500 mt-1 pl-1">V1.5 Harmonized Panel</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl opacity-50 grayscale">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Layers className="text-emerald-500" size={18} />
                    </div>
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Comparability</span>
                </div>
                <div className="text-2xl font-bold text-white pl-1">{stats.changed > 0 ? 'Active' : 'N/A'}</div>
            </div>
        </div>
    );
}

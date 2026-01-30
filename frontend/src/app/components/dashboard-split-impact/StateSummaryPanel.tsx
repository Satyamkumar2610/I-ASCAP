
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

    const cards = [
        {
            icon: Map,
            color: 'blue',
            label: 'Total Districts',
            value: stats.total,
            subtitle: null,
        },
        {
            icon: AlertTriangle,
            color: 'amber',
            label: 'Boundary Changes',
            value: stats.changed,
            subtitle: 'Districts impacted by splits',
        },
        {
            icon: Database,
            color: 'purple',
            label: 'Data Coverage',
            value: 'High',
            subtitle: 'V1.5 Harmonized Panel',
        },
        {
            icon: Layers,
            color: 'emerald',
            label: 'Comparability',
            value: stats.changed > 0 ? 'Active' : 'N/A',
            subtitle: null,
            faded: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8 min-w-[280px]">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`bg-slate-900/50 border border-slate-800 p-3 md:p-4 rounded-lg md:rounded-xl ${card.faded ? 'opacity-50 grayscale' : ''}`}
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                        <div className={`p-1.5 md:p-2 bg-${card.color}-500/10 rounded-md md:rounded-lg`}>
                            <card.icon className={`text-${card.color}-500 w-3.5 h-3.5 md:w-[18px] md:h-[18px]`} />
                        </div>
                        <span className="text-slate-400 text-[9px] md:text-xs font-medium uppercase tracking-wider truncate">
                            {card.label}
                        </span>
                    </div>
                    <div className="text-lg md:text-2xl font-bold text-white pl-1">{card.value}</div>
                    {card.subtitle && (
                        <div className="text-[9px] md:text-[10px] text-slate-500 mt-1 pl-1 hidden sm:block">
                            {card.subtitle}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

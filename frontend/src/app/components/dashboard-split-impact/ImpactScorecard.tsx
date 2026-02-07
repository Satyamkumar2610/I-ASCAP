import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Loader2 } from 'lucide-react';
import { useSplitImpactAnalysis } from '../../hooks/useSplitImpact';

interface ImpactScorecardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any;
    crop: string;
}

export function ImpactScorecard({ event, crop }: ImpactScorecardProps) {
    const { data, isLoading } = useSplitImpactAnalysis(
        event.parent_cdk,
        event.children_cdks,
        event.split_year,
        crop
    );

    if (isLoading) {
        return (
            <div className="h-24 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="animate-spin text-emerald-500" size={16} />
                <span className="text-xs">Calculating Impact...</span>
            </div>
        );
    }

    if (!data) return null;

    const { before, after, impact } = data;
    const isIdsPositive = impact.assessment === 'positive';
    const isNeutral = impact.assessment === 'neutral';

    return (
        <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 mb-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                <span>Split Impact Assessment</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isIdsPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isNeutral
                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                    {impact.assessment.toUpperCase()}
                </span>
            </h4>

            <div className="grid grid-cols-3 gap-4">
                {/* Before */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 mb-1">Pre-Split Avg ({before.years[0]}-{before.years[before.years.length - 1]})</span>
                    <div className="flex items-end gap-1">
                        <span className="text-lg font-bold text-slate-200">{before.average}</span>
                        <span className="text-[10px] text-slate-500 mb-1">kg/ha</span>
                    </div>
                </div>

                {/* Impact Arrow */}
                <div className="flex flex-col items-center justify-center">
                    <div className={`flex items-center gap-1 font-bold ${isIdsPositive ? 'text-emerald-400' : isNeutral ? 'text-slate-400' : 'text-rose-400'
                        }`}>
                        {isIdsPositive ? <ArrowUpRight size={16} /> : isNeutral ? <Minus size={16} /> : <ArrowDownRight size={16} />}
                        <span>{impact.percent_change > 0 ? '+' : ''}{impact.percent_change}%</span>
                    </div>
                </div>

                {/* After */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 mb-1">Post-Split Avg (5yr)</span>
                    <div className="flex items-end gap-1">
                        <span className="text-lg font-bold text-white">{after.combined_average}</span>
                        <span className="text-[10px] text-slate-500 mb-1">kg/ha</span>
                    </div>
                </div>
            </div>

            {/* Child Breakdown */}
            <div className="mt-3 pt-3 border-t border-slate-800/50">
                <div className="text-[10px] text-slate-500 mb-2">District Contribution (Post-Split):</div>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(after.by_child).map(([cdk, stats]: [string, any]) => (
                        <div key={cdk} className="bg-slate-900 border border-slate-800 rounded px-2 py-1 flex items-center gap-2">
                            <span className="text-[10px] text-slate-300 font-medium">
                                {event.children_districts.find((name: string) => cdk.toLowerCase().includes(name.toLowerCase().replace(/ /g, '').slice(0, 5))) || cdk}
                            </span>
                            <span className="text-[10px] text-slate-500">{Math.round(stats.avg)} kg/ha</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

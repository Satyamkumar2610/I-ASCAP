
"use client";

import React, { useEffect, useState } from 'react';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonContextBanner } from './ComparisonContextBanner';
import { AdvancedStatsPanel } from './AdvancedStatsPanel';
import { AlertCircle, Sprout } from 'lucide-react';

interface ComparisonViewProps {
    event: any;
    crop: string;
    metric: string;
    mode: string;
}

export function ComparisonView({ event, crop, metric, mode }: ComparisonViewProps) {
    const [payload, setPayload] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!event) return;
        setLoading(true);
        const childrenStr = event.childrenCdks.join(',');

        fetch(`/api/split-impact/analysis?parent=${event.parentCdk}&children=${childrenStr}&splitYear=${event.splitYear}&crop=${crop}&metric=${metric}&mode=${mode}`)
            .then(r => r.json())
            .then(d => {
                setPayload(d);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [event, crop, metric, mode]);

    if (!event) return null;

    const hasData = payload && payload.data && payload.data.length > 0;

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 animate-in fade-in duration-500 flex flex-col h-full">
            {/* Context Banner */}
            <ComparisonContextBanner event={event} mode={mode} metric={metric} />

            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/30 rounded-lg border border-slate-800/50 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900/50 z-10">
                        Analyzing Data...
                    </div>
                ) : !hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <Sprout size={48} className="text-slate-700 mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No Data Available</h3>
                        <p className="max-w-xs mt-2 text-sm opacity-70">
                            We found no records for <span className="text-emerald-500 font-bold">{crop.toUpperCase()}</span> in
                            <span className="text-white font-semibold"> {event.parentName}</span>.
                        </p>
                        <p className="mt-4 text-xs bg-slate-900 px-3 py-2 rounded text-slate-400 border border-slate-800">
                            Suggestion: Try selecting <strong>Rice</strong>, <strong>Maize</strong>, or another crop common to this region.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Advanced Stats */}
                        {(payload.advancedStats || payload.advanced_stats) && (
                            <div className="px-4 pt-4">
                                <AdvancedStatsPanel stats={payload.advancedStats || payload.advanced_stats} metric={metric} />
                            </div>
                        )}

                        {/* Chart Area */}
                        <div className="flex-1 min-h-[300px] p-4">
                            <ComparisonChart
                                data={payload.data}
                                series={payload.series}
                                splitYear={event.splitYear}
                                metric={metric}
                            />
                        </div>

                        {/* Stats Table */}
                        <div className="px-4 pb-4">
                            <ComparisonTable
                                data={payload.data}
                                series={payload.series}
                                splitYear={event.splitYear}
                                metric={metric}
                            />
                        </div>

                        {/* Footer Note */}
                        <div className="px-4 pb-2 flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            <p>
                                Data provided by harmonized v1.5 panel.
                                {mode === 'before_after'
                                    ? ' Post-split values are reconstructed aggregates of child districts for comparability.'
                                    : ' Series represent raw district performance without spatial harmonization.'
                                }
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

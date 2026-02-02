
"use client";

import React, { useEffect, useState } from 'react';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonContextBanner } from './ComparisonContextBanner';
import { AdvancedStatsPanel } from './AdvancedStatsPanel';
import { AlertCircle, Sprout, Loader2 } from 'lucide-react';

interface ComparisonViewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any;
    crop: string;
    metric: string;
    mode: string;
}

export function ComparisonView({ event, crop, metric, mode }: ComparisonViewProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [payload, setPayload] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!event) return;

        let isMounted = true;

        const fetchData = async () => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true);
            try {
                const childrenStr = event.childrenCdks.join(',');
                const url = `/api/split-impact/analysis?parent=${event.parentCdk}&children=${childrenStr}&splitYear=${event.splitYear}&crop=${crop}&metric=${metric}&mode=${mode}`;
                const res = await fetch(url);
                const data = await res.json();

                if (isMounted) {
                    setPayload(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [event, crop, metric, mode]);

    if (!event) return null;

    const hasData = payload && payload.data && payload.data.length > 0;

    return (
        <div className="bg-slate-900/50 p-3 md:p-6 rounded-xl border border-slate-800 animate-in fade-in duration-500 flex flex-col h-full overflow-hidden">
            {/* Context Banner */}
            <ComparisonContextBanner event={event} mode={mode} metric={metric} />

            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/30 rounded-lg border border-slate-800/50 relative overflow-hidden">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 z-10 gap-3">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                        <span className="text-sm">Analyzing Data...</span>
                    </div>
                ) : !hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 md:p-8 text-center">
                        <Sprout size={36} className="text-slate-700 mb-3 md:mb-4 md:w-12 md:h-12" />
                        <h3 className="text-base md:text-lg font-medium text-slate-400">No Data Available</h3>
                        <p className="max-w-xs mt-2 text-xs md:text-sm opacity-70">
                            We found no records for <span className="text-emerald-500 font-bold">{crop.toUpperCase()}</span> in
                            <span className="text-white font-semibold"> {event.parentName}</span>.
                        </p>
                        <p className="mt-3 md:mt-4 text-[10px] md:text-xs bg-slate-900 px-3 py-2 rounded text-slate-400 border border-slate-800">
                            Try selecting <strong>Rice</strong>, <strong>Maize</strong>, or another crop.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Advanced Stats */}
                        {(payload.advancedStats || payload.advanced_stats) && (
                            <div className="px-3 md:px-4 pt-3 md:pt-4">
                                <AdvancedStatsPanel stats={payload.advancedStats || payload.advanced_stats} metric={metric} />
                            </div>
                        )}

                        {/* Chart Area */}
                        <div className="min-h-[250px] md:min-h-[300px] p-3 md:p-4">
                            <ComparisonChart
                                data={payload.data}
                                series={payload.series}
                                splitYear={event.splitYear}
                                metric={metric}
                            />
                        </div>

                        {/* Stats Table - Hidden on very small screens */}
                        <div className="px-3 md:px-4 pb-3 md:pb-4 hidden sm:block">
                            <ComparisonTable
                                data={payload.data}
                                series={payload.series}
                                splitYear={event.splitYear}
                                metric={metric}
                            />
                        </div>

                        {/* Footer Note */}
                        <div className="px-3 md:px-4 pb-2 flex items-start gap-2 text-[9px] md:text-[10px] text-slate-500 leading-tight">
                            <AlertCircle size={10} className="mt-0.5 shrink-0 md:w-3 md:h-3" />
                            <p className="line-clamp-2">
                                Data provided by harmonized v1.5 panel.
                                {mode === 'before_after'
                                    ? ' Post-split values are reconstructed aggregates.'
                                    : ' Raw district performance data.'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

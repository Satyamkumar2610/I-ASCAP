
"use client";

import React, { useEffect, useState } from 'react';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonContextBanner } from './ComparisonContextBanner';
import { AlertCircle } from 'lucide-react';

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

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 animate-in fade-in duration-500 flex flex-col h-full">
            {/* Context Banner */}
            <ComparisonContextBanner event={event} mode={mode} metric={metric} />

            <div className="flex-1 flex flex-col min-h-0">
                {loading || !payload ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        {loading ? 'Analyzing Data...' : 'No Data Available'}
                    </div>
                ) : (
                    <>
                        <ComparisonChart
                            data={payload.data}
                            series={payload.series}
                            splitYear={event.splitYear}
                            metric={metric}
                        />

                        <ComparisonTable
                            data={payload.data}
                            series={payload.series}
                            splitYear={event.splitYear}
                            metric={metric}
                        />

                        <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
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


"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Legend } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface ComparisonViewProps {
    event: any; // Using any for speed, ideally interface
    crop: string;
    metric: string;
}

export function ComparisonView({ event, crop, metric }: ComparisonViewProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!event) return;
        setLoading(true);
        const childrenStr = event.childrenCdks.join(',');

        fetch(`/api/split-impact/analysis?parent=${event.parentCdk}&children=${childrenStr}&splitYear=${event.splitYear}&crop=${crop}&metric=${metric}`)
            .then(r => r.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [event, crop, metric]);

    if (!event) return null;

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" size={20} />
                        Before vs After Split Analysis
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Viewing <span className="text-emerald-400 font-mono">{metric.toUpperCase()}</span> evolution for
                        <span className="text-white font-semibold"> {event.parentName} </span>
                        and its {event.childrenCount} successor districts.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white">{event.splitYear}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">Split Year</div>
                </div>
            </div>

            <div className="h-80 w-full bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-500">Loading Analysis...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="year"
                                stroke="#64748b"
                                fontSize={10}
                                tickFormatter={(val) => val.toString()}
                            />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
                                itemStyle={{ color: '#10b981' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend />

                            <ReferenceLine x={event.splitYear} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2}>
                                <Label value="SPLIT EVENT" position="insideTopLeft" fill="#ef4444" fontSize={10} offset={10} />
                            </ReferenceLine>

                            <Line
                                type="monotone"
                                dataKey="value"
                                name={`${metric} (Boundary Adjusted)`}
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#10b981' }}
                                activeDot={{ r: 6, fill: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-4 flex items-start gap-3 bg-blue-950/20 p-3 rounded border border-blue-900/30">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-blue-200/80 leading-relaxed">
                    <strong className="text-blue-200">Scientific Note:</strong> Values before {event.splitYear} represent the original parent district.
                    Values after {event.splitYear} are a <strong>mathematical reconstruction</strong> aggregating the {event.childrenCount} child districts
                    ({event.childrenNames?.join(', ')}) to allow for a direct 1:1 comparison.
                </div>
            </div>
        </div>
    );
}

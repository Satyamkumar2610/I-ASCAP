
"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export function ComparisonChart({ data, series, splitYear, metric }: any) {
    return (
        <div className="h-80 w-full bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        fontSize={10}
                        tickFormatter={(val) => val.toString()}
                    />
                    <YAxis stroke="#64748b" fontSize={10} label={{ value: metric.toUpperCase(), angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend />

                    <ReferenceLine x={splitYear} stroke="#ef4444" strokeDasharray="3 3">
                        <Label value="SPLIT" position="insideTopLeft" fill="#ef4444" fontSize={10} />
                    </ReferenceLine>

                    {series.map((s: any, idx: number) => (
                        <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.id}
                            name={s.label}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={s.style === 'solid' ? 2 : 2}
                            strokeDasharray={s.style === 'dashed' ? '5 5' : '0'}
                            dot={s.style === 'solid' ? { r: 3 } : false}
                            activeDot={{ r: 5 }}
                            connectNulls={true}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

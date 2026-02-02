
"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export interface ChartSeries {
    id: string;
    label: string;
    style?: 'solid' | 'dashed';
}

interface ComparisonChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    series: ChartSeries[];
    splitYear: number;
    metric?: string;
}

export function ComparisonChart({ data, series, splitYear, metric = 'yield' }: ComparisonChartProps) {
    const getUnitCallback = (val: number) => {
        if (metric === 'yield') return `${val.toLocaleString()} kg/ha`;
        if (metric === 'production') return `${val.toLocaleString()} tons`;
        if (metric === 'area') return `${val.toLocaleString()} ha`;
        return `${val.toLocaleString()}`;
    };

    return (
        <div
            className="h-64 md:h-80 w-full bg-slate-950/50 rounded-lg p-2 md:p-4 border border-slate-800/50"
            role="img"
            aria-label={`Line chart showing ${metric} trends relative to split year ${splitYear}`}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        fontSize={9}
                        tickFormatter={(val) => val.toString().slice(-2)}
                        interval="preserveStartEnd"
                        tick={{ fontSize: 9 }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={9}
                        width={40}
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                        tick={{ fontSize: 9 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            color: '#f1f5f9',
                            fontSize: '11px',
                            padding: '8px',
                            borderRadius: '6px'
                        }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [getUnitCallback(Number(value || 0)), '']}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '10px' }}
                        iconSize={8}
                    />

                    <ReferenceLine x={splitYear} stroke="#ef4444" strokeDasharray="3 3">
                        <Label value="SPLIT" position="insideTopLeft" fill="#ef4444" fontSize={9} />
                    </ReferenceLine>

                    {(series || []).map((s: ChartSeries, idx: number) => (
                        <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.id}
                            name={s.label.length > 20 ? s.label.slice(0, 20) + '...' : s.label}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={s.style === 'solid' ? 2 : 1.5}
                            strokeDasharray={s.style === 'dashed' ? '5 5' : '0'}
                            dot={false}
                            activeDot={{ r: 4 }}
                            connectNulls={true}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

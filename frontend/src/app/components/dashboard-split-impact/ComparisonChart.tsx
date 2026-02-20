
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
            className="h-64 md:h-80 w-full glass-card border-none rounded-xl p-3 md:p-5 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.3)]"
            role="img"
            aria-label={`Line chart showing ${metric} trends relative to split year ${splitYear}`}
        >
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.4} />
                    <XAxis
                        dataKey="year"
                        stroke="#64748b"
                        fontSize={10}
                        tickFormatter={(val) => val.toString().slice(-2)}
                        interval="preserveStartEnd"
                        tick={{ fill: '#94a3b8' }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        width={45}
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                        tick={{ fill: '#94a3b8' }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(51, 65, 85, 0.6)',
                            color: '#f8fafc',
                            fontSize: '11px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#cbd5e1', fontWeight: 'bold', marginBottom: '4px' }}
                        cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [getUnitCallback(Number(value || 0)), '']}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#cbd5e1' }}
                        iconSize={10}
                        iconType="circle"
                    />

                    <ReferenceLine x={splitYear} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1}>
                        <Label value="SPLIT" position="insideTopLeft" fill="#ef4444" fontSize={10} fontWeight="bold" />
                    </ReferenceLine>

                    {(series || []).map((s: ChartSeries, idx: number) => (
                        <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.id}
                            name={s.label.length > 20 ? s.label.slice(0, 20) + '...' : s.label}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={s.style === 'solid' ? 2.5 : 2}
                            strokeDasharray={s.style === 'dashed' ? '5 5' : '0'}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: COLORS[idx % COLORS.length] }}
                            connectNulls={true}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

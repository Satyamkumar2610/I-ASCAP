
"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
    year: number;
    [key: string]: number;
}

interface TimeSeriesChartProps {
    data: ChartDataPoint[];
    metrics: string[]; // e.g., ['yield', 'production', 'area']
    colors?: string[];
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']; // Blue, Green, Amber, Red

export function TimeSeriesChart({ data, metrics, colors }: TimeSeriesChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 glass-panel rounded-xl border border-dashed border-slate-700/50">
                <span className="text-slate-500 font-medium">No data available for chart</span>
            </div>
        );
    }

    const chartColors = colors || DEFAULT_COLORS;

    return (
        <div className="w-full h-80 glass-card rounded-xl p-4 md:p-5 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.3)]">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 15,
                        left: -5,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#334155" opacity={0.4} />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={false}
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(51, 65, 85, 0.6)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                            color: '#f8fafc',
                            fontSize: '11px',
                            padding: '10px 14px'
                        }}
                        labelStyle={{ color: '#cbd5e1', fontWeight: 'bold', marginBottom: '4px' }}
                        cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#cbd5e1' }} iconSize={10} iconType="circle" />
                    {metrics.map((metric, index) => (
                        <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth={2.5}
                            dot={{ r: 0 }}
                            activeDot={{ r: 5, strokeWidth: 0, fill: chartColors[index % chartColors.length] }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

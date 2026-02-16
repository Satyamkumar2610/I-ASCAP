
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
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <span className="text-gray-400">No data available for chart</span>
            </div>
        );
    }

    const chartColors = colors || DEFAULT_COLORS;

    return (
        <div className="w-full h-80 bg-white p-4 rounded-lg shadow-sm">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    {metrics.map((metric, index) => (
                        <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

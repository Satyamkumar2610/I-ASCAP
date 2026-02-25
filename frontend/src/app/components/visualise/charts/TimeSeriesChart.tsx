
"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';

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
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">No data available for chart</span>
            </div>
        );
    }

    const chartColors = colors || DEFAULT_COLORS;

    return (
        <div className="w-full h-80 bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
            <ReactECharts
                option={{
                    grid: { top: 30, right: 15, bottom: 20, left: 45 },
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        textStyle: { color: '#0f172a', fontSize: 11 },
                        padding: [10, 14],
                        axisPointer: { type: 'line', lineStyle: { color: '#cbd5e1', type: 'dashed' } }
                    },
                    legend: {
                        data: metrics.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
                        bottom: 0,
                        textStyle: { color: '#64748b', fontSize: 11 },
                        icon: 'circle'
                    },
                    xAxis: {
                        type: 'category',
                        data: data.map(d => d.year),
                        axisLabel: { color: '#64748b', fontSize: 10 },
                        axisLine: { show: false },
                        axisTick: { show: false }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val },
                        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
                        axisLine: { show: false }
                    },
                    series: metrics.map((metric, index) => ({
                        name: metric.charAt(0).toUpperCase() + metric.slice(1),
                        type: 'line',
                        data: data.map(d => d[metric]),
                        smooth: true,
                        symbol: 'none',
                        itemStyle: { color: chartColors[index % chartColors.length] },
                        lineStyle: { width: 2.5 }
                    }))
                }}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
}

"use client";

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartDataPoint {
    year: number;
    [key: string]: number;
}

interface PieChartProps {
    data: ChartDataPoint[];
    metric: string; // e.g., 'production'
}

export function PieChart({ data, metric }: PieChartProps) {
    // Pie charts usually show proportions of a whole. 
    // We'll group the last 10 years of data into 2-year buckets or just show top 5 years
    const pieData = useMemo(() => {
        if (!data || data.length === 0) return [];
        // Sort descending by year
        const sorted = [...data].sort((a, b) => b.year - a.year).slice(0, 10);
        return sorted.map(d => ({
            name: String(d.year),
            value: d[metric]
        })).sort((a, b) => b.value - a.value); // Sort by largest piece
    }, [data, metric]);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">No data available for chart</span>
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
            <ReactECharts
                option={{
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        type: 'scroll',
                        orient: 'vertical',
                        right: 10,
                        top: 20,
                        bottom: 20,
                    },
                    series: [
                        {
                            name: metric.charAt(0).toUpperCase() + metric.slice(1),
                            type: 'pie',
                            radius: ['40%', '70%'],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 10,
                                borderColor: '#fff',
                                borderWidth: 2
                            },
                            label: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: 16,
                                    fontWeight: 'bold'
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: pieData
                        }
                    ]
                }}
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
}

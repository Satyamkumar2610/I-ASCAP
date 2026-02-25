
"use client";
import ReactECharts from 'echarts-for-react';

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

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#ffffff',
            borderColor: '#e2e8f0',
            textStyle: { color: '#0f172a', fontSize: 11 },
            formatter: (params: any) => {
                let html = `<div class="font-bold text-slate-700 mb-1 border-b border-slate-100 pb-1">${params[0].axisValue}</div>`;
                params.forEach((p: any) => {
                    html += `
                        <div class="flex items-center gap-2 my-1">
                            <span class="w-2 h-2 rounded-full font-bold" style="background-color: ${p.color}"></span>
                            <span class="text-slate-600">${p.seriesName.length > 20 ? p.seriesName.slice(0, 20) + '...' : p.seriesName}:</span>
                            <span class="font-bold" style="color: ${p.color}">${getUnitCallback(Number(p.value || 0))}</span>
                        </div>
                    `;
                });
                return html;
            }
        },
        legend: {
            textStyle: { color: '#64748b', fontSize: 11 },
            top: 0,
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8
        },
        grid: { top: 35, right: 10, bottom: 20, left: 50, containLabel: false },
        xAxis: {
            type: 'category',
            data: data.map(d => d.year),
            axisLine: { lineStyle: { color: '#cbd5e1' } },
            axisTick: { show: false },
            axisLabel: { color: '#64748b', fontSize: 10, formatter: (val: string) => val.slice(-2) }
        },
        yAxis: {
            type: 'value',
            name: metric === 'yield' ? 'kg/ha' : metric === 'production' ? 'tons' : 'ha',
            nameLocation: 'middle',
            nameGap: 35,
            nameTextStyle: { color: '#94a3b8', fontSize: 10 },
            splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
            axisLabel: {
                color: '#64748b',
                fontSize: 10,
                formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
            }
        },
        series: [
            ...series.map((s, idx) => ({
                name: s.label,
                type: 'line',
                data: data.map(d => d[s.id]),
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: false,
                itemStyle: { color: COLORS[idx % COLORS.length] },
                lineStyle: {
                    width: s.style === 'solid' ? 2.5 : 2,
                    type: s.style === 'dashed' ? 'dashed' : 'solid'
                },
                connectNulls: true
            })),
            {
                name: 'Split Year',
                type: 'line',
                markLine: {
                    symbol: ['none', 'none'],
                    label: {
                        formatter: 'SPLIT',
                        position: 'insideStartTop',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: 10
                    },
                    lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
                    data: [{ xAxis: String(splitYear) }]
                }
            }
        ]
    };

    return (
        <div
            className="h-64 md:h-80 w-full bg-white border border-slate-200 rounded-xl p-3 md:p-5 shadow-sm"
            role="img"
            aria-label={`Line chart showing ${metric} trends relative to split year ${splitYear}`}
        >
            <ReactECharts
                option={option}
                style={{ height: '100%', width: '100%', minHeight: '200px' }}
            />
        </div>
    );
}

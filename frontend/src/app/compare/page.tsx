'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { api } from '../services/api';
import ReactECharts from 'echarts-for-react';
import { EfficiencyData, RiskData } from '../../types/analysis';

interface ComparisonData {
    id: string;
    district: string;
    year: number;
    crop: string;
    efficiency: EfficiencyData | null;
    risk: RiskData | null;
}

interface RadarDataPoint {
    metric: string;
    fullMark: number;
    [key: string]: string | number;
}

function CompareContent() {
    const searchParams = useSearchParams();
    const idsString = searchParams.get('ids');
    const ids = React.useMemo(() => idsString?.split(',') || [], [idsString]);

    // Parallel Data Fetching with React Query
    const queryResults = useQueries({
        queries: ids.map(id => {
            const [district, yearStr, crop] = id.split('-');
            const year = parseInt(yearStr);
            return {
                queryKey: ['comparison', district, year, crop],
                queryFn: async (): Promise<ComparisonData> => {
                    // Fetch both metrics in parallel for this district
                    const [efficiency, risk] = await Promise.all([
                        api.getEfficiency(district, crop, year),
                        api.getRiskProfile(district, crop)
                    ]);
                    return { id, district, year, crop, efficiency, risk };
                },
                staleTime: 1000 * 60 * 30, // 30 mins
            };
        })
    });

    const loading = queryResults.some(q => q.isLoading);
    const data = queryResults.map(q => q.data).filter(Boolean) as ComparisonData[]; // Safe casting after filter

    if (ids.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl text-slate-400">No districts selected for comparison.</h2>
                <Link href="/" className="text-emerald-400 hover:underline mt-4 inline-block">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading comparison data...</div>;
    }

    // Transform Data for Radar Chart
    const radarMetrics = [
        { metric: 'Efficiency', fullMark: 100 },
        { metric: 'Resilience', fullMark: 100 },
        { metric: 'Stability', fullMark: 100 },
        { metric: 'Hist. Perf', fullMark: 100 },
    ];

    const radarData = radarMetrics.map(m => {
        const point: RadarDataPoint = { metric: m.metric, fullMark: m.fullMark };
        data.forEach((d, i) => {
            let val = 0;
            if (d.efficiency && d.risk) {
                if (m.metric === 'Efficiency') val = d.efficiency.relative_efficiency.efficiency_score * 100;
                if (m.metric === 'Resilience') val = d.risk.resilience_index.resilience_score * 100;
                if (m.metric === 'Stability') val = Math.max(0, 100 - (d.risk.risk_profile.volatility_score * 2)); // Amplify CV impact
                if (m.metric === 'Hist. Perf') val = Math.min(100, Math.max(0, 50 + (d.efficiency.historical_efficiency.efficiency_ratio - 1) * 200)); // Baseline 50, +/- scaled
            }
            point[`d${i}`] = Math.round(val);
        });
        return point;
    });

    const colors = ['#10b981', '#3b82f6', '#f59e0b']; // Emerald, Blue, Amber

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                    <ArrowLeft size={20} className="text-slate-200" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Comparative Analysis</h1>
                    <p className="text-slate-500 text-sm">Comparing {data.length} districts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Radar Chart (Visual) */}
                <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Strategic Balance</h3>
                    <div className="h-[300px] w-full">
                        <ReactECharts
                            option={{
                                tooltip: {
                                    trigger: 'item',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderColor: '#e2e8f0',
                                    textStyle: { color: '#0f172a', fontSize: 12 },
                                },
                                legend: {
                                    bottom: 0,
                                    textStyle: { color: '#64748b' }
                                },
                                radar: {
                                    indicator: radarMetrics.map(m => ({ name: m.metric, max: m.fullMark })),
                                    splitNumber: 4,
                                    axisName: { color: '#64748b', fontSize: 12 },
                                    splitLine: { lineStyle: { color: '#e2e8f0' } },
                                    splitArea: { show: false },
                                    axisLine: { lineStyle: { color: '#cbd5e1' } }
                                },
                                series: [{
                                    type: 'radar',
                                    data: data.map((d, i) => ({
                                        value: radarMetrics.map(m => {
                                            const point = radarData.find(p => p.metric === m.metric);
                                            return point ? point[`d${i}`] as number : 0;
                                        }),
                                        name: d.district,
                                        itemStyle: { color: colors[i % colors.length] },
                                        areaStyle: { color: colors[i % colors.length], opacity: 0.3 }
                                    }))
                                }]
                            }}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>
                </div>

                {/* 2. Detailed Cards/Table */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 relative overflow-hidden" style={{ borderColor: colors[idx % colors.length] + '40' }}>
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colors[idx % colors.length] }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{item.district}</h2>
                                    <div className="text-xs text-slate-500">{item.year} • <span className="capitalize">{item.crop}</span></div>
                                </div>
                                <div className="text-2xl font-bold" style={{ color: colors[idx % colors.length] }}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            {item.efficiency && item.risk ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Rel. Efficiency</div>
                                            <div className="text-lg font-bold text-emerald-600">
                                                {(item.efficiency.relative_efficiency.efficiency_score * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium">Gap: {item.efficiency.relative_efficiency.yield_gap_pct.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Resilience</div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {(item.risk.resilience_index.resilience_score * 100).toFixed(0)}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium">Grade {item.risk.resilience_index.reliability_rating}</div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 font-medium">Volatility (CV)</span>
                                            <span className="text-slate-900 font-bold">{item.risk.risk_profile.volatility_score.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 font-medium">5y CAGR</span>
                                            <span className={`font-bold ${item.risk.growth_matrix.cagr_5y > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.risk.growth_matrix.cagr_5y}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Yield</span>
                                            <span className="text-slate-900 font-bold">{item.efficiency.relative_efficiency.district_yield.toFixed(0)} kg/ha</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-10">Data Unavailable</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Unified Comparison Table (Bottom) */}
            <div className="mt-8 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Direct Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 font-bold uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Metric</th>
                                {data.map((d, i) => (
                                    <th key={i} className="px-6 py-3" style={{ color: colors[i % colors.length] }}>
                                        {d.district}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-900">
                            <tr className="bg-slate-50/50">
                                <td className="px-6 py-3 font-semibold text-slate-600">Resilience Index</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3 font-bold">
                                        {d.risk ? (d.risk.resilience_index.resilience_score * 100).toFixed(0) : '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-semibold text-slate-600">Relative Efficiency</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.efficiency ? (d.efficiency.relative_efficiency.efficiency_score * 100).toFixed(1) : '-'}%
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-semibold text-slate-600">Yield (kg/ha)</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.efficiency ? d.efficiency.relative_efficiency.district_yield.toFixed(0) : '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-semibold text-slate-600">Volatility (CV)</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.risk ? d.risk.risk_profile.volatility_score.toFixed(1) : '-'}%
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-semibold text-slate-600">Growth (CAGR)</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.risk ? d.risk.growth_matrix.cagr_5y : '-'}%
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="text-slate-500 font-bold text-center pt-20">Loading comparisons...</div>}>
            <CompareContent />
        </Suspense>
    );
}

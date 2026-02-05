'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { api } from '../services/api';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    Legend, Tooltip as RechartsTooltip
} from 'recharts';
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
                    <h1 className="text-2xl font-bold text-white">Comparative Analysis</h1>
                    <p className="text-slate-500 text-sm">Comparing {data.length} districts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Radar Chart (Visual) */}
                <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Strategic Balance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                {data.map((d, i) => (
                                    <Radar
                                        key={d.id}
                                        name={d.district}
                                        dataKey={`d${i}`}
                                        stroke={colors[i % colors.length]}
                                        fill={colors[i % colors.length]}
                                        fillOpacity={0.3}
                                    />
                                ))}
                                <Legend />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Detailed Cards/Table */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden" style={{ borderColor: colors[idx % colors.length] + '40' }}>
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colors[idx % colors.length] }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{item.district}</h2>
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
                                        <div className="bg-slate-950/50 p-2 rounded">
                                            <div className="text-[10px] text-slate-500 uppercase">Rel. Efficiency</div>
                                            <div className="text-lg font-bold text-emerald-400">
                                                {(item.efficiency.relative_efficiency.efficiency_score * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-[10px] text-slate-600">Gap: {item.efficiency.relative_efficiency.yield_gap_pct.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded">
                                            <div className="text-[10px] text-slate-500 uppercase">Resilience</div>
                                            <div className="text-lg font-bold text-blue-400">
                                                {(item.risk.resilience_index.resilience_score * 100).toFixed(0)}
                                            </div>
                                            <div className="text-[10px] text-slate-600">Grade {item.risk.resilience_index.reliability_rating}</div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-800 pt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">Volatility (CV)</span>
                                            <span className="text-slate-200">{item.risk.risk_profile.volatility_score.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">5y CAGR</span>
                                            <span className={`${item.risk.growth_matrix.cagr_5y > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {item.risk.growth_matrix.cagr_5y}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Yield</span>
                                            <span className="text-slate-200">{item.efficiency.relative_efficiency.district_yield.toFixed(0)} kg/ha</span>
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
            <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Direct Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">Metric</th>
                                {data.map((d, i) => (
                                    <th key={i} className="px-6 py-3" style={{ color: colors[i % colors.length] }}>
                                        {d.district}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr className="bg-slate-900/20">
                                <td className="px-6 py-3 font-medium text-slate-300">Resilience Index</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3 font-bold">
                                        {d.risk ? (d.risk.resilience_index.resilience_score * 100).toFixed(0) : '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-medium text-slate-300">Relative Efficiency</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.efficiency ? (d.efficiency.relative_efficiency.efficiency_score * 100).toFixed(1) : '-'}%
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-medium text-slate-300">Yield (kg/ha)</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.efficiency ? d.efficiency.relative_efficiency.district_yield.toFixed(0) : '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-medium text-slate-300">Volatility (CV)</td>
                                {data.map((d, i) => (
                                    <td key={i} className="px-6 py-3">
                                        {d.risk ? d.risk.risk_profile.volatility_score.toFixed(1) : '-'}%
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="px-6 py-3 font-medium text-slate-300">Growth (CAGR)</td>
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
        <Suspense fallback={<div className="text-white text-center pt-20">Loading comparisons...</div>}>
            <CompareContent />
        </Suspense>
    );
}

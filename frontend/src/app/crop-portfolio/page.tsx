'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Wheat, TrendingUp, TrendingDown, Minus, BarChart3, Grid3X3 } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];
const CORR_POSITIVE = '#10b981';
const CORR_NEGATIVE = '#ef4444';
const CORR_NEUTRAL = '#334155';

function getCdiColor(cdi: number) {
    if (cdi > 0.7) return '#10b981';
    if (cdi > 0.4) return '#f59e0b';
    return '#ef4444';
}

function getCdiBg(cdi: number) {
    if (cdi > 0.7) return 'border-emerald-500/30';
    if (cdi > 0.4) return 'border-amber-500/30';
    return 'border-red-500/30';
}

export default function CropPortfolioPage() {
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCdk, setSelectedCdk] = useState<string>('');
    const [year, setYear] = useState(2014);
    const [rankCrop, setRankCrop] = useState('wheat');

    // Queries
    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    const { data: districtsData } = useQuery({
        queryKey: ['state-districts', selectedState],
        queryFn: () => api.getDistrictsByState(selectedState),
        enabled: !!selectedState,
    });
    const districts = districtsData?.items || [];

    const { data: diversification, isLoading } = useQuery({
        queryKey: ['diversification', selectedCdk, year],
        queryFn: () => api.getDiversification(selectedCdk, year),
        enabled: !!selectedCdk,
    });

    const { data: rankings } = useQuery({
        queryKey: ['rankings', selectedState, rankCrop, year],
        queryFn: () => api.getDistrictRankings(selectedState, rankCrop, year),
        enabled: !!selectedState,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: yieldTrend } = useQuery<any>({
        queryKey: ['yield-trend', selectedCdk, diversification?.dominant_crop],
        queryFn: () => api.getYieldTrend(selectedCdk, diversification?.dominant_crop || 'rice'),
        enabled: !!selectedCdk && !!diversification?.dominant_crop,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: yoyGrowth } = useQuery<any>({
        queryKey: ['yoy-growth', selectedCdk, diversification?.dominant_crop],
        queryFn: () => api.getYoyGrowth(selectedCdk, diversification?.dominant_crop || 'rice'),
        enabled: !!selectedCdk && !!diversification?.dominant_crop,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: correlations } = useQuery<any>({
        queryKey: ['crop-correlations', selectedState, year],
        queryFn: () => api.getCropCorrelations(selectedState, year),
        enabled: !!selectedState,
    });

    // Pie chart data — group small crops as "Others"
    const pieData = useMemo(() => {
        if (!diversification?.breakdown) return [];
        const sorted = Object.entries(diversification.breakdown)
            .filter(([, val]) => (val as number) > 0)
            .map(([name, val]) => ({
                name: name.replace(/_/g, ' '),
                value: Math.round((val as number) * 100),
            }))
            .sort((a, b) => b.value - a.value);

        if (sorted.length <= 6) return sorted;

        const top5 = sorted.slice(0, 5);
        const othersVal = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
        return [...top5, { name: 'Others', value: othersVal }];
    }, [diversification]);

    // Available crops from breakdown for the crop selector
    const availableCrops = useMemo(() => {
        if (!diversification?.breakdown) return ['wheat', 'rice', 'maize'];
        return Object.keys(diversification.breakdown).filter(c => diversification.breakdown[c] > 0);
    }, [diversification]);

    // Yield trend data for LineChart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trendLineData = useMemo<any[]>(() => {
        if (!yoyGrowth?.data) return [];
        return yoyGrowth.data;
    }, [yoyGrowth]);

    // Correlation heatmap data
    const corrCrops = correlations?.crops || [];
    const corrMatrix = correlations?.correlations || {};

    const selectedDistrictName = districts.find(d => d.cdk === selectedCdk)?.name || '';

    return (
        <main className="page-container">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Wheat className="text-amber-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">Crop Portfolio Analyzer</h1>
                </div>
                <p className="text-slate-400 text-sm">Analyze crop diversification, yield trends, and specialization across districts</p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCdk(''); }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-amber-500 transition min-w-[180px]"
                >
                    <option value="">Select a state...</option>
                    {states?.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                </select>
                <select
                    value={selectedCdk}
                    onChange={(e) => setSelectedCdk(e.target.value)}
                    disabled={!selectedState}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-amber-500 transition min-w-[220px] disabled:opacity-50"
                >
                    <option value="">Select a district...</option>
                    {districts.map((d) => (
                        <option key={d.cdk} value={d.cdk}>{d.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={1966}
                    max={2020}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm w-24 focus:border-amber-500 transition"
                />
            </div>

            {/* Empty State */}
            {!selectedCdk && !isLoading && (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto mb-5">
                        <Wheat className="text-slate-600" size={36} />
                    </div>
                    <p className="text-slate-500 text-lg">Select a district to analyze its crop portfolio</p>
                    <p className="text-slate-600 text-sm mt-1">Choose a state and district to begin</p>
                </div>
            )}

            {/* Loading */}
            {isLoading && selectedCdk && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
            )}

            {diversification && (
                <div className="space-y-6 animate-in">
                    {/* District Label */}
                    {selectedDistrictName && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="text-xs uppercase tracking-wider text-slate-600">Analyzing</span>
                            <span className="text-white font-semibold">{selectedDistrictName}</span>
                            <span className="text-slate-600">•</span>
                            <span>{year}</span>
                        </div>
                    )}

                    {/* ── KPI Cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CDI Gauge */}
                        <div className={`stat-card text-center border-l-4 ${getCdiBg(diversification.cdi)}`}>
                            <div className="text-xs text-slate-500 uppercase mb-2 tracking-wider">Diversification Index</div>
                            <div className="relative w-28 h-28 mx-auto mb-2">
                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
                                    <circle
                                        cx="60" cy="60" r="52" fill="none"
                                        stroke={getCdiColor(diversification.cdi)}
                                        strokeWidth="10"
                                        strokeDasharray={`${diversification.cdi * 327} 327`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{(diversification.cdi * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full" style={{
                                backgroundColor: getCdiColor(diversification.cdi) + '20',
                                color: getCdiColor(diversification.cdi)
                            }}>
                                {diversification.interpretation}
                            </span>
                        </div>

                        {/* Dominant Crop */}
                        <div className="stat-card text-center border-l-4 border-amber-500/30">
                            <div className="text-xs text-slate-500 uppercase mb-2 tracking-wider">Dominant Crop</div>
                            <div className="text-2xl font-bold text-amber-400 capitalize mb-1">
                                {diversification.dominant_crop?.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-slate-400">
                                {(diversification.dominant_share * 100).toFixed(1)}% of total area
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                                <div
                                    className="h-1.5 rounded-full bg-amber-500 transition-all duration-700"
                                    style={{ width: `${diversification.dominant_share * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Crops Grown */}
                        <div className="stat-card text-center border-l-4 border-blue-500/30">
                            <div className="text-xs text-slate-500 uppercase mb-2 tracking-wider">Crops Grown</div>
                            <div className="text-4xl font-bold text-blue-400 mb-1">{diversification.crop_count}</div>
                            <div className="text-xs text-slate-500">
                                {diversification.crop_count > 8 ? 'Highly diversified portfolio' :
                                    diversification.crop_count > 4 ? 'Moderate crop variety' : 'Limited crop selection'}
                            </div>
                        </div>
                    </div>

                    {/* ── Pie Chart + Rankings ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="glass-card rounded-xl p-5">
                            <h3 className="section-header">Crop Share Distribution</h3>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            innerRadius={60}
                                            dataKey="value"
                                            label={({ name, value, cx: chartCx, x }) => {
                                                const isRight = x > (chartCx as number);
                                                return (
                                                    <text
                                                        x={x}
                                                        y={0}
                                                        textAnchor={isRight ? 'start' : 'end'}
                                                        dominantBaseline="central"
                                                        className="fill-slate-300 text-[11px]"
                                                    >
                                                        {name} {value}%
                                                    </text>
                                                );
                                            }}
                                            stroke="rgba(15, 23, 42, 0.9)"
                                            strokeWidth={2}
                                            animationBegin={0}
                                            animationDuration={800}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12, borderRadius: 8 }}
                                            formatter={(val: number | undefined) => [`${val ?? 0}%`, 'Share']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* District Rankings with crop selector */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={14} className="text-emerald-400" />
                                    <h3 className="section-header mb-0">District Yield Rankings</h3>
                                </div>
                                <select
                                    value={rankCrop}
                                    onChange={(e) => setRankCrop(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 text-slate-300 rounded-md px-2 py-1 text-xs focus:border-emerald-500 transition"
                                >
                                    {availableCrops.map(c => (
                                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            {rankings && rankings.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={rankings.slice(0, 10)} layout="vertical">
                                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis dataKey="district" type="category" width={110} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12, borderRadius: 8 }}
                                                formatter={(val: number | undefined) => [`${val ?? 0} kg/ha`, 'Yield']}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={600}>
                                                {rankings.slice(0, 10).map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500 text-sm">
                                    No ranking data for {rankCrop.replace(/_/g, ' ')} in {year}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Yield Trend ── */}
                    {trendLineData.length > 0 && (
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-cyan-400" />
                                    <h3 className="section-header mb-0">
                                        Yield Trend — {(diversification.dominant_crop || '').replace(/_/g, ' ')}
                                    </h3>
                                </div>
                                {yieldTrend && (
                                    <div className="flex items-center gap-2">
                                        {yieldTrend.trend === 'increasing' ? (
                                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                                                <TrendingUp size={12} /> +{yieldTrend.cagr_percent?.toFixed(1) ?? '?'}% CAGR
                                            </span>
                                        ) : yieldTrend.trend === 'decreasing' ? (
                                            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                                <TrendingDown size={12} /> {yieldTrend.cagr_percent?.toFixed(1) ?? '?'}% CAGR
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                                                <Minus size={12} /> Stable
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendLineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12, borderRadius: 8 }}
                                            formatter={(val: number | undefined) => [`${(val ?? 0).toFixed(0)} kg/ha`, 'Yield']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="yield"
                                            stroke="#06b6d4"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
                                            activeDot={{ r: 5, fill: '#06b6d4' }}
                                            animationDuration={1000}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── Crop Correlation Heatmap ── */}
                    {corrCrops.length > 0 && (
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Grid3X3 size={14} className="text-purple-400" />
                                <h3 className="section-header mb-0">Crop Yield Correlations — {selectedState}</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Green = positive correlation (crops grow together), Red = negative (substitution pattern)
                            </p>
                            <div className="overflow-x-auto">
                                <table className="text-xs w-auto mx-auto">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-slate-500" />
                                            {corrCrops.map((c: string) => (
                                                <th key={c} className="p-2 text-slate-400 capitalize font-medium text-center min-w-[70px]">
                                                    {c.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {corrCrops.map((row: string) => (
                                            <tr key={row}>
                                                <td className="p-2 text-slate-400 capitalize font-medium text-right pr-3">{row.replace(/_/g, ' ')}</td>
                                                {corrCrops.map((col: string) => {
                                                    const val = corrMatrix[row]?.[col];
                                                    const isIdentity = row === col;
                                                    const bgColor = isIdentity ? '#1e293b' :
                                                        val === null || val === undefined ? CORR_NEUTRAL :
                                                            val > 0 ? CORR_POSITIVE : CORR_NEGATIVE;
                                                    const opacity = isIdentity ? 1 : Math.min(Math.abs(val ?? 0), 1);
                                                    return (
                                                        <td
                                                            key={col}
                                                            className="p-2 text-center font-mono rounded-sm"
                                                            style={{
                                                                backgroundColor: isIdentity ? '#1e293b' : `${bgColor}${Math.round(opacity * 40 + 15).toString(16).padStart(2, '0')}`,
                                                                color: isIdentity ? '#475569' :
                                                                    val === null || val === undefined ? '#475569' :
                                                                        val > 0.3 ? '#10b981' : val < -0.3 ? '#ef4444' : '#94a3b8'
                                                            }}
                                                            title={val !== null && val !== undefined ? `${row} × ${col}: ${val}` : 'Insufficient data'}
                                                        >
                                                            {isIdentity ? '—' : val !== null && val !== undefined ? val.toFixed(2) : '·'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Detailed Crop Breakdown Table ── */}
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/50">
                            <h3 className="section-header mb-0">Detailed Crop Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left">#</th>
                                        <th className="px-5 py-3 text-left">Crop</th>
                                        <th className="px-5 py-3 text-right">Share (%)</th>
                                        <th className="px-5 py-3 text-left" style={{ minWidth: 200 }}>Visual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {pieData.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-800/20 transition">
                                            <td className="px-5 py-3 text-slate-600 text-xs font-mono">{i + 1}</td>
                                            <td className="px-5 py-3 text-slate-300 capitalize flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-200 font-mono">{item.value}%</td>
                                            <td className="px-5 py-3">
                                                <div className="w-full bg-slate-800 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-700"
                                                        style={{ width: `${item.value}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

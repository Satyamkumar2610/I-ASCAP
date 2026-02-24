'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Wheat, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis
} from 'recharts';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

export default function CropPortfolioPage() {
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCdk, setSelectedCdk] = useState<string>('');
    const [year, setYear] = useState(2015);

    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    const { data: districtsSearch } = useQuery({
        queryKey: ['state-districts', selectedState],
        queryFn: () => api.searchDistricts(selectedState, 'district'),
        enabled: !!selectedState,
    });

    const districts = districtsSearch?.results?.filter(d => d.state === selectedState) || [];

    const { data: diversification, isLoading } = useQuery({
        queryKey: ['diversification', selectedCdk, year],
        queryFn: () => api.getDiversification(selectedCdk, year),
        enabled: !!selectedCdk,
    });

    const { data: rankings } = useQuery({
        queryKey: ['rankings', selectedState, 'wheat', year],
        queryFn: () => api.getDistrictRankings(selectedState, 'wheat', year),
        enabled: !!selectedState,
    });

    // Transform diversification breakdown to pie chart data
    const pieData = React.useMemo(() => {
        if (!diversification?.breakdown) return [];
        return Object.entries(diversification.breakdown)
            .filter(([, val]) => (val as number) > 0)
            .map(([name, val]) => ({
                name: name.replace(/_/g, ' '),
                value: Math.round((val as number) * 100),
            }))
            .sort((a, b) => b.value - a.value);
    }, [diversification]);

    return (
        <main className="page-container">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Wheat className="text-amber-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">Crop Portfolio Analyzer</h1>
                </div>
                <p className="text-slate-400 text-sm">Analyze crop diversification and specialization across districts</p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap gap-3 mb-8">
                <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCdk(''); }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-amber-500 transition min-w-[150px]"
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
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-amber-500 transition min-w-[200px] disabled:opacity-50"
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
                    min={1990}
                    max={2017}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm w-24 focus:border-amber-500 transition"
                />
            </div>

            {!selectedCdk && (
                <div className="text-center py-20">
                    <PieChartIcon className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500">Select a district to analyze its crop portfolio</p>
                </div>
            )}

            {isLoading && selectedCdk && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                </div>
            )}

            {diversification && (
                <div className="space-y-6 animate-in">
                    {/* CDI Score */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="stat-card text-center">
                            <div className="text-xs text-slate-500 uppercase mb-1">Diversification Index (CDI)</div>
                            <div className="stat-value text-3xl">{(diversification.cdi * 100).toFixed(1)}%</div>
                            <div className="text-xs text-slate-400 mt-1">{diversification.interpretation}</div>
                        </div>
                        <div className="stat-card text-center">
                            <div className="text-xs text-slate-500 uppercase mb-1">Dominant Crop</div>
                            <div className="text-lg font-bold text-amber-400 capitalize">{diversification.dominant_crop?.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-slate-400 mt-1">{(diversification.dominant_share * 100).toFixed(1)}% share</div>
                        </div>
                        <div className="stat-card text-center">
                            <div className="text-xs text-slate-500 uppercase mb-1">Crops Grown</div>
                            <div className="stat-value text-3xl">{diversification.crop_count}</div>
                        </div>
                    </div>

                    {/* Pie Chart + Rankings */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="glass-card rounded-xl p-5">
                            <h3 className="section-header">Crop Share Distribution</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={50}
                                            dataKey="value"
                                            label={({ name, value }) => `${name} ${value}%`}
                                            stroke="rgba(15, 23, 42, 0.8)"
                                            strokeWidth={2}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                                            formatter={(val: number | undefined) => [`${val ?? 0}%`, 'Share']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* District Rankings */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 size={14} className="text-emerald-400" />
                                <h3 className="section-header mb-0">District Yield Rankings (Wheat)</h3>
                            </div>
                            {rankings && rankings.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={rankings.slice(0, 10)} layout="vertical">
                                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis dataKey="district" type="category" width={110} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                                                formatter={(val: number | undefined) => [`${val ?? 0} kg/ha`, 'Yield']}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                {rankings.slice(0, 10).map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500 text-sm">
                                    No ranking data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Crop Breakdown Table */}
                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/50">
                            <h3 className="section-header mb-0">Detailed Crop Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Crop</th>
                                        <th className="px-5 py-3 text-right">Share (%)</th>
                                        <th className="px-5 py-3 text-left">Visual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {pieData.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-800/20 transition">
                                            <td className="px-5 py-3 text-slate-300 capitalize flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                {item.name}
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-200 font-mono">{item.value}%</td>
                                            <td className="px-5 py-3">
                                                <div className="w-full bg-slate-800 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all"
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

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, StateOverview } from '../services/api';
import Link from 'next/link';
import { MapPin, TrendingUp, TrendingDown, Layers, BarChart3, ArrowRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CROPS = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'maize', label: 'Maize' },
    { value: 'sorghum', label: 'Sorghum' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'soyabean', label: 'Soybean' },
    { value: 'groundnut', label: 'Groundnut' },
    { value: 'sugarcane', label: 'Sugarcane' },
];

export default function StatePage() {
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCrop, setSelectedCrop] = useState('wheat');

    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    const { data: overview, isLoading } = useQuery({
        queryKey: ['state-overview', selectedState, selectedCrop],
        queryFn: () => api.getStateOverview(selectedState, selectedCrop),
        enabled: !!selectedState,
    });

    return (
        <main className="page-container">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">State Dashboard</h1>
                <p className="text-slate-400 text-sm">Aggregate agricultural analytics by state</p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap gap-3 mb-8">
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 transition min-w-[200px]"
                >
                    <option value="">Select a state...</option>
                    {states?.map((s) => (
                        <option key={s.state} value={s.state}>
                            {s.state} ({s.district_count} districts)
                        </option>
                    ))}
                </select>
                <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 transition"
                >
                    {CROPS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            {!selectedState && (
                <div className="text-center py-20">
                    <Layers className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500">Select a state to view its dashboard</p>
                </div>
            )}

            {isLoading && selectedState && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            )}

            {overview && (
                <div className="space-y-8 animate-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat-card">
                            <div className="text-xs text-slate-500 uppercase mb-1">Total Districts</div>
                            <div className="stat-value">{overview.total_districts}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-slate-500 uppercase mb-1">With Data</div>
                            <div className="stat-value">{overview.districts_with_data}</div>
                            <div className="text-xs text-slate-500 mt-1">for {selectedCrop} in {overview.year}</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-slate-500 uppercase mb-1">Avg Yield</div>
                            <div className="stat-value">{overview.avg_yield.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1">kg/ha</div>
                        </div>
                        <div className="stat-card">
                            <div className="text-xs text-slate-500 uppercase mb-1">Data Range</div>
                            <div className="stat-value text-lg">{overview.year_range.min}–{overview.year_range.max}</div>
                        </div>
                    </div>

                    {/* Top & Bottom Performers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top 5 */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <h3 className="section-header mb-0">Top Performers</h3>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overview.top_performers} layout="vertical">
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis dataKey="district_name" type="category" width={120} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                                            formatter={(val: number | undefined) => [`${val ?? 0} kg/ha`, 'Yield']}
                                        />
                                        <Bar dataKey="yield_value" radius={[0, 4, 4, 0]}>
                                            {overview.top_performers.map((_, i) => (
                                                <Cell key={i} fill={`hsl(${160 - i * 8}, 70%, ${55 - i * 5}%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bottom 5 */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={16} className="text-red-400" />
                                <h3 className="section-header mb-0">Bottom Performers</h3>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overview.bottom_performers} layout="vertical">
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis dataKey="district_name" type="category" width={120} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                                            formatter={(val: number | undefined) => [`${val ?? 0} kg/ha`, 'Yield']}
                                        />
                                        <Bar dataKey="yield_value" radius={[0, 4, 4, 0]}>
                                            {overview.bottom_performers.map((_, i) => (
                                                <Cell key={i} fill={`hsl(${0 + i * 5}, 70%, ${50 + i * 3}%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Available Crops */}
                    <div className="glass-card rounded-xl p-5">
                        <h3 className="section-header">Available Crops in {overview.state}</h3>
                        <div className="flex flex-wrap gap-2">
                            {overview.available_crops.map((crop) => (
                                <button
                                    key={crop}
                                    onClick={() => setSelectedCrop(crop)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${crop === selectedCrop
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
                                        }`}
                                >
                                    {crop.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="glass-card rounded-xl p-5">
                        <h3 className="section-header">Explore Districts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {overview.top_performers.slice(0, 6).map((d) => (
                                <Link
                                    key={d.cdk}
                                    href={`/?district=${d.cdk}&crop=${selectedCrop}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/60 transition group"
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-emerald-500" />
                                        <span className="text-sm text-slate-300">{d.district_name}</span>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

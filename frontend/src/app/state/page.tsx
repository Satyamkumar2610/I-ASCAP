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
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

    const years = Array.from({ length: 2017 - 1966 + 1 }, (_, i) => 2017 - i);

    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    const { data: overview, isLoading } = useQuery({
        queryKey: ['state-overview', selectedState, selectedCrop, selectedYear],
        queryFn: () => api.getStateOverview(selectedState, selectedCrop, selectedYear),
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
                <select
                    value={selectedYear ?? ''}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 transition"
                >
                    <option value="">Latest Year</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
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
                                        <defs>
                                            <linearGradient id="topGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="district_name" type="category" width={120} tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(30, 41, 59, 0.4)' }}
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(148, 163, 184, 0.2)', color: '#f8fafc', fontSize: 12, borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                                            formatter={(val: number | undefined) => [`${val?.toLocaleString() ?? 0} kg/ha`, 'Yield']}
                                        />
                                        <Bar dataKey="yield_value" radius={[0, 4, 4, 0]} barSize={20} fill="url(#topGradient)" animationDuration={1000} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bottom 5 */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={16} className="text-rose-400" />
                                <h3 className="section-header mb-0">Bottom Performers</h3>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overview.bottom_performers} layout="vertical">
                                        <defs>
                                            <linearGradient id="bottomGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#fb7185" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="district_name" type="category" width={120} tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(30, 41, 59, 0.4)' }}
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(148, 163, 184, 0.2)', color: '#f8fafc', fontSize: 12, borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                                            formatter={(val: number | undefined) => [`${val?.toLocaleString() ?? 0} kg/ha`, 'Yield']}
                                        />
                                        <Bar dataKey="yield_value" radius={[0, 4, 4, 0]} barSize={20} fill="url(#bottomGradient)" animationDuration={1000} />
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
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition ${crop === selectedCrop
                                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                                        : 'bg-slate-800/40 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800/80'
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

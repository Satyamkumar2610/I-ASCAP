'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { GitBranch, Calendar, Database, MapPin, ChevronDown } from 'lucide-react';

interface SplitEvent {
    state_name: string;
    split_year: number;
    parent_district: string;
    child_district: string;
    parent_cdk: string;
    child_cdk: string;
    source: string;
}

export default function LineagePage() {
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCdk, setSelectedCdk] = useState<string>('');
    const [expandedDecade, setExpandedDecade] = useState<number | null>(null);

    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    const { data: history, isLoading } = useQuery({
        queryKey: ['lineage-history', selectedState],
        queryFn: () => api.getLineageHistory(selectedState),
        enabled: !!selectedState,
    });

    const { data: tracking } = useQuery({
        queryKey: ['lineage-tracking', selectedCdk],
        queryFn: () => api.getDataTracking(selectedCdk),
        enabled: !!selectedCdk,
    });

    const { data: coverage } = useQuery({
        queryKey: ['state-coverage', selectedState],
        queryFn: () => api.getStateCoverage(selectedState),
        enabled: !!selectedState,
    });

    // Group history by decade
    const decades = React.useMemo(() => {
        if (!history) return {};
        const grouped: Record<number, SplitEvent[]> = {};
        history.forEach((event: SplitEvent) => {
            const decade = Math.floor(event.split_year / 10) * 10;
            if (!grouped[decade]) grouped[decade] = [];
            grouped[decade].push(event);
        });
        return grouped;
    }, [history]);

    return (
        <main className="page-container">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <GitBranch className="text-purple-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">District Lineage Explorer</h1>
                </div>
                <p className="text-slate-400 text-sm">Explore administrative boundary changes and data provenance (1951–2024)</p>
            </div>

            {/* State Selector */}
            <div className="mb-6">
                <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCdk(''); }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-purple-500 transition min-w-[200px]"
                >
                    <option value="">Select a state...</option>
                    {states?.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                </select>
            </div>

            {!selectedState && (
                <div className="text-center py-20">
                    <GitBranch className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500">Select a state to explore its district lineage</p>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            )}

            {selectedState && history && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
                    {/* Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="section-header">Split Timeline</h3>

                        {Object.keys(decades).length === 0 && (
                            <div className="text-center py-10 text-slate-500 text-sm">
                                No split events recorded for {selectedState}
                            </div>
                        )}

                        {Object.entries(decades)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([decade, events]) => (
                                <div key={decade} className="glass-card rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedDecade(expandedDecade === Number(decade) ? null : Number(decade))}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-purple-400" />
                                            <span className="text-white font-bold">{decade}s</span>
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                                                {events.length} events
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-500 transition-transform ${expandedDecade === Number(decade) ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expandedDecade === Number(decade) && (
                                        <div className="border-t border-slate-700/50 p-4 space-y-3 animate-in">
                                            {events.map((event, i) => (
                                                <div key={i} className="flex items-start gap-3 relative pl-6">
                                                    <div className="timeline-dot absolute left-0 top-1" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-mono text-purple-400">{event.split_year}</span>
                                                        </div>
                                                        <div className="text-sm text-slate-300">
                                                            <span className="text-amber-400">{event.parent_district}</span>
                                                            <span className="text-slate-600 mx-2">→</span>
                                                            <button
                                                                onClick={() => setSelectedCdk(event.child_cdk)}
                                                                className="text-emerald-400 hover:underline"
                                                            >
                                                                {event.child_district}
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] text-slate-600 mt-0.5">
                                                            Source: {event.source || 'Census/Gazette'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Right sidebar: Tracking + Coverage */}
                    <div className="space-y-6">
                        {/* Data Provenance */}
                        {tracking && tracking.district && (
                            <div className="glass-card rounded-xl p-5 animate-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <Database size={14} className="text-cyan-400" />
                                    <h3 className="section-header mb-0">Data Provenance</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-slate-500">District</div>
                                        <div className="text-sm text-white font-medium">{tracking.district.district_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">State</div>
                                        <div className="text-sm text-slate-300">{tracking.district.state_name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs text-slate-500">Years with Data</div>
                                            <div className="text-sm text-emerald-400 font-bold">{tracking.data_coverage.years_with_data}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500">Total Records</div>
                                            <div className="text-sm text-emerald-400 font-bold">{tracking.data_coverage.total_records}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Coverage</div>
                                        <div className="text-sm text-slate-300">
                                            {tracking.data_coverage.first_year} – {tracking.data_coverage.last_year}
                                        </div>
                                    </div>
                                    {tracking.data_sources?.map((src: { source: string; record_count: number }, i: number) => (
                                        <div key={i} className="p-2 bg-slate-800/30 rounded-lg">
                                            <div className="text-xs text-slate-400">{src.source}</div>
                                            <div className="text-xs text-slate-500">{src.record_count} records</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coverage Table */}
                        {coverage && (
                            <div className="glass-card rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin size={14} className="text-emerald-400" />
                                    <h3 className="section-header mb-0">Coverage ({coverage.districts} districts)</h3>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
                                    {coverage.coverage?.map((d: { cdk: string; district_name: string; years_with_data: number; record_count: number }, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedCdk(d.cdk)}
                                            className={`w-full flex items-center justify-between p-2 rounded text-left transition ${selectedCdk === d.cdk ? 'bg-emerald-500/10' : 'hover:bg-slate-800/30'
                                                }`}
                                        >
                                            <span className="text-xs text-slate-300 truncate flex-1">{d.district_name}</span>
                                            <span className="text-[10px] text-slate-500 ml-2">{d.years_with_data}y</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { GitBranch, Calendar, Database, MapPin, ChevronDown, Search, ArrowRight, Clock, Hash, Info } from 'lucide-react';

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
    const [coverageSearch, setCoverageSearch] = useState('');

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
    const decades = useMemo(() => {
        if (!history) return {};
        const grouped: Record<number, SplitEvent[]> = {};
        history.forEach((event: SplitEvent) => {
            const decade = Math.floor(event.split_year / 10) * 10;
            if (!grouped[decade]) grouped[decade] = [];
            grouped[decade].push(event);
        });
        return grouped;
    }, [history]);

    // Summary stats
    const summaryStats = useMemo(() => {
        if (!history || history.length === 0) return null;
        const years = history.map((e: SplitEvent) => e.split_year);
        const parents = new Set(history.map((e: SplitEvent) => e.parent_district));
        return {
            totalEvents: history.length,
            timeSpan: `${Math.min(...years)}–${Math.max(...years)}`,
            uniqueParents: parents.size,
            decadeCount: Object.keys(decades).length,
        };
    }, [history, decades]);

    // Auto-expand the latest decade when data loads
    useEffect(() => {
        const decadeKeys = Object.keys(decades).map(Number);
        if (decadeKeys.length > 0 && expandedDecade === null) {
            // eslint-disable-next-line
            setExpandedDecade(Math.max(...decadeKeys));
        }
    }, [decades, expandedDecade]);

    // Reset expandedDecade when state changes
    useEffect(() => {
        // eslint-disable-next-line
        setExpandedDecade(null);
        setSelectedCdk('');
        setCoverageSearch('');
    }, [selectedState]);

    // Filter coverage by search
    const filteredCoverage = useMemo(() => {
        if (!coverage?.coverage) return [];
        if (!coverageSearch) return coverage.coverage;
        const q = coverageSearch.toLowerCase();
        return coverage.coverage.filter((d: { district_name: string }) =>
            d.district_name.toLowerCase().includes(q)
        );
    }, [coverage, coverageSearch]);

    return (
        <main className="page-container">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <GitBranch className="text-purple-600" size={24} />
                    <h1 className="text-2xl font-bold text-slate-900">District Lineage Explorer</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium">Explore administrative boundary changes and data provenance (1951–2024)</p>
            </div>

            {/* Context Banner */}
            <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-5">
                <h3 className="text-purple-800 font-bold mb-2 flex items-center gap-2 text-sm">
                    <Info size={16} className="text-purple-600" />
                    Why District Lineage Matters
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    India&apos;s administrative map has been continuously redrawn since Independence. Over <strong className="text-purple-800">565 district split events</strong> have been documented across seven decades, with 64% concentrated after 1991. When datasets don&apos;t account for these evolving boundaries, apparent changes in agricultural yield often reflect statistical artifacts of spatial reconfiguration—not genuine agronomic shifts. This explorer lets you trace the exact lineage of these boundary changes.
                </p>
            </div>

            {/* State Selector */}
            <div className="mb-6">
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2 text-sm focus:border-purple-500 transition min-w-[220px] shadow-sm"
                >
                    <option value="">Select a state...</option>
                    {states?.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                </select>
            </div>

            {/* Empty State */}
            {!selectedState && (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
                        <GitBranch className="text-slate-600" size={36} />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">Select a state to explore its district lineage</p>
                    <p className="text-slate-600 text-sm mt-1">View split history, data provenance & coverage</p>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
            )}

            {selectedState && history && (
                <>
                    {/* ── Summary Stats ── */}
                    {summaryStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-in">
                            <div className="stat-card text-center border-l-4 border-purple-500 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Split Events</div>
                                <div className="text-2xl font-bold text-purple-600">{summaryStats.totalEvents}</div>
                            </div>
                            <div className="stat-card text-center border-l-4 border-cyan-500 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Time Span</div>
                                <div className="text-lg font-bold text-cyan-600">{summaryStats.timeSpan}</div>
                            </div>
                            <div className="stat-card text-center border-l-4 border-amber-500 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Parent Districts</div>
                                <div className="text-2xl font-bold text-amber-600">{summaryStats.uniqueParents}</div>
                            </div>
                            <div className="stat-card text-center border-l-4 border-emerald-500 py-3">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-bold">Across Decades</div>
                                <div className="text-2xl font-bold text-emerald-600">{summaryStats.decadeCount}</div>
                            </div>
                        </div>
                    )}

                    {/* ── Main Content Grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
                        {/* Timeline */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="section-header flex items-center gap-2">
                                <Clock size={14} className="text-purple-600" />
                                Split Timeline
                            </h3>

                            {Object.keys(decades).length === 0 && (
                                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center">
                                    <GitBranch className="mx-auto text-slate-500 mb-3" size={32} />
                                    <p className="text-slate-500 text-sm font-medium">No split events recorded for {selectedState}</p>
                                    <p className="text-slate-600 text-xs mt-1">This state may not have undergone district reorganization</p>
                                </div>
                            )}

                            {Object.entries(decades)
                                .sort(([a], [b]) => Number(b) - Number(a))
                                .map(([decade, events]) => (
                                    <div key={decade} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedDecade(expandedDecade === Number(decade) ? null : Number(decade))}
                                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16} className="text-purple-600" />
                                                <span className="text-slate-900 font-bold">{decade}s</span>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                                                    {events.length} {events.length === 1 ? 'event' : 'events'}
                                                </span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-slate-600 transition-transform duration-200 ${expandedDecade === Number(decade) ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {expandedDecade === Number(decade) && (
                                            <div className="border-t border-slate-200 p-4 space-y-3 animate-in">
                                                {events.map((event, i) => (
                                                    <div key={i} className="flex items-start gap-3 relative pl-6">
                                                        <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-100" />
                                                        {i < events.length - 1 && (
                                                            <div className="absolute left-[4px] top-4 w-0.5 h-full bg-slate-200" />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded font-semibold">
                                                                    {event.split_year}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-amber-700 font-semibold">{event.parent_district}</span>
                                                                <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
                                                                <button
                                                                    onClick={() => setSelectedCdk(event.child_cdk)}
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:underline transition font-semibold"
                                                                >
                                                                    {event.child_district}
                                                                </button>
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1 font-medium">
                                                                <Hash size={8} />
                                                                {event.source || 'Census/Gazette'}
                                                                {event.child_cdk && (
                                                                    <span className="ml-2 text-slate-500">LGD: {event.child_cdk}</span>
                                                                )}
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
                                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 animate-in">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Database size={14} className="text-cyan-600" />
                                        <h3 className="section-header mb-0">Data Provenance</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">District</div>
                                            <div className="text-sm text-slate-900 font-semibold">{tracking.district.district_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">State</div>
                                            <div className="text-sm text-slate-700">{tracking.district.state_name}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                                                <div className="text-xs text-slate-500 font-bold">Years with Data</div>
                                                <div className="text-sm text-emerald-600 font-bold">{tracking.data_coverage.years_with_data}</div>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                                                <div className="text-xs text-slate-500 font-bold">Total Records</div>
                                                <div className="text-sm text-emerald-600 font-bold">{tracking.data_coverage.total_records}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Coverage</div>
                                            <div className="text-sm text-slate-700 font-medium">
                                                {tracking.data_coverage.first_year} – {tracking.data_coverage.last_year}
                                            </div>
                                        </div>
                                        {tracking.data_sources?.map((src: { source: string; record_count: number }, i: number) => (
                                            <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="text-xs text-slate-600 font-semibold">{src.source}</div>
                                                <div className="text-xs text-slate-500">{src.record_count.toLocaleString()} records</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coverage Table */}
                            {coverage && (
                                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin size={14} className="text-emerald-600" />
                                        <h3 className="section-header mb-0">Coverage ({coverage.districts} districts)</h3>
                                    </div>

                                    {/* Search */}
                                    <div className="relative mb-3">
                                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="text"
                                            value={coverageSearch}
                                            onChange={(e) => setCoverageSearch(e.target.value)}
                                            placeholder="Filter districts..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-600 focus:border-purple-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
                                        {filteredCoverage.map((d: { cdk: string; district_name: string; years_with_data: number; record_count: number }, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedCdk(d.cdk)}
                                                className={`w-full flex items-center justify-between p-2 rounded text-left transition ${selectedCdk === d.cdk ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'
                                                    }`}
                                            >
                                                <span className="text-xs text-slate-700 truncate flex-1 font-medium">{d.district_name}</span>
                                                <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-full font-bold ${d.years_with_data > 20 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                                                    d.years_with_data > 0 ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                                                        'text-slate-500 bg-slate-100 border border-slate-200'
                                                    }`}>
                                                    {d.years_with_data}y
                                                </span>
                                            </button>
                                        ))}
                                        {filteredCoverage.length === 0 && (
                                            <p className="text-xs text-slate-600 text-center py-4">No matching districts</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

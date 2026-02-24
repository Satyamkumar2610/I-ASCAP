'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Shield, AlertTriangle, TrendingDown, Search, ChevronRight, Activity } from 'lucide-react';

function RiskBadge({ level }: { level: string }) {
    const cls = `badge-${level}`;
    return <span className={cls}>{level}</span>;
}

export default function RiskMonitorPage() {
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCdk, setSelectedCdk] = useState<string>('');

    // High-risk districts feed
    const { data: highRisk, isLoading: loadingHighRisk } = useQuery({
        queryKey: ['high-risk'],
        queryFn: () => api.getHighRiskDistricts(15),
        staleTime: 1000 * 60 * 5,
    });

    // State list for scanner
    const { data: states } = useQuery({
        queryKey: ['states-list'],
        queryFn: () => api.getStatesList(),
    });

    // State anomaly scan
    const { data: stateAnomalies, isLoading: scanningState } = useQuery({
        queryKey: ['state-anomalies', selectedState],
        queryFn: () => api.getStateAnomalies(selectedState),
        enabled: !!selectedState,
    });

    // Individual district drill-down
    const { data: districtAnomalies, isLoading: scanningDistrict } = useQuery({
        queryKey: ['district-anomalies', selectedCdk],
        queryFn: () => api.getDistrictAnomalies(selectedCdk),
        enabled: !!selectedCdk,
    });

    return (
        <main className="page-container">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Shield className="text-red-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">Risk & Anomaly Monitor</h1>
                </div>
                <p className="text-slate-400 text-sm">Real-time anomaly detection and risk assessment across districts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: High Risk Feed */}
                <div className="lg:col-span-1 glass-card rounded-xl p-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} className="text-red-400" />
                        <h3 className="section-header mb-0">High-Risk Districts</h3>
                    </div>

                    {loadingHighRisk && (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        </div>
                    )}

                    {highRisk?.high_risk_districts.map((d, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedCdk(d.cdk)}
                            className={`w-full text-left p-3 rounded-lg mb-2 border transition ${selectedCdk === d.cdk
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-200">{d.district_name}</span>
                                <RiskBadge level={d.risk_level} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{d.state}</span>
                                <span className="text-xs text-slate-400">Score: {d.risk_score}</span>
                            </div>
                            {d.factors.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {d.factors.slice(0, 3).map((f, fi) => (
                                        <span key={fi} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}

                    {highRisk && (
                        <div className="text-xs text-slate-600 mt-3 text-center">
                            Scanned {highRisk.total_scanned} districts
                        </div>
                    )}
                </div>

                {/* Right: Scanner + Drill-down */}
                <div className="lg:col-span-2 space-y-6">
                    {/* State Scanner */}
                    <div className="glass-card rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Search size={14} className="text-amber-400" />
                            <h3 className="section-header mb-0">State Anomaly Scanner</h3>
                        </div>
                        <div className="flex gap-3 mb-4">
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-amber-500 transition flex-1"
                            >
                                <option value="">Select state to scan...</option>
                                {states?.map((s) => (
                                    <option key={s.state} value={s.state}>{s.state}</option>
                                ))}
                            </select>
                        </div>

                        {scanningState && (
                            <div className="flex items-center gap-2 py-4 text-amber-400 text-sm">
                                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                Scanning {selectedState}...
                            </div>
                        )}

                        {stateAnomalies && !scanningState && (
                            <div className="space-y-3">
                                {/* Summary stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="stat-card text-center">
                                        <div className="text-xs text-slate-500">Districts Scanned</div>
                                        <div className="text-lg font-bold text-white">{stateAnomalies.districts_scanned}</div>
                                    </div>
                                    <div className="stat-card text-center">
                                        <div className="text-xs text-slate-500">Total Anomalies</div>
                                        <div className="text-lg font-bold text-amber-400">{stateAnomalies.total_anomalies}</div>
                                    </div>
                                    <div className="stat-card text-center">
                                        <div className="text-xs text-slate-500">High Risk</div>
                                        <div className="text-lg font-bold text-red-400">{stateAnomalies.high_risk_count || 0}</div>
                                    </div>
                                </div>

                                {/* District results */}
                                {stateAnomalies.districts?.map((d: { cdk: string; district_name: string; anomaly_count: number; risk_score: number; risk_level: string }, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCdk(d.cdk)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Activity size={14} className="text-slate-500" />
                                            <span className="text-sm text-slate-300">{d.district_name || d.cdk}</span>
                                            <span className="text-xs text-slate-500">{d.anomaly_count} anomalies</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RiskBadge level={d.risk_level || 'low'} />
                                            <ChevronRight size={14} className="text-slate-600" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* District Drill-Down */}
                    {selectedCdk && (
                        <div className="glass-card rounded-xl p-5 animate-in">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={14} className="text-cyan-400" />
                                <h3 className="section-header mb-0">District Anomaly Report — {selectedCdk}</h3>
                            </div>

                            {scanningDistrict && (
                                <div className="flex items-center gap-2 py-4 text-cyan-400 text-sm">
                                    <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                    Analyzing...
                                </div>
                            )}

                            {districtAnomalies && !scanningDistrict && (
                                <div className="space-y-4">
                                    {/* Risk Alert */}
                                    {districtAnomalies.risk_alert && (
                                        <div className={`p-4 rounded-lg border ${districtAnomalies.risk_alert.risk_level === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                                districtAnomalies.risk_alert.risk_level === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                                                    'bg-amber-500/10 border-amber-500/30'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-white">
                                                    {districtAnomalies.risk_alert.district_name}
                                                </span>
                                                <RiskBadge level={districtAnomalies.risk_alert.risk_level} />
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Risk Score: {districtAnomalies.risk_alert.risk_score} / 100
                                            </div>
                                            {districtAnomalies.risk_alert.factors?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {districtAnomalies.risk_alert.factors.map((f: string, i: number) => (
                                                        <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Anomaly list */}
                                    {districtAnomalies.anomalies?.map((a: { type: string; severity: string; description: string; details?: Record<string, unknown> }, i: number) => (
                                        <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-200 capitalize">
                                                    {a.type?.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`text-xs font-medium ${a.severity === 'high' ? 'text-red-400' :
                                                        a.severity === 'medium' ? 'text-amber-400' : 'text-slate-400'
                                                    }`}>
                                                    {a.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400">{a.description}</p>
                                        </div>
                                    ))}

                                    {(!districtAnomalies.anomalies || districtAnomalies.anomalies.length === 0) && (
                                        <div className="text-center py-8 text-slate-500 text-sm">
                                            No anomalies detected for this district ✓
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

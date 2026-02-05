import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Shield, TrendingUp, AlertTriangle, PieChart, Calculator, Bookmark as BookmarkIcon, Check, ExternalLink } from 'lucide-react';
import SimulationPanel from './SimulationPanel';
import ClimateCorrelationCard from './ClimateCorrelationCard';
import { useBookmarks } from '../hooks/useBookmarks';
import { exportToCSV } from '../../lib/reports';
import {
    EfficiencyData,
    RiskData,
    DiversificationData,
    CorrelationData
} from '../../types/analysis';

interface AnalyticsPanelProps {
    cdk: string;
    state: string;
    year: number;
    crop: string;
}

export default function AnalyticsPanel({ cdk, state, year, crop }: AnalyticsPanelProps) {
    const { data: efficiency, isLoading: loadingEff } = useQuery({
        queryKey: ['efficiency', cdk, year, crop],
        queryFn: () => api.getEfficiency(cdk, crop, year),
        enabled: !!cdk
    });

    const { data: riskData, isLoading: loadingRisk } = useQuery({
        queryKey: ['risk', cdk, crop],
        queryFn: () => api.getRiskProfile(cdk, crop),
        enabled: !!cdk
    });

    const { data: diversification, isLoading: loadingDiv } = useQuery({
        queryKey: ['diversification', state, year],
        queryFn: () => api.getDiversification(state, year),
        enabled: !!state
    });

    const { data: correlation, isLoading: loadingCorr } = useQuery({
        queryKey: ['correlation', state, crop, year],
        queryFn: () => api.getCorrelation(state, crop, year),
        enabled: !!state
    });

    const { addBookmark, isBookmarked, removeBookmark } = useBookmarks();
    const isSaved = isBookmarked(cdk, year, crop);

    const loading = loadingEff || loadingRisk || loadingDiv || loadingCorr;
    const error = null; // React Query handles this internally or we can use isError props

    if (loading) return (
        <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center flex flex-col items-center justify-center min-h-[100px]">
            <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <div className="text-slate-500 text-xs">Loading analytics...</div>
        </div>
    );

    // Check if we have minimal data to display anything
    const hasData = efficiency || riskData || diversification || correlation;

    if (!hasData && !loading) return (
        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg text-center min-h-[100px] flex flex-col items-center justify-center">
            <div className="text-slate-500 text-xs">No analytics data available for this selection.</div>
        </div>
    );

    const risk = riskData?.risk_profile;

    return (
        <div className="space-y-4 mt-4 animate-in fade-in duration-500 pb-10">

            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded -mt-2 mb-2">
                <span className="text-[10px] text-slate-500 font-mono">ID: {cdk}</span>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            // Construct composite data object for export
                            const exportData = { efficiency, risk: riskData };
                            // Note: diversification/correlation logic could be added to reports.ts later
                            exportToCSV(exportData, `i-ascap-analysis-${cdk}-${year}.csv`);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all border bg-slate-800 text-slate-400 border-slate-700 hover:text-blue-400 hover:border-blue-500/50"
                    >
                        <ExternalLink size={10} /> Export
                    </button>

                    <button
                        onClick={() => {
                            if (isSaved) {
                                // Find ID to remove? useBookmarks might need logic refactor or just rebuild ID
                                const id = `${cdk}-${year}-${crop}`;
                                removeBookmark(id);
                            } else {
                                addBookmark(cdk, state, year, crop);
                            }
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all border ${isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50'
                            }`}
                    >
                        {isSaved ? <Check size={10} /> : <BookmarkIcon size={10} />}
                        {isSaved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {/* 1. Yield Efficiency */}
            {efficiency ? (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <h4 className="text-[10px] text-emerald-400 uppercase font-bold mb-3 flex items-center gap-2">
                        <TrendingUp size={12} /> Efficiency Metrics
                    </h4>

                    {/* A. Relative Efficiency */}
                    <div className="mb-3 group/tooltip relative">
                        <div className="flex justify-between items-end mb-1">
                            <div>
                                <div className="text-xl font-bold text-slate-200">
                                    {(efficiency.relative_efficiency.efficiency_score * 100).toFixed(0)}%
                                </div>
                                <div className="text-[10px] text-slate-500 border-b border-dotted border-slate-600 cursor-help w-max">
                                    Relative (vs State)
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-red-400">
                                    -{efficiency.relative_efficiency.yield_gap_pct.toFixed(1)}%
                                </div>
                                <div className="text-[10px] text-slate-500">Gap</div>
                            </div>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.min(efficiency.relative_efficiency.efficiency_score * 100, 100)}%` }}
                            />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 p-2 rounded text-[10px] text-slate-300 hidden group-hover/tooltip:block z-50 shadow-xl pointer-events-none">
                            <div className="font-bold text-emerald-400 mb-1">Relative Efficiency</div>
                            Compares yield ({efficiency.relative_efficiency.district_yield}) to state top 5% ({efficiency.relative_efficiency.potential_yield}).
                        </div>
                    </div>

                    {/* B. Historical Efficiency */}
                    <div className="group/tooltip relative">
                        <div className="flex justify-between items-end mb-1">
                            <div>
                                <div className={`text-xl font-bold ${efficiency.historical_efficiency.is_above_trend ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {(efficiency.historical_efficiency.efficiency_ratio * 100).toFixed(0)}%
                                </div>
                                <div className="text-[10px] text-slate-500 border-b border-dotted border-slate-600 cursor-help w-max">
                                    Historical (vs 10y)
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-mono ${efficiency.historical_efficiency.is_above_trend ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {efficiency.historical_efficiency.yield_diff > 0 ? '+' : ''}{efficiency.historical_efficiency.yield_diff.toFixed(1)}
                                </div>
                                <div className="text-[10px] text-slate-500">Diff</div>
                            </div>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10"></div>
                            <div
                                className={`h-full ${efficiency.historical_efficiency.is_above_trend ? 'bg-blue-500' : 'bg-amber-500'}`}
                                style={{
                                    width: `${Math.min(Math.abs(efficiency.historical_efficiency.efficiency_ratio - 1) * 100, 50)}%`,
                                    marginLeft: efficiency.historical_efficiency.is_above_trend ? '50%' : `${50 - Math.min(Math.abs(efficiency.historical_efficiency.efficiency_ratio - 1) * 100, 50)}%`
                                }}
                            />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 p-2 rounded text-[10px] text-slate-300 hidden group-hover/tooltip:block z-50 shadow-xl pointer-events-none">
                            <div className="font-bold text-blue-400 mb-1">Historical Efficiency</div>
                            vs 10y Mean ({efficiency.historical_efficiency.historical_mean.toFixed(1)}).
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 text-center">Efficiency data unavailable</div>
                </div>
            )}

            {/* 2. Decision Intelligence (NEW) */}
            {
                riskData && riskData.resilience_index ? (
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <h4 className="text-[10px] text-indigo-400 uppercase font-bold mb-3 flex items-center gap-2">
                            <Shield size={12} /> Strategic Analysis
                        </h4>

                        {/* Resilience Score */}
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                            <div>
                                <div className="text-[10px] text-slate-400 mb-1">Resilience Index</div>
                                <div className="text-2xl font-bold text-slate-200">
                                    {(riskData.resilience_index.resilience_score * 100).toFixed(0)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-bold px-2 py-0.5 rounded border ${riskData.resilience_index.reliability_rating === 'A' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                    riskData.resilience_index.reliability_rating === 'B' ? 'border-blue-500 text-blue-400 bg-blue-500/10' :
                                        'border-amber-500 text-amber-400 bg-amber-500/10'
                                    }`}>
                                    Grade {riskData.resilience_index.reliability_rating}
                                </div>
                            </div>
                        </div>

                        {/* Growth Matrix */}
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-slate-400 mb-1">Growth Quadrant</div>
                                <div className="text-sm font-bold text-slate-200">{riskData.growth_matrix.matrix_quadrant}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500">5y CAGR</div>
                                <div className={`text-xs font-mono ${riskData.growth_matrix.cagr_5y > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {riskData.growth_matrix.cagr_5y > 0 ? '+' : ''}{riskData.growth_matrix.cagr_5y}%
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-3">
                        <div className="text-xs text-slate-500 text-center">Strategic Analysis unavailable</div>
                    </div>
                )
            }

            {/* 3. Risk Profile (Detailed) */}
            {
                risk && (
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <h4 className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle size={12} /> Risk Details
                        </h4>

                        <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase border ${risk.risk_category === 'low' ? 'bg-green-500/10 border-green-500 text-green-400' :
                                risk.risk_category === 'medium' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
                                    'bg-red-500/10 border-red-500 text-red-400'
                                }`}>
                                {risk.risk_category} Risk
                            </div>

                            <div className="flex-1 text-right">
                                <div className="text-xs text-slate-300">{risk.trend_stability}</div>
                                <div className="text-[10px] text-slate-500">CV: {risk.volatility_score.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 3. Crop Diversification */}
            {
                diversification && (
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                        <h4 className="text-[10px] text-purple-400 uppercase font-bold mb-2 flex items-center gap-2">
                            <PieChart size={12} /> State Diversity
                        </h4>

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xl font-bold text-slate-200">{diversification.cdi.toFixed(2)}</span>
                            <span className="text-[10px] text-right text-slate-400 max-w-[120px] leading-tight">
                                {diversification.interpretation}
                            </span>
                        </div>

                        {/* Dominant Crop */}
                        <div className="text-xs text-slate-500 border-t border-slate-800 pt-2 mt-2">
                            Dominant: <span className="text-slate-300 capitalize">{diversification.dominant_crop.replace(/_/g, ' ')}</span>
                            <span className="text-slate-500"> ({(diversification.breakdown[diversification.dominant_crop] * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                )
            }

            {/* 4. Climate Correlation */}
            {
                correlation && (
                    <ClimateCorrelationCard data={correlation} crop={crop} />
                )
            }
            {/* 5. Simulation (New) */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                <h4 className="text-[10px] text-indigo-400 uppercase font-bold mb-3 flex items-center gap-2">
                    <Calculator size={12} /> Impact Simulator
                </h4>
                <SimulationPanel district={cdk} state={state} crop={crop} year={year} />
            </div>
        </div >
    );
}

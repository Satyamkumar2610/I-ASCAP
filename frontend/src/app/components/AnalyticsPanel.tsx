import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, PieChart } from 'lucide-react';

interface AnalyticsPanelProps {
    cdk: string;
    state: string;
    year: number;
    crop: string;
    districtName: string;
}

interface EfficiencyData {
    efficiency_score: number;
    potential_yield: number;
    district_yield: number;
    yield_gap_pct: number;
}

interface RiskProfile {
    risk_category: string;
    volatility_score: number;
    trend_stability: string;
}

interface DiversificationData {
    cdi: number;
    interpretation: string;
    dominant_crop: string;
    breakdown: Record<string, number>;
}

export default function AnalyticsPanel({ cdk, state, year, crop, districtName }: AnalyticsPanelProps) {
    const [efficiency, setEfficiency] = useState<EfficiencyData | null>(null);
    const [risk, setRisk] = useState<RiskProfile | null>(null);
    const [diversification, setDiversification] = useState<DiversificationData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!cdk || !state) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Efficiency
                const efficRes = await fetch(`/api/analysis/efficiency?cdk=${cdk}&crop=${crop}&year=${year}`);
                if (efficRes.ok) setEfficiency(await efficRes.json());
                else setEfficiency(null); // Reset on error

                // Fetch Risk (independent of year)
                const riskRes = await fetch(`/api/analysis/risk-profile?cdk=${cdk}&crop=${crop}`);
                if (riskRes.ok) setRisk(await riskRes.json());

                // Fetch Diversification
                const divRes = await fetch(`/api/analysis/diversification?state=${encodeURIComponent(state)}&year=${year}`);
                if (divRes.ok) setDiversification(await divRes.json());

            } catch (err) {
                console.error("Analytics fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [cdk, state, year, crop]);

    if (loading) return <div className="p-4 text-center text-slate-500 text-xs">Loading analytics...</div>;

    return (
        <div className="space-y-4 mt-4 animate-in fade-in duration-500">

            {/* 1. Yield Efficiency */}
            {efficiency && efficiency.potential_yield > 0 && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <h4 className="text-[10px] text-emerald-400 uppercase font-bold mb-2 flex items-center gap-2">
                        <TrendingUp size={12} /> Yield Efficiency
                    </h4>

                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-2xl font-bold text-slate-200">{(efficiency.efficiency_score * 100).toFixed(0)}%</div>
                            <div className="text-[10px] text-slate-500">of State Potential</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-mono text-red-400">-{efficiency.yield_gap_pct.toFixed(1)}%</div>
                            <div className="text-[10px] text-slate-500">Gap</div>
                        </div>
                    </div>

                    {/* Mini Bar Chart */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(efficiency.efficiency_score * 100, 100)}%` }}
                        />
                        <div className="h-full bg-slate-700 flex-1" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>{efficiency.district_yield} (You)</span>
                        <span>{efficiency.potential_yield} (Max)</span>
                    </div>
                </div>
            )}

            {/* 2. Risk Profile */}
            {risk && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                    <h4 className="text-[10px] text-amber-500 uppercase font-bold mb-2 flex items-center gap-2">
                        <Shield size={12} /> Risk Profile
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
            )}

            {/* 3. Crop Diversification */}
            {diversification && (
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
            )}
        </div>
    );
}

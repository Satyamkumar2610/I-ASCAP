
import React from 'react';
import { TrendingUp, Activity, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    label: string;
    pre: number;
    post: number;
    unit?: string;
    inverse?: boolean; // If true, lower is better (e.g. Volatility)
}

function StatCard({ label, pre, post, unit = "", inverse = false }: StatsCardProps) {
    const diff = post - pre;
    const isGood = inverse ? diff < 0 : diff > 0;
    const color = isGood ? "text-emerald-400" : "text-rose-400";
    const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;

    return (
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
            <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">{label}</div>
            <div className="flex items-baseline justify-between">
                <div className="text-white font-mono text-lg">
                    {post.toFixed(1)}{unit}
                </div>
                <div className={`flex items-center text-xs font-bold ${color}`}>
                    <Icon size={12} className="mr-0.5" />
                    {Math.abs(diff).toFixed(1)}{unit}
                </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-1 flex justify-between">
                <span>Pre: {pre.toFixed(1)}{unit}</span>
            </div>
        </div>
    );
}

interface AdvancedStatsPanelProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: any;
    metric: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdvancedStatsPanel({ stats, metric }: AdvancedStatsPanelProps) {
    if (!stats) return null;

    const unit = metric === 'yield' ? 'kg/ha' : metric === 'production' ? 'tons' : 'ha'; // CAGR/CV are %-based, but Mean keeps original unit? 
    // Actually CAGR/CV are always %. Mean is raw.

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Growth Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={48} className="text-emerald-500" />
                </div>
                <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                    <TrendingUp size={16} /> Growth Dynamics (CAGR)
                </h4>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {stats.post.cagr.toFixed(2)}%
                    </span>
                    <span className={`text-xs mb-1.5 px-1.5 py-0.5 rounded font-medium ${stats.post.cagr > stats.pre.cagr ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {stats.post.cagr > stats.pre.cagr ? 'Accelerated' : 'Slowed'}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Compound Annual Growth Rate changed from <strong className="text-slate-400">{stats.pre.cagr.toFixed(2)}%</strong> pre-split.
                </p>
            </div>

            {/* Stability Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={48} className="text-blue-500" />
                </div>
                <h4 className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3">
                    <Activity size={16} /> Production Stability (CV)
                </h4>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {stats.post.cv.toFixed(2)}%
                    </span>
                    <span className={`text-xs mb-1.5 px-1.5 py-0.5 rounded font-medium ${stats.post.cv < stats.pre.cv ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {stats.post.cv < stats.pre.cv ? 'More Stable' : 'More Volatile'}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Coefficient of Variation (Volatility) was <strong className="text-slate-400">{stats.pre.cv.toFixed(2)}%</strong> before the split.
                </p>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 size={48} className="text-purple-500" />
                </div>
                <h4 className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-3">
                    <BarChart3 size={16} /> Net Performance Impact
                </h4>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {stats.impact.pct_change > 0 ? '+' : ''}{stats.impact.pct_change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 mb-1.5">avg. shift</span>
                </div>

                {stats.impact.uncertainty && (
                    <div className="mt-2 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-slate-400">
                                (±{((stats.impact.uncertainty.upper - stats.impact.uncertainty.lower) / 2).toFixed(1)}%)
                            </span>
                            {/* Check Significance: If interval crosses 0 (signs differ), it's inconclusive */}
                            {(stats.impact.uncertainty.lower > 0 || stats.impact.uncertainty.upper < 0) ? (
                                <span className="text-[9px] px-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 font-bold uppercase">
                                    Significant
                                </span>
                            ) : (
                                <span className="text-[9px] px-1.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/50 font-bold uppercase">
                                    Inconclusive
                                </span>
                            )}
                        </div>
                        <div className="text-[9px] text-slate-600">
                            95% CI: [{stats.impact.uncertainty.lower.toFixed(1)}, {stats.impact.uncertainty.upper.toFixed(1)}]
                        </div>
                    </div>
                )}

                <p className="text-xs text-slate-500 mt-2">
                    Analysis compares average performance levels between the two administrative eras.
                </p>
            </div>
        </div>
    );
}

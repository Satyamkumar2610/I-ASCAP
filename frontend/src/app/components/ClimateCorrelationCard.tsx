"use client";

import React from 'react';
import { CloudRain, Info } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClimateCorrelationCardProps {
    data: {
        correlations: {
            annual_rainfall: { r: number; interpretation: string; direction: string };
            monsoon_rainfall: { r: number; interpretation: string; direction: string };
        };
        data_points: { district: string; yield: number; annual_rainfall: number; monsoon_rainfall: number }[];
        validity?: { warning: string; baseline_period: string };
    };
    crop: string;
}

export default function ClimateCorrelationCard({ data, crop }: ClimateCorrelationCardProps) {
    const correlations = data?.correlations?.monsoon_rainfall || {};
    const r = correlations.r || 0;
    const direction = correlations.direction || 'neutral';
    const interpretation = correlations.interpretation || 'No Data';

    // Determine color based on Correlation Strength
    const getColor = (rVal: number) => {
        if (Math.abs(rVal) < 0.2) return "text-slate-400"; // Negligible
        if (rVal > 0) return "text-emerald-400"; // Positive
        return "text-rose-400"; // Negative
    };

    const getBgColor = (rVal: number) => {
        if (Math.abs(rVal) < 0.2) return "bg-slate-500/10 border-slate-500";
        if (rVal > 0) return "bg-emerald-500/10 border-emerald-500";
        return "bg-rose-500/10 border-rose-500";
    };

    return (
        <div className="glass-card rounded-xl p-4 transition-all duration-300 hover:shadow-sky-900/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] text-sky-400 uppercase font-bold flex items-center gap-2 tracking-wider">
                    <CloudRain size={14} /> Climate Impact (Monsoon)
                </h4>
                {Math.abs(r) > 0.3 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getBgColor(r)} ${getColor(r)} font-bold uppercase`}>
                        {interpretation}
                    </span>
                )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4">
                {/* Big R Value */}
                <div className="flex flex-col items-center">
                    <div className={`text-2xl font-bold ${getColor(r)}`}>
                        {r > 0 ? '+' : ''}{r.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide">Correlation (r)</div>
                </div>

                {/* Intepretation Text */}
                <div className="flex-1 text-xs text-slate-300 leading-relaxed border-l border-slate-800 pl-3">
                    <span className="font-semibold text-white capitalize">{crop}</span> yields have a
                    <span className={`font-bold ${getColor(r)}`}> {interpretation} {direction} </span>
                    relationship with monsoon rainfall in this state.
                </div>
            </div>

            {/* Scatter Plot */}
            <div className="h-48 w-full glass-panel rounded-xl p-3 mb-3">
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.4} />
                        <XAxis
                            type="number"
                            dataKey="monsoon_rainfall"
                            name="Rainfall"
                            unit="mm"
                            stroke="#64748b"
                            fontSize={9}
                            tickFormatter={(v) => `${v}`}
                            tickLine={false}
                        />
                        <YAxis
                            type="number"
                            dataKey="yield"
                            name="Yield"
                            unit="kg/ha"
                            stroke="#64748b"
                            fontSize={9}
                            width={40}
                            tickLine={false}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                        />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '4 4', stroke: '#475569' }}
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                backdropFilter: 'blur(8px)',
                                borderColor: 'rgba(51, 65, 85, 0.6)',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                                fontSize: '11px',
                                padding: '8px',
                                color: '#e2e8f0'
                            }}
                            itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                        />
                        <Scatter name="Districts" data={data?.data_points || []} fill="#38bdf8">
                            {(data?.data_points || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={0.6} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Methodology Footnote */}
            <div className="flex items-start gap-1.5 text-[9px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 shadow-inner">
                <Info size={12} className="shrink-0 mt-0.5 text-slate-500" />
                <p>
                    Statistical correlation based on {data?.data_points?.length || 0} districts.
                    Compares {data.validity?.baseline_period || 'historic'} Rainfall Normals vs Yield.
                    Results may vary for irrigated regions.
                </p>
            </div>
        </div>
    );
}

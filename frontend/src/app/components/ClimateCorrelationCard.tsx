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
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] text-sky-400 uppercase font-bold flex items-center gap-2">
                    <CloudRain size={12} /> Climate Impact (Monsoon)
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
            <div className="h-40 w-full bg-slate-950/30 rounded border border-slate-800/50 p-2 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            type="number"
                            dataKey="monsoon_rainfall"
                            name="Rainfall"
                            unit="mm"
                            stroke="#64748b"
                            fontSize={9}
                            tickFormatter={(v) => `${v}`}
                        />
                        <YAxis
                            type="number"
                            dataKey="yield"
                            name="Yield"
                            unit="kg/ha"
                            stroke="#64748b"
                            fontSize={9}
                            width={30}
                        />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }}
                            itemStyle={{ color: '#e2e8f0' }}
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
            <div className="flex items-start gap-1.5 text-[9px] text-slate-500 bg-slate-950/50 p-2 rounded">
                <Info size={10} className="shrink-0 mt-0.5" />
                <p>
                    Statistical correlation based on {data?.data_points?.length || 0} districts.
                    Compares {data.validity?.baseline_period || 'historic'} Rainfall Normals vs Yield.
                    Results may vary for irrigated regions.
                </p>
            </div>
        </div>
    );
}

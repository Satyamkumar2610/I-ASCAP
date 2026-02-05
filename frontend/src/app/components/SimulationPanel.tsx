"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface SimulationPoint {
    year: number;
    rain: number;
    yield: number;
}

interface SimulationPanelProps {
    district: string;
    state: string;
    crop: string;
    year: number;
}

export default function SimulationPanel({ district, state, crop, year }: SimulationPanelProps) {
    const [deviation, setDeviation] = useState<number>(0); // Percentage -50 to +50

    const { data: simulationData, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['simulation', district, state, crop, year],
        queryFn: () => api.runSimulation(district, state, crop, year),
        staleTime: 1000 * 60 * 60 // Cache simulation heavily
    });

    const result = simulationData ? simulationData.result : null;
    const error = queryError ? (queryError as Error).message : null;

    // Calculate Projected Yield
    const projection = useMemo(() => {
        if (!result) return null;

        // Our model is Linear: Yield = Intercept + Slope * Rain
        // But we don't have absolute rain for the user to manipulate easily (since baseline rain varies).
        // Instead, we simulate: NewYield = Baseline + (Slope * ChangeInRain)
        // What is "Baseline Rain"?
        // The endpoint returns a baseline_yield calculated at MEAN rainfall of the state (or sample).
        // Let's assume the user manipulates "Rainfall from Average".

        // Let's calculate mean rain from data points to know what "0%" deviation means.
        const meanRain = result.data_points.reduce((acc: number, p: SimulationPoint) => acc + p.rain, 0) / result.data_points.length;

        const rainChangeMM = meanRain * (deviation / 100);
        const projectedYield = result.baseline_yield + (result.slope * rainChangeMM);

        const percentChange = ((projectedYield - result.baseline_yield) / result.baseline_yield) * 100;

        return {
            rain_mm: meanRain + rainChangeMM,
            yield: Math.max(0, projectedYield),
            change_pct: percentChange
        };
    }, [result, deviation]);


    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Building Simulation Model...</div>;

    if (error) return (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
        </div>
    );

    if (!result || !projection) return null;

    return (
        <div className="space-y-6">
            {/* Header / Disclaimer */}
            <div className="bg-indigo-900/20 border border-indigo-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <RefreshCw size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-100">Rainfall Impact Simulator</h3>
                        <p className="text-xs text-indigo-300 mt-1 max-w-md leading-relaxed">
                            This model estimates yield sensitivity using a <strong>spatial regression</strong> across {state}.
                            It assumes that if {district} received rainfall patterns similar to other districts, its yield would follow the state-wide trend.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Interactive Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Controls & Result */}
                <div className="space-y-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
                            Rainfall Deviation
                        </label>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-red-400 font-mono">-50%</span>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={deviation}
                                onChange={(e) => setDeviation(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-xs text-blue-400 font-mono">+50%</span>
                        </div>
                        <div className="text-center mt-2 font-mono text-xl font-bold text-indigo-400">
                            {deviation > 0 ? '+' : ''}{deviation}%
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm text-slate-400">Projected Yield</span>
                            <span className={`text-2xl font-bold font-mono ${projection.yield >= result.baseline_yield ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {projection.yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-sm text-slate-600 ml-1">kg/ha</span>
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Baseline (State Mean Rain)</span>
                            <span className="text-slate-300">{result.baseline_yield.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/ha</span>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-xs font-mono bg-black/40 p-2 rounded border border-white/5">
                            {projection.change_pct > 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-orange-500" />}
                            <span className={projection.change_pct > 0 ? "text-emerald-400" : "text-orange-400"}>
                                {projection.change_pct > 0 ? '+' : ''}{projection.change_pct.toFixed(1)}%
                            </span>
                            <span className="text-slate-500 ml-auto">Sensitivity: {result.slope.toFixed(2)} kg/mm</span>
                        </div>
                    </div>
                </div>

                {/* 2. Visualization */}
                <div className="h-64 relative">
                    <h4 className="absolute top-0 left-0 text-[10px] text-slate-500 font-bold uppercase z-10">State-wide Correlation</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                type="number"
                                dataKey="rain"
                                name="Rainfall"
                                unit="mm"
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            />
                            <YAxis
                                type="number"
                                dataKey="yield"
                                name="Yield"
                                unit="kg"
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                            />
                            <Scatter name="Districts" data={result.data_points} fill="#6366f1" opacity={0.5} />

                            {/* Visualizing the "Projected" Point */}
                            <ReferenceLine x={projection.rain_mm} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'SIM', fill: '#f43f5e', fontSize: 10 }} />
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-mono">
                        R² = {result.r_squared.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

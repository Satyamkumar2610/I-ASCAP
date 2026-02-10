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

    // Robust check for result integrity
    if (!result || typeof result.baseline_yield !== 'number' || !Array.isArray(result.data_points)) return (
        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-lg text-center flex flex-col items-center justify-center">
            <div className="text-slate-500 text-xs">Insufficient data for simulation.</div>
        </div>
    );

    if (!projection) return null;

    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="bg-indigo-900/20 border border-indigo-800/50 p-3 rounded-lg flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-md">
                    <RefreshCw size={16} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-100 leading-none">Rainfall Impact Simulator</h3>
                    <p className="text-[10px] text-indigo-300 mt-1">
                        Estimate yield sensitivity based on {state} spatial trends.
                    </p>
                </div>
            </div>

            {/* Main Interactive Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Controls & Result */}
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col justify-center">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Rainfall Deviation
                            </label>
                            <span className="font-mono text-sm font-bold text-indigo-400">
                                {deviation > 0 ? '+' : ''}{deviation}%
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-red-400">-50%</span>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={deviation}
                                onChange={(e) => setDeviation(parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-[10px] text-blue-400">+50%</span>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/50">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs text-slate-400">Projected Yield</span>
                            <span className={`text-lg font-bold font-mono ${projection.yield >= result.baseline_yield ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {projection.yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-[10px] text-slate-600 ml-1">kg/ha</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">Baseline: {result.baseline_yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>

                            <div className="flex items-center gap-1 ml-auto font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                {projection.change_pct > 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-orange-500" />}
                                <span className={projection.change_pct > 0 ? "text-emerald-400" : "text-orange-400"}>
                                    {projection.change_pct > 0 ? '+' : ''}{projection.change_pct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Visualization */}
                <div className="h-40 relative border border-slate-800/50 rounded-lg bg-slate-900/20">
                    <div className="absolute top-1 left-2 text-[9px] text-slate-500 font-bold uppercase z-10 pointer-events-none"> Correlation Match</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                type="number"
                                dataKey="rain"
                                unit="mm"
                                stroke="#475569"
                                fontSize={9}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                tickCount={5}
                            />
                            <YAxis
                                type="number"
                                dataKey="yield"
                                unit="kg"
                                stroke="#475569"
                                fontSize={9}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                width={40}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px', padding: '4px' }}
                            />
                            <Scatter name="Districts" data={result.data_points} fill="#6366f1" opacity={0.5} r={2} />
                            <ReferenceLine x={projection.rain_mm} stroke="#f43f5e" strokeDasharray="3 3" />
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-1 right-2 text-[9px] text-slate-600 font-mono">
                        R²={result.r_squared.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

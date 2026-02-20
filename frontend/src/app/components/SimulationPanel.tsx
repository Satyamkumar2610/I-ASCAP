"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Layers } from 'lucide-react';

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
            <div className="glass-card border-none p-4 rounded-xl flex items-center gap-3 shadow-[0_0_15px_-3px_rgba(79,70,229,0.2)]">
                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-500/30">
                    <Layers size={18} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-100 tracking-wide">Rainfall Impact Simulator</h3>
                    <p className="text-[10px] text-indigo-300/70 mt-1 uppercase tracking-wider font-medium">
                        Simulate yield sensitivity in {state}
                    </p>
                </div>
            </div>

            {/* Main Interactive Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Controls & Result */}
                <div className="p-4 glass-panel rounded-xl flex flex-col justify-center gap-2">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Rainfall Deviation
                            </label>
                            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {deviation > 0 ? '+' : ''}{deviation}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">-50%</span>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={deviation}
                                onChange={(e) => setDeviation(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 shadow-inner"
                            />
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">+50%</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Projected Yield</span>
                            <span className={`text-2xl font-bold font-mono tracking-tight ${projection.yield >= result.baseline_yield ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {projection.yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-[10px] text-slate-500 ml-1 font-sans font-medium uppercase tracking-widest">kg/ha</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">Base: {result.baseline_yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>

                            <div className="flex items-center gap-1.5 ml-auto font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-700/50 shadow-inner">
                                {projection.change_pct > 0 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-orange-500" />}
                                <span className={`font-bold ${projection.change_pct > 0 ? "text-emerald-400" : "text-orange-400"}`}>
                                    {projection.change_pct > 0 ? '+' : ''}{projection.change_pct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Visualization */}
                <div className="h-48 relative glass-panel rounded-xl">
                    <div className="absolute top-2 left-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest z-10 pointer-events-none">Correlation Match</div>
                    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                        <ScatterChart margin={{ top: 20, right: 15, bottom: 5, left: -15 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.4} />
                            <XAxis
                                type="number"
                                dataKey="rain"
                                unit="mm"
                                stroke="#64748b"
                                fontSize={9}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                tickCount={5}
                            />
                            <YAxis
                                type="number"
                                dataKey="yield"
                                unit="kg"
                                stroke="#64748b"
                                fontSize={9}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                width={45}
                            />
                            <Tooltip
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
                                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                            />
                            <Scatter name="Districts" data={result.data_points} fill="#818cf8" opacity={0.6} r={3} />
                            <ReferenceLine x={projection.rain_mm} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1} />
                            <ReferenceDot x={projection.rain_mm} y={projection.yield} r={5} fill="#f43f5e" stroke="#0f172a" strokeWidth={2} />
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono bg-slate-900/60 border border-slate-800/50 backdrop-blur-md">
                        R²={result.r_squared.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

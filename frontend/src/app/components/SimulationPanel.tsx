"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import ReactECharts from 'echarts-for-react';
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
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
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
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-center gap-2 shadow-sm">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Rainfall Deviation
                            </label>
                            <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {deviation > 0 ? '+' : ''}{deviation}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">-50%</span>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={deviation}
                                onChange={(e) => setDeviation(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                            />
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+50%</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Projected Yield</span>
                            <span className={`text-2xl font-bold font-mono tracking-tight ${projection.yield >= result.baseline_yield ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {projection.yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-[10px] text-slate-500 ml-1 font-sans font-medium uppercase tracking-widest">kg/ha</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">Base: {result.baseline_yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>

                            <div className="flex items-center gap-1.5 ml-auto font-mono bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                {projection.change_pct > 0 ? <TrendingUp size={12} className="text-emerald-600" /> : <TrendingDown size={12} className="text-orange-600" />}
                                <span className={`font-bold ${projection.change_pct > 0 ? "text-emerald-700" : "text-orange-700"}`}>
                                    {projection.change_pct > 0 ? '+' : ''}{projection.change_pct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Visualization */}
                <div className="h-48 relative bg-white border border-slate-200 shadow-sm rounded-xl">
                    <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest z-10 pointer-events-none">Correlation Match</div>
                    <ReactECharts
                        option={{
                            grid: { top: 30, right: 15, bottom: 20, left: 45 },
                            tooltip: {
                                trigger: 'item',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderColor: '#e2e8f0',
                                textStyle: { color: '#0f172a', fontSize: 11 },
                                padding: [8, 12],
                                formatter: function (params: any) {
                                    if (!params.value || !Array.isArray(params.value) || params.value.length < 2) return '';
                                    if (params.seriesName === 'Projection') return `<b>Projected Yield:</b> ${Number(params.value[1]).toFixed(0)} kg<br/><b>Deviated Rain:</b> ${Number(params.value[0]).toFixed(0)} mm`;
                                    return `<b>Yield:</b> ${params.value[1]} kg/ha<br/><b>Rainfall:</b> ${params.value[0]} mm`;
                                }
                            },
                            xAxis: {
                                type: 'value',
                                name: 'Rainfall (mm)',
                                nameLocation: 'middle',
                                nameGap: 25,
                                axisLabel: { color: '#64748b', fontSize: 9 },
                                splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
                                axisLine: { show: false },
                                scale: true
                            },
                            yAxis: {
                                type: 'value',
                                name: 'Yield (kg)',
                                nameLocation: 'end',
                                axisLabel: { color: '#64748b', fontSize: 9, formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val },
                                splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
                                axisLine: { show: false },
                                scale: true
                            },
                            series: [
                                {
                                    name: 'Districts',
                                    type: 'scatter',
                                    symbolSize: 6,
                                    itemStyle: { color: '#818cf8', opacity: 0.6 },
                                    data: (result.data_points || []).map((p: any) => [p.rain, p.yield])
                                },
                                {
                                    name: 'Projection',
                                    type: 'scatter',
                                    symbolSize: 10,
                                    itemStyle: { color: '#f43f5e', shadowBlur: 2, shadowColor: '#f43f5e' },
                                    data: [[projection.rain_mm, projection.yield]],
                                    markLine: {
                                        data: [{ xAxis: projection.rain_mm }],
                                        lineStyle: { type: 'dashed', color: '#f43f5e' },
                                        symbol: ['none', 'none'],
                                        label: { show: false }
                                    }
                                }
                            ]
                        }}
                        style={{ height: '100%', width: '100%' }}
                    />
                    <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono bg-slate-50 border border-slate-200 backdrop-blur-md">
                        R²={result.r_squared.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

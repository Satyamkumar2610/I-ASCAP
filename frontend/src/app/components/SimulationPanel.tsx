"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, PredictionV2Data } from '../services/api';
import ReactECharts from 'echarts-for-react';
import {
    AlertTriangle, TrendingUp, TrendingDown,
    Layers, ChevronDown, ChevronUp,
    BarChart3, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

interface SimulationPanelProps {
    district: string;
    state: string;
    crop: string;
    year: number;
}

export default function SimulationPanel({ district, state, crop, year }: SimulationPanelProps) {
    const [deviation, setDeviation] = useState<number>(0);
    const [showExplanation, setShowExplanation] = useState(false);

    const { data: predictionData, isLoading, error: queryError } = useQuery({
        queryKey: ['prediction-v2', district, state, crop, year],
        queryFn: () => api.runPredictionV2(district, state, crop, year),
        staleTime: 1000 * 60 * 60,
    });

    const prediction: PredictionV2Data | null = predictionData?.prediction ?? null;
    const error = queryError ? (queryError as Error).message : null;

    // Interactive projection based on rainfall deviation slider
    const projection = useMemo(() => {
        if (!prediction) return null;
        const rainChangeMM = prediction.mean_rain * (deviation / 100);
        const projectedYield = prediction.predicted_yield + (prediction.slope_rain * rainChangeMM);
        const pctChange = prediction.predicted_yield > 0
            ? ((projectedYield - prediction.predicted_yield) / prediction.predicted_yield) * 100
            : 0;
        return {
            rain_mm: prediction.mean_rain + rainChangeMM,
            yield: Math.max(0, projectedYield),
            change_pct: pctChange,
        };
    }, [prediction, deviation]);

    if (isLoading) {
        return (
            <div className="p-8 text-center text-slate-400 animate-pulse space-y-2">
                <Layers className="mx-auto text-indigo-400 animate-spin" size={24} />
                <div className="text-xs font-medium uppercase tracking-widest">Building Multi-Factor Prediction Model...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
            </div>
        );
    }

    if (!prediction || !projection) return null;

    const isGood = prediction.r_squared >= 0.3;
    const methodLabel = prediction.method === 'multi_factor_ridge' ? 'Multi-Factor Ridge' : 'Simple OLS';

    return (
        <div className="space-y-4">
            {/* ─── Header with Model Quality Badges ─── */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <BarChart3 size={18} className="text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-wide">Yield Prediction Model</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-medium">
                            {methodLabel} · {prediction.feature_count} Factor{prediction.feature_count > 1 ? 's' : ''} · {prediction.sample_size} Districts
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        R² {prediction.r_squared.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                        RMSE {prediction.rmse.toFixed(0)}
                    </span>
                </div>
            </div>

            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ─── Left: Prediction + Controls ─── */}
                <div className="space-y-4">
                    {/* Prediction Result Card */}
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-baseline mb-3">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Predicted Yield</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                CI: {prediction.confidence_lower.toLocaleString()} — {prediction.confidence_upper.toLocaleString()} kg/ha
                            </span>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <span className={`text-3xl font-bold font-mono tracking-tight ${projection.yield >= prediction.baseline_yield ? 'text-emerald-600' : 'text-orange-600'
                                    }`}>
                                    {projection.yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                                <span className="text-xs text-slate-400 ml-1 font-medium">kg/ha</span>
                            </div>

                            <div className="text-right space-y-1">
                                <div className="text-[10px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    Baseline: {prediction.baseline_yield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold font-mono justify-end ${projection.change_pct > 0 ? 'text-emerald-600' : projection.change_pct < 0 ? 'text-orange-600' : 'text-slate-500'
                                    }`}>
                                    {projection.change_pct > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {projection.change_pct > 0 ? '+' : ''}{projection.change_pct.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Confidence band visual */}
                        <div className="mt-3 h-2 bg-slate-100 rounded-full relative overflow-hidden">
                            {(() => {
                                const range = prediction.confidence_upper - prediction.confidence_lower;
                                const pos = range > 0
                                    ? ((projection.yield - prediction.confidence_lower) / range) * 100
                                    : 50;
                                return (
                                    <>
                                        <div className="absolute inset-y-0 bg-indigo-100 rounded-full" style={{ left: '10%', right: '10%' }} />
                                        <div
                                            className="absolute top-0 h-2 w-2 bg-indigo-600 rounded-full -translate-x-1/2 shadow-md"
                                            style={{ left: `${Math.max(2, Math.min(98, pos))}%` }}
                                        />
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                            <span>{prediction.confidence_lower.toFixed(0)}</span>
                            <span>{prediction.confidence_upper.toFixed(0)}</span>
                        </div>
                    </div>

                    {/* Rainfall Deviation Slider */}
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Rainfall Deviation
                            </label>
                            <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {deviation > 0 ? '+' : ''}{deviation}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">-50%</span>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                step="5"
                                value={deviation}
                                onChange={(e) => setDeviation(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+50%</span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">
                            Simulated rain: {projection.rain_mm.toFixed(0)} mm (mean: {prediction.mean_rain.toFixed(0)} mm)
                        </div>
                    </div>

                    {/* Factor Importance Chart */}
                    {prediction.factors.length > 1 && (
                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Factor Importance</div>
                            <div className="space-y-2">
                                {prediction.factors.map((f) => (
                                    <div key={f.key} className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-600 font-medium w-28 truncate" title={f.name}>{f.name}</span>
                                        <div className="flex-1 h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${f.direction === 'positive'
                                                        ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                                                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                                    }`}
                                                style={{ width: `${Math.max(4, f.importance * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 w-10 text-right">
                                            {(f.importance * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right: Scatter Plot ─── */}
                <div className="space-y-4">
                    <div className="h-64 relative bg-white border border-slate-200 shadow-sm rounded-xl">
                        <div className="absolute top-2 left-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest z-10 pointer-events-none">
                            Rainfall vs Yield
                        </div>
                        <ReactECharts
                            option={{
                                grid: { top: 35, right: 15, bottom: 25, left: 50 },
                                tooltip: {
                                    trigger: 'item',
                                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                                    borderColor: '#e2e8f0',
                                    textStyle: { color: '#0f172a', fontSize: 11 },
                                    padding: [8, 12],
                                    formatter: function (params: any) {
                                        if (!params.value || !Array.isArray(params.value) || params.value.length < 2) return '';
                                        if (params.seriesName === 'Projection') {
                                            return `<b>Projected Yield:</b> ${Number(params.value[1]).toFixed(0)} kg/ha<br/><b>Deviated Rain:</b> ${Number(params.value[0]).toFixed(0)} mm`;
                                        }
                                        if (params.seriesName === 'Trend') return '';
                                        return `<b>${params.data?.[2] || 'District'}</b><br/>Yield: ${params.value[1]} kg/ha<br/>Rainfall: ${params.value[0]} mm`;
                                    }
                                },
                                xAxis: {
                                    type: 'value',
                                    name: 'Rainfall (mm)',
                                    nameLocation: 'middle',
                                    nameGap: 22,
                                    axisLabel: { color: '#94a3b8', fontSize: 9 },
                                    splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
                                    axisLine: { show: false },
                                    scale: true,
                                },
                                yAxis: {
                                    type: 'value',
                                    name: 'Yield (kg/ha)',
                                    nameLocation: 'end',
                                    axisLabel: {
                                        color: '#94a3b8', fontSize: 9,
                                        formatter: (val: number) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                                    },
                                    splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
                                    axisLine: { show: false },
                                    scale: true,
                                },
                                series: [
                                    {
                                        name: 'Districts',
                                        type: 'scatter',
                                        symbolSize: 7,
                                        itemStyle: { color: '#818cf8', opacity: 0.65 },
                                        data: (prediction.data_points || []).map((p) => [p.rain, p.yield, p.district]),
                                    },
                                    {
                                        name: 'Trend',
                                        type: 'line',
                                        showSymbol: false,
                                        lineStyle: { color: '#a5b4fc', width: 2, type: 'dashed' },
                                        itemStyle: { color: '#a5b4fc' },
                                        data: (prediction.regression_line || []).map((p) => [p.x, p.y]),
                                        silent: true,
                                    },
                                    {
                                        name: 'Projection',
                                        type: 'scatter',
                                        symbolSize: 12,
                                        symbol: 'diamond',
                                        itemStyle: { color: '#f43f5e', shadowBlur: 4, shadowColor: 'rgba(244,63,94,0.3)' },
                                        data: [[projection.rain_mm, projection.yield]],
                                        markLine: {
                                            data: [{ xAxis: projection.rain_mm }],
                                            lineStyle: { type: 'dashed', color: '#fda4af', width: 1 },
                                            symbol: ['none', 'none'],
                                            label: { show: false },
                                        },
                                    },
                                ],
                            }}
                            style={{ height: '100%', width: '100%' }}
                        />
                    </div>

                    {/* Factor Contributions Table */}
                    {prediction.factors.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Factor Contributions</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {prediction.factors.map((f) => (
                                    <div key={f.key} className="px-4 py-2 flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${f.direction === 'positive' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                            <span className="text-slate-600 font-medium">{f.name}</span>
                                        </div>
                                        <span className={`font-mono font-bold ${f.contribution >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {f.contribution >= 0 ? '+' : ''}{f.contribution.toFixed(0)} kg/ha
                                        </span>
                                    </div>
                                ))}
                                <div className="px-4 py-2 flex items-center justify-between text-[11px] bg-indigo-50/50">
                                    <span className="text-indigo-600 font-bold">+ Intercept</span>
                                    <span className="font-mono font-bold text-indigo-600">
                                        {(prediction.predicted_yield - prediction.factors.reduce((s, f) => s + f.contribution, 0)).toFixed(0)} kg/ha
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Model Explanation (Collapsible) ─── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">How This Model Works</span>
                    </div>
                    {showExplanation ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>

                {showExplanation && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                        {/* Methodology */}
                        <div className="mt-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Methodology</div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                                {prediction.methodology.replace(/\*\*/g, '')}
                            </p>
                        </div>

                        {/* Model Equation */}
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Model Equation</div>
                            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-700 overflow-x-auto">
                                {prediction.model_equation}
                            </div>
                        </div>

                        {/* Feature Descriptions */}
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Features Explained</div>
                            <div className="space-y-1.5">
                                {prediction.factors.map((f) => (
                                    <div key={f.key} className="flex items-start gap-2 text-[10px]">
                                        <CheckCircle2 size={11} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-slate-600">{f.name}:</span>{' '}
                                            <span className="text-slate-500">{f.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Quality Notes */}
                        {prediction.data_quality_notes.length > 0 && (
                            <div>
                                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Data Quality Notes</div>
                                <div className="space-y-1">
                                    {prediction.data_quality_notes.map((note, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[10px]">
                                            <AlertCircle size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-500">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Model Stats */}
                        <div className="flex flex-wrap gap-3 pt-1">
                            {[
                                { label: 'R²', value: prediction.r_squared.toFixed(4) },
                                { label: 'Adj R²', value: prediction.adjusted_r_squared.toFixed(4) },
                                { label: 'RMSE', value: prediction.rmse.toFixed(1) },
                                { label: 'Sample', value: `${prediction.sample_size} districts` },
                                { label: 'Features', value: prediction.feature_count.toString() },
                            ].map((stat) => (
                                <div key={stat.label} className="text-[10px]">
                                    <span className="text-slate-400 uppercase font-bold tracking-widest">{stat.label}: </span>
                                    <span className="text-slate-600 font-mono">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

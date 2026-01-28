
"use client";

import React, { useState, useEffect } from 'react';
import { StateSummaryPanel } from './StateSummaryPanel';
import { SplitDistrictTable } from './SplitDistrictTable';
import { ComparisonView } from './ComparisonView';
import { ComparisonModeSelector } from './ComparisonModeSelector';
import { LayoutDashboard } from 'lucide-react';

export function SplitImpactDashboard() {
    const [states, setStates] = useState<string[]>([]);
    const [allStats, setAllStats] = useState<any>({});

    // Selectors
    const [selectedState, setSelectedState] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('wheat');
    const [selectedMetric, setSelectedMetric] = useState('yield');

    // Selection
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [comparisonMode, setComparisonMode] = useState('before_after');

    // Initial Load of States
    useEffect(() => {
        fetch('/api/split-impact/summary')
            .then(r => r.json())
            .then(d => {
                if (d.states && Array.isArray(d.states)) {
                    setStates(d.states);
                    setAllStats(d.stats);
                    if (d.states.length > 0) setSelectedState(d.states[0]);
                }
            })
            .catch(e => console.error("Summary Fetch Fail", e));
    }, []);

    const currentStateStats = allStats[selectedState] || null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 border-b border-slate-800 pb-6 gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                        <LayoutDashboard className="text-emerald-500" />
                        Boundary Split Impact Analysis
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                        A scientific dashboard for evaluating agricultural performance changes across district reorganization events using harmonized v1.5 panel data.
                    </p>
                </div>

                {/* Global Controls */}
                <div className="flex gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800 shadow-xl">
                    {/* State Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">State</label>
                        <select
                            value={selectedState}
                            onChange={e => { setSelectedState(e.target.value); setSelectedEvent(null); }}
                            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white min-w-[150px]"
                        >
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Crop Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Crop</label>
                        <select
                            value={selectedCrop}
                            onChange={e => setSelectedCrop(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                        >
                            <option value="wheat">Wheat</option>
                            <option value="rice">Rice</option>
                            <option value="maize">Maize</option>
                            <option value="sorghum">Sorghum</option>
                            <option value="groundnut">Groundnut</option>
                        </select>
                    </div>

                    {/* Metric Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={e => setSelectedMetric(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white"
                        >
                            <option value="yield">Yield (Kg/Ha)</option>
                            <option value="area">Area</option>
                            <option value="production">Production</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <StateSummaryPanel stateName={selectedState} stats={currentStateStats} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Table (Left) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <SplitDistrictTable
                        state={selectedState}
                        onSelect={setSelectedEvent}
                        selectedEventId={selectedEvent?.id}
                    />
                </div>

                {/* Charts (Right) */}
                <div className="lg:col-span-7 flex flex-col h-[calc(100vh-350px)] min-h-[600px]">
                    {selectedEvent ? (
                        <>
                            <ComparisonModeSelector mode={comparisonMode} onChange={setComparisonMode} />
                            <ComparisonView
                                event={selectedEvent}
                                crop={selectedCrop}
                                metric={selectedMetric}
                                mode={comparisonMode}
                            />
                        </>
                    ) : (
                        <div className="h-full border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/20">
                            <LayoutDashboard size={48} className="mb-4 opacity-50 text-emerald-500" />
                            <p className="text-lg font-medium text-slate-400">Select a split event</p>
                            <p className="text-sm opacity-70">Choose a district from the left to begin analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

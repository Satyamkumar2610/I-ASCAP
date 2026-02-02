
"use client";

import React, { useState, useEffect } from 'react';
import { StateSummaryPanel } from './StateSummaryPanel';
import SplitDistrictTable from './SplitDistrictTable';
import { ComparisonView } from './ComparisonView';
import { ComparisonModeSelector } from './ComparisonModeSelector';
import { LayoutDashboard, ChevronLeft, Menu, X } from 'lucide-react';

export function SplitImpactDashboard() {
    const [states, setStates] = useState<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [allStats, setAllStats] = useState<any>({});

    // Selectors
    const [selectedState, setSelectedState] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('wheat');
    const [selectedMetric, setSelectedMetric] = useState('yield');

    // Selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [comparisonMode, setComparisonMode] = useState('before_after');

    // Mobile UI state
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [mobileView, setMobileView] = useState<'list' | 'analysis'>('list');

    // Helper: Smart Default for Crop based on Region
    const getDefaultCrop = (stateName: string) => {
        const s = stateName.toLowerCase();
        // Wheat Belt
        const wheatStates = ['punjab', 'haryana', 'uttar pradesh', 'madhya pradesh', 'rajasthan', 'bihar', 'gujarat', 'himachal', 'uttarakhand'];
        if (wheatStates.some(w => s.includes(w))) return 'wheat';
        // Default to Rice (South, East, Islands)
        return 'rice';
    };

    // Initial Load of States
    useEffect(() => {
        fetch('/api/split-impact/summary')
            .then(r => r.json())
            .then(d => {
                if (d.states && Array.isArray(d.states)) {
                    setStates(d.states);
                    setAllStats(d.stats);
                    if (d.states.length > 0) {
                        const firstState = d.states[0];
                        setSelectedState(firstState);
                        // Set smart default crop
                        setSelectedCrop(getDefaultCrop(firstState));
                    }
                }
            })
            .catch(e => console.error("Summary Fetch Fail", e));
    }, []);

    // Switch to analysis view when event is selected on mobile
    // Handled in handleEventSelect now to avoid useEffect loop

    // useEffect(() => {
    //     if (selectedEvent && window.innerWidth < 1024) {
    //         setMobileView('analysis');
    //     }
    // }, [selectedEvent]);

    const currentStateStats = allStats[selectedState] || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEventSelect = (event: any) => {
        setSelectedEvent(event);
        // Auto-switch to analysis view on mobile
        if (window.innerWidth < 1024) {
            setMobileView('analysis');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6 border-b border-slate-800 pb-4 md:pb-6">
                {/* Title Row */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2 md:gap-3 truncate">
                            <LayoutDashboard className="text-emerald-500 shrink-0 w-5 h-5 md:w-6 md:h-6" />
                            <span className="hidden sm:inline">Boundary Split Impact Analysis</span>
                            <span className="sm:hidden">Split Impact</span>
                        </h1>
                        <p className="text-slate-400 mt-1 md:mt-2 text-xs md:text-sm leading-relaxed hidden md:block max-w-2xl">
                            Scientific analysis of agricultural performance across district boundary changes.
                        </p>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Controls - Always visible on desktop, toggle on mobile */}
                <div className={`${showMobileMenu ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2 md:gap-3 bg-slate-900 p-2 md:p-3 rounded-lg border border-slate-800 shadow-xl`}>
                    {/* State Selector */}
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">State</label>
                        <select
                            value={selectedState}
                            onChange={e => {
                                const s = e.target.value;
                                setSelectedState(s);
                                setSelectedCrop(getDefaultCrop(s));
                                setSelectedEvent(null);
                                setMobileView('list');
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-2 md:px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white w-full"
                        >
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Crop Selector */}
                    <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Crop</label>
                        <select
                            value={selectedCrop}
                            onChange={e => setSelectedCrop(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 md:px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white w-full"
                        >
                            <option value="wheat">Wheat</option>
                            <option value="rice">Rice</option>
                            <option value="maize">Maize</option>
                            <option value="sorghum">Sorghum</option>
                            <option value="groundnut">Groundnut</option>
                            <option value="cotton">Cotton</option>
                            <option value="sugarcane">Sugarcane</option>
                        </select>
                    </div>

                    {/* Metric Selector */}
                    <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                        <label className="text-[10px] uppercase font-bold text-slate-500 px-1">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={e => setSelectedMetric(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 md:px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-white w-full"
                        >
                            <option value="yield">Yield (Kg/Ha)</option>
                            <option value="area">Area</option>
                            <option value="production">Production</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary - Scrollable on mobile */}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                <StateSummaryPanel stateName={selectedState} stats={currentStateStats} />
            </div>

            {/* Mobile View Toggle */}
            <div className="lg:hidden flex gap-2 mb-4">
                <button
                    onClick={() => setMobileView('list')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mobileView === 'list'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                >
                    Split Events
                </button>
                <button
                    onClick={() => setMobileView('analysis')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${mobileView === 'analysis'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                    disabled={!selectedEvent}
                >
                    Analysis {selectedEvent ? '✓' : ''}
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
                {/* Table (Left) - Hidden on mobile when viewing analysis */}
                <div className={`lg:col-span-5 flex flex-col gap-4 ${mobileView === 'analysis' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="max-h-[50vh] lg:max-h-[calc(100vh-350px)] overflow-hidden">
                        <SplitDistrictTable
                            splits={currentStateStats}
                            onSelect={handleEventSelect}
                            selectedEventId={selectedEvent?.id}
                        />
                    </div>
                </div>

                {/* Charts (Right) - Full width on mobile when viewing analysis */}
                <div className={`lg:col-span-7 flex flex-col min-h-[60vh] lg:min-h-[600px] lg:h-[calc(100vh-350px)] ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedEvent ? (
                        <>
                            {/* Back button on mobile */}
                            <button
                                className="lg:hidden flex items-center gap-2 text-slate-400 hover:text-white mb-3 text-sm"
                                onClick={() => setMobileView('list')}
                            >
                                <ChevronLeft size={16} />
                                Back to Split Events
                            </button>

                            <ComparisonModeSelector mode={comparisonMode} onChange={setComparisonMode} />
                            <ComparisonView
                                event={selectedEvent}
                                crop={selectedCrop}
                                metric={selectedMetric}
                                mode={comparisonMode}
                            />
                        </>
                    ) : (
                        <div className="h-full border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 p-6">
                            <LayoutDashboard size={48} className="mb-4 opacity-50 text-emerald-500" />
                            <p className="text-lg font-medium text-slate-400 text-center">Select a split event</p>
                            <p className="text-sm opacity-70 text-center">Choose a district from the list to begin analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

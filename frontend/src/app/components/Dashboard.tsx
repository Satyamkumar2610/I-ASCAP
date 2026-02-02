"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Activity, Menu, X, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import bridgeData from '../../data/map_bridge.json';
import AnalyticsPanel from './AnalyticsPanel';
import BookmarkPanel from './BookmarkPanel';

interface DashboardProps {
    selectedDistrict: string | null;
    currentYear: number;
    onClose: () => void;
    onDistrictSelect: (district: string) => void;
    // New Props for Data Control
    currentCrop: string;
    onCropChange: (c: string) => void;
    currentMetric: string;
    onMetricChange: (m: string) => void;
    districtData?: { value: number };
    // Rainfall Layer
    showRainfallLayer?: boolean;
    onRainfallLayerToggle?: () => void;
}

const CROPS = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'maize', label: 'Maize' },
    { value: 'sorghum', label: 'Sorghum' },
    { value: 'pearl_millet', label: 'Pearl Millet' },
    { value: 'finger_millet', label: 'Finger Millet' },
    { value: 'barley', label: 'Barley' },
    { value: 'chickpea', label: 'Chickpea' },
    { value: 'pigeonpea', label: 'Pigeonpea' },
    { value: 'groundnut', label: 'Groundnut' },
    { value: 'soyabean', label: 'Soyabean' },
    { value: 'sesamum', label: 'Sesamum' },
    { value: 'rapeseed_and_mustard', label: 'Rapeseed & Mustard' },
    { value: 'sunflower', label: 'Sunflower' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'oilseeds', label: 'Total Oilseeds' },
];

const Dashboard: React.FC<DashboardProps> = ({
    selectedDistrict,
    // ...
    currentYear,
    onClose,
    onDistrictSelect,
    currentCrop,
    onCropChange,
    currentMetric,
    onMetricChange,
    districtData,
    showRainfallLayer,
    onRainfallLayerToggle,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Type Definitions
    interface RainfallData {
        annual: number;
        monsoon: number;
        classification: string;
        deviation: number;
        seasonal?: {
            monsoon_jjas: number;
            pre_monsoon_mam: number;
            post_monsoon_ond: number;
            winter_jf: number;
        };
    }

    interface HistoryData {
        year: number;
        value: number;
    }

    const [rainfallData, setRainfallData] = useState<RainfallData | null>(null);
    const [rainfallLoading, setRainfallLoading] = useState(false);

    // Load available districts from Import
    const availableDistricts = React.useMemo(() => {
        const raw = bridgeData as Record<string, string>;
        const dists = Object.keys(raw).map(k => k.split('|')[0]);
        return Array.from(new Set(dists)).sort();
    }, []);

    // History State
    // History State
    const [history, setHistory] = useState<HistoryData[]>([]);

    useEffect(() => {
        let active = true;
        if (selectedDistrict) {
            setHistory([]);
            // Basic fetch - in future pass ID/state if available
            fetch(`/api/history?district=${encodeURIComponent(selectedDistrict)}&crop=${currentCrop}`)
                .then(r => r.json())
                .then(data => {
                    if (active && Array.isArray(data)) setHistory(data);
                })
                .catch(err => console.error("Failed to load history", err));
        }
        return () => { active = false; };
    }, [selectedDistrict, currentCrop]);

    // Fetch rainfall data when district is selected and rainfall layer is on
    // Fetch rainfall data when district is selected and rainfall layer is on
    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            if (selectedDistrict && showRainfallLayer) {
                setRainfallLoading(true);
                setRainfallData(null);

                // Try to get state from bridge data
                const raw = bridgeData as Record<string, string>;
                const stateKey = Object.keys(raw).find(k => k.startsWith(selectedDistrict + '|'));
                const stateName = stateKey ? stateKey.split('|')[1] : '';

                try {
                    const res = await fetch(`/api/rainfall?district=${encodeURIComponent(selectedDistrict)}&state=${encodeURIComponent(stateName)}&year=${currentYear}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (active && !data.error) setRainfallData(data);
                    }
                } catch (err) {
                    console.error('Failed to load rainfall', err);
                } finally {
                    if (active) setRainfallLoading(false);
                }
            } else {
                if (active) setRainfallData(null);
            }
        };

        fetchData();
        return () => { active = false; };
    }, [selectedDistrict, showRainfallLayer, currentYear]);

    // Real Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 2) {
                const filtered = availableDistricts.filter(d =>
                    d.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 10);
                setSearchResults(filtered);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, availableDistricts]);


    // Full Sidebar Layout
    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-[60] md:hidden bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-lg"
                aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
                {isMobileOpen ? (
                    <X size={24} className="text-emerald-400" />
                ) : (
                    <Menu size={24} className="text-emerald-400" />
                )}
            </button>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 z-50 shadow-2xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Header / Branding */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent font-serif tracking-tight">
                        I-ASCAP
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-medium leading-relaxed">
                        Indian Agri-Spatial<br />Comparative Analytics
                    </p>
                </div>

                {/* Search Section */}
                <div className="p-4 border-b border-slate-800 relative z-20">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search district..."
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-md py-2 pl-9 pr-3 text-sm focus:border-emerald-500 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search district"
                        />
                    </div>
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <ul className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-30 list-none p-0" role="listbox" aria-label="Search Results">
                            {searchResults.map((result, idx) => (
                                <li key={idx} role="option" aria-selected={false}>
                                    <button
                                        className="w-full text-left p-2.5 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-2 text-sm border-b border-slate-800 last:border-0"
                                        onClick={() => {
                                            onDistrictSelect(result);
                                            setSearchTerm('');
                                            setSearchResults([]);
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {result}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">

                    {/* 0. Saved Views (New) */}
                    <BookmarkPanel
                        onSelect={(b) => {
                            onDistrictSelect(b.district); // Ideally pass state/year/crop too but Dashboard props need updating
                            // For V1, let's just trigger dist select. 
                            // TODO: Propagate year/crop/metric changes up to Dashboard via a unified `setContext`?
                            // For now, let's just select the district.
                        }}
                    />

                    {/* 1. Data Controls (Always Visible) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" /> Variables
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="crop-select" className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Crop Type</label>
                                <select
                                    id="crop-select"
                                    value={currentCrop}
                                    onChange={(e) => onCropChange(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded focus:border-emerald-500 outline-none text-sm p-2"
                                >
                                    {CROPS.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="metric-select" className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Metric</label>
                                <select
                                    id="metric-select"
                                    value={currentMetric}
                                    onChange={(e) => onMetricChange(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded focus:border-emerald-500 outline-none text-sm p-2"
                                >
                                    <option value="yield">Yield (kg/ha)</option>
                                    <option value="production">Production (Tons)</option>
                                    <option value="area">Area (1000 ha)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="pt-2 space-y-2">
                        <Link
                            href="/dashboard/split-impact"
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/10 rounded-md group-hover:bg-emerald-500/20">
                                    <Activity size={14} className="text-emerald-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">Split Impact</span>
                                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Boundary Analysis</span>
                                </div>
                            </div>
                            <ChevronDown size={14} className="text-slate-600 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Rainfall Layer Toggle */}
                        <button
                            onClick={onRainfallLayerToggle}
                            aria-pressed={showRainfallLayer}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${showRainfallLayer
                                ? 'bg-blue-500/20 border-blue-500/50'
                                : 'bg-slate-900/50 border-slate-800 hover:border-blue-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-md ${showRainfallLayer ? 'bg-blue-500/30' : 'bg-blue-500/10'}`}>
                                    <Calendar size={14} className="text-blue-400" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-200">Rainfall Layer</span>
                                    <span className="text-[10px] text-slate-500">IMD Normals 1951-2000</span>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full transition-colors ${showRainfallLayer ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${showRainfallLayer ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                        </button>
                    </div>

                    {/* 2. Selected District Info & Analytics */}
                    {selectedDistrict ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-bold text-white leading-none">{selectedDistrict}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-slate-500 hover:text-white transition-colors"
                                    aria-label="Close details"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="text-slate-400 text-xs mb-4 font-mono">Year: {currentYear}</div>

                            <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tight mb-4">
                                {districtData?.value != null ? districtData.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
                                <span className="text-xs text-slate-500 ml-2 font-normal uppercase">{currentMetric}</span>
                            </div>

                            {/* Rainfall Data Panel */}
                            {showRainfallLayer && (
                                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 mb-4">
                                    <h4 className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                        <Calendar size={10} /> Rainfall (IMD 1951-2000)
                                    </h4>
                                    {rainfallLoading ? (
                                        <div className="text-xs text-slate-500">Loading...</div>
                                    ) : rainfallData ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-400">Annual</span>
                                                <span className="text-sm font-bold text-blue-400">{rainfallData.annual} mm</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-xs text-slate-400">Monsoon (JJAS)</span>
                                                <span className="text-sm font-mono text-blue-300">{rainfallData.seasonal?.monsoon_jjas} mm</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-900/30">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-slate-500">Pre-Monsoon</div>
                                                    <div className="text-xs text-blue-300">{rainfallData.seasonal?.pre_monsoon_mam} mm</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-slate-500">Post-Monsoon</div>
                                                    <div className="text-xs text-blue-300">{rainfallData.seasonal?.post_monsoon_ond} mm</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic">No rainfall data</div>
                                    )}
                                </div>
                            )}

                            {/* Analytics Chart */}
                            <div className="border-t border-white/5 pt-4">
                                <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                    <Activity size={10} /> Historical Trend
                                </h4>
                                <div className="h-32 w-full -ml-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <XAxis dataKey="year" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                                                itemStyle={{ color: '#34d399' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={currentMetric}
                                                stroke="#34d399"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#fff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 4. Advanced Analytics Panel */}
                            {(() => {
                                // Resolve CDK and State
                                const raw = bridgeData as Record<string, string>;
                                const stateKey = Object.keys(raw).find(k => k.startsWith(selectedDistrict + '|'));
                                if (stateKey) {
                                    const cdk = raw[stateKey];
                                    const stateName = stateKey.split('|')[1];
                                    return (
                                        <AnalyticsPanel
                                            cdk={cdk}
                                            state={stateName}
                                            year={currentYear}
                                            crop={currentCrop}
                                        />
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-slate-800 rounded-lg text-center flex flex-col items-center justify-center opacity-50">
                            <MapPin size={24} className="text-slate-600 mb-2" />
                            <p className="text-xs text-slate-500 italic max-w-[200px]">Select a district on the map or search to view specific values.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-900 text-[10px] text-slate-600 font-mono flex justify-between items-center">
                    <span>v1.5 Harmonized</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> UDP</span>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

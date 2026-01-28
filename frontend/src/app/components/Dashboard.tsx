
"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MapPin, Activity, Calendar, Share2, Download } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import bridgeData from '../../data/map_bridge.json';

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
    districtData?: any;
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
    districtData
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Load available districts from Import
    const availableDistricts = React.useMemo(() => {
        const raw = bridgeData as Record<string, string>;
        const dists = Object.keys(raw).map(k => k.split('|')[0]);
        return Array.from(new Set(dists)).sort();
    }, []);

    // History State
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (selectedDistrict) {
            setHistory([]);
            // Basic fetch - in future pass ID/state if available
            fetch(`/api/history?district=${encodeURIComponent(selectedDistrict)}&crop=${currentCrop}`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setHistory(data);
                })
                .catch(err => console.error("Failed to load history", err));
        }
    }, [selectedDistrict, currentCrop]);

    // Real Search Logic
    useEffect(() => {
        if (searchTerm.length > 2) {
            setIsSearching(true);
            const filtered = availableDistricts.filter(d =>
                d.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 10);
            setSearchResults(filtered);
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, availableDistricts]);

    // Full Sidebar Layout
    return (
        <div className="fixed top-0 left-0 h-full w-80 bg-slate-950 border-r border-slate-800 z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
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
                    />
                </div>
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-4 right-4 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-30">
                        {searchResults.map((result, idx) => (
                            <div
                                key={idx}
                                className="p-2.5 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-2 text-sm border-b border-slate-800 last:border-0"
                                onClick={() => {
                                    onDistrictSelect(result);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">

                {/* 1. Data Controls (Always Visible) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500" /> Variables
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Crop Type</label>
                            <select
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
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Metric</label>
                            <select
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

                {/* 2. Selected District Info & Analytics */}
                {selectedDistrict ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-bold text-white leading-none">{selectedDistrict}</h2>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="text-slate-400 text-xs mb-4 font-mono">Year: {currentYear}</div>

                        <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tight mb-6">
                            {districtData?.value != null ? districtData.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
                            <span className="text-xs text-slate-500 ml-2 font-normal uppercase">{currentMetric}</span>
                        </div>

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
                    </div>
                ) : (
                    <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center">
                        <p className="text-xs text-slate-600 italic">Select a district on the map to view specific values.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-900 text-[10px] text-slate-600 font-mono flex justify-between items-center">
                <span>v1.5 Harmonized</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> UDP</span>
            </div>
        </div>
    );
};

export default Dashboard;

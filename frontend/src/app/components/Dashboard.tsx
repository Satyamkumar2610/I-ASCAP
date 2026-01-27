
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MapPin, Activity, Calendar, Share2, Download } from 'lucide-react';

interface DashboardProps {
    selectedDistrict: string | null;
    currentYear: number;
    onClose: () => void;
    onDistrictSelect: (district: string) => void;
    districtData?: any; // To be typed properly later
}

const Dashboard: React.FC<DashboardProps> = ({
    selectedDistrict,
    currentYear,
    onClose,
    onDistrictSelect,
    districtData
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Mock search logic - replace with API call
    useEffect(() => {
        if (searchTerm.length > 2) {
            setIsSearching(true);
            // Simulate API delay
            const timer = setTimeout(() => {
                // Mock results based on user input
                const mockDistricts = [
                    "Barddhaman", "Paschim Barddhaman", "Purba Barddhaman",
                    "Kolkata", "Darjeeling", "Kalimpong",
                    "Mumbai", "Thane", "Palghar",
                    "Bangalore Urban", "Bangalore Rural"
                ];

                const filtered = mockDistricts.filter(d =>
                    d.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filtered);
                setIsSearching(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    return (
        <div className={`fixed top-4 left-4 z-20 flex flex-col gap-4 transition-all duration-300 ${isExpanded ? 'w-96' : 'w-12'}`}>

            {/* Search Bar Container - Always Visible (mostly) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-2 relative overflow-visible">
                <div className="flex items-center gap-2">
                    {!isExpanded && (
                        <button onClick={() => setIsExpanded(true)} className="p-2 text-white hover:bg-white/10 rounded-full">
                            <Search size={20} />
                        </button>
                    )}

                    {isExpanded && (
                        <>
                            <Search className="text-gray-400 ml-2" size={20} />
                            <input
                                type="text"
                                placeholder="Search districts (e.g., Barddhaman)..."
                                className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full p-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <ChevronUp size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {isExpanded && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                            <div
                                key={idx}
                                className="p-3 hover:bg-blue-600/30 text-gray-200 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                onClick={() => {
                                    onDistrictSelect(result);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                }}
                            >
                                <MapPin size={16} className="text-blue-400" />
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* District Details Panel */}
            {isExpanded && selectedDistrict && (
                <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 text-white overflow-y-auto max-h-[70vh] animate-in slide-in-from-left-4 fade-in duration-300">

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                {selectedDistrict}
                            </h2>
                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> Data for {currentYear}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Crop Yield</p>
                            <p className="text-2xl font-semibold text-emerald-400">2,450 <span className="text-xs text-gray-500">kg/ha</span></p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rainfall</p>
                            <p className="text-2xl font-semibold text-blue-400">1,200 <span className="text-xs text-gray-500">mm</span></p>
                        </div>
                    </div>

                    {/* Lineage Section - The "Killer Feature" */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity size={18} className="text-purple-400" />
                            <h3 className="font-semibold text-lg">District Lineage</h3>
                        </div>

                        <div className="relative pl-4 border-l-2 border-dashed border-gray-700 space-y-6">
                            {/* Parent */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-600 border-2 border-[#0f172a]"></div>
                                <p className="text-xs text-gray-500 mb-1">Parent (1960)</p>
                                <p className="font-medium text-gray-300">Orignal {selectedDistrict}</p>
                            </div>

                            {/* Current */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0f172a] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                <p className="text-xs text-blue-400 mb-1 font-bold">Current ({currentYear})</p>
                                <p className="font-bold text-white text-lg">{selectedDistrict}</p>
                                <p className="text-xs text-gray-400 mt-1">Confirmed bifurcation in 2014</p>
                            </div>

                            {/* Children (Projected or Actual) */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-600 border-2 border-[#0f172a]"></div>
                                <p className="text-xs text-gray-500 mb-1">Child (2020)</p>
                                <p className="font-medium text-gray-300">Sub-District A</p>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Placeholder */}
                    <div className="bg-white/5 rounded-xl p-4 h-48 flex items-center justify-center border border-white/5 mb-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-gray-500 italic relative z-10">Advanced Analytics Graph Placeholder</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <Share2 size={16} /> Share
                        </button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                            <Download size={16} /> Export Data
                        </button>
                    </div>

                </div>
            )}

            {/* Floating State Filter (Bottom Left) */}
            {!selectedDistrict && isExpanded && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                    <h3 className="text-white text-sm font-semibold mb-2">Filters</h3>
                    <select className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 text-sm outline-none focus:border-blue-500">
                        <option>All States</option>
                        <option>West Bengal</option>
                        <option>Uttar Pradesh</option>
                        <option>Maharashtra</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default Dashboard;


"use client";

import React, { useState, useEffect } from 'react';
import { VisualizerToolbar, ChartType } from './VisualizerToolbar';
import { StateSelector } from './StateSelector';
import { DistrictSelector } from './DistrictSelector';
import { TimeSeriesChart } from './charts/TimeSeriesChart';

interface MetricData {
    year: number;
    area: number;
    production: number;
    yield: number;
    [key: string]: number; // Index signature for chart compatibility
}

const CROPS = ['wheat', 'rice', 'maize', 'sorghum', 'pearl_millet'];

export default function DataVisualizer() {
    // Selection State
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedCrop, setSelectedCrop] = useState<string>('wheat');

    // UI State
    const [viewType, setViewType] = useState<ChartType>('line');
    const [data, setData] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data when selections change
    useEffect(() => {
        if (!selectedState) {
            setData([]);
            return;
        }

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                let url = '';
                if (selectedDistrict) {
                    // Fetch district history
                    url = `/api/v1/metrics/history?state=${encodeURIComponent(selectedState || '')}&district=${encodeURIComponent(selectedDistrict || '')}&crop=${selectedCrop}`;
                } else {
                    // Fetch state aggregated history
                    url = `/api/v1/metrics/history/state?state=${encodeURIComponent(selectedState || '')}&crop=${selectedCrop}`;
                }

                const res = await fetch(url);
                if (!res.ok) {
                    // If backend returns 404 or logic error
                    if (res.status === 404) throw new Error("No data found for this selection");
                    throw new Error("Failed to fetch data");
                }
                const jsonData = await res.json();
                // jsonData is list of {year, area, production, yield}
                setData(jsonData);
            } catch (err: unknown) {
                console.error("Data fetch error:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
                setData([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedState, selectedDistrict, selectedCrop]);

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Visualise Data
                        </h1>

                        {/* Quick Crop Selector */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {CROPS.map(crop => (
                                <button
                                    key={crop}
                                    onClick={() => setSelectedCrop(crop)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${selectedCrop === crop
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {crop.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <VisualizerToolbar currentType={viewType} onTypeChange={setViewType} />
                </div>

                <div className="flex items-end gap-4 border-t pt-4 border-gray-50">
                    <div className="w-64">
                        <StateSelector selectedState={selectedState} onStateChange={(s) => {
                            setSelectedState(s);
                            setSelectedDistrict(null); // Reset district when state changes
                        }} />
                    </div>
                    <div className="w-64">
                        <DistrictSelector
                            selectedState={selectedState}
                            selectedDistrict={selectedDistrict}
                            onDistrictChange={setSelectedDistrict}
                        />
                    </div>

                    <div className="text-sm text-gray-500 pb-2 ml-auto">
                        {selectedState ? (
                            <span>
                                analyze <strong>{selectedDistrict || "Whole State"}</strong> for <strong>{selectedCrop}</strong>
                            </span>
                        ) : (
                            <span className="text-gray-400">Select a state to begin</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <div className="space-y-6">
                        {viewType === 'line' && (
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Yield Trends (kg/ha)</h3>
                                    <TimeSeriesChart data={data} metrics={['yield']} colors={['#3B82F6']} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Production (tonnes)</h3>
                                        <TimeSeriesChart data={data} metrics={['production']} colors={['#10B981']} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Area (ha)</h3>
                                        <TimeSeriesChart data={data} metrics={['area']} colors={['#F59E0B']} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewType === 'bar' && (
                            <div className="bg-yellow-50 p-4 rounded text-yellow-800">
                                Comparison View is coming soon. (Select multiple districts to compare)
                            </div>
                        )}

                        {viewType !== 'line' && viewType !== 'bar' && (
                            <div className="bg-blue-50 p-4 rounded text-blue-800">
                                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} view not implemented yet.
                            </div>
                        )}
                    </div>
                )}

                {!loading && !error && data.length === 0 && selectedState && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>No data found for this selection.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

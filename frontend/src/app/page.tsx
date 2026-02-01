
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TimeSlider from './components/TimeSlider';
import Dashboard from './components/Dashboard';
import { useDistrictMetrics } from './hooks/useDistrictMetrics';

// Define props interface
interface MapInterfaceProps {
  year: number;
  crop?: string;
  metric?: string;
  selectedDistrict?: string | null;
  onDistrictSelect: (id: string) => void;
  showRainfallLayer?: boolean;
}

// Dynamically import MapInterface to avoid SSR issues with Mapbox/Window
const MapInterface = dynamic<MapInterfaceProps>(() => import('./components/MapInterface'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      <div className="text-sm font-mono text-emerald-400 animate-pulse uppercase tracking-widest">Initializing Engine...</div>
    </div>
  )
});

export default function Home() {
  const [year, setYear] = useState(2001); // Default to 2001 (Data rich)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [crop, setCrop] = useState('wheat');
  const [metric, setMetric] = useState('yield');
  const [showRainfallLayer, setShowRainfallLayer] = useState(false);

  // Fetch Data for Dashboard Lookup
  const { joinedData } = useDistrictMetrics(year, crop, metric);

  // Lookup selected district value
  // joinedData keys are "District|State"
  const selectedData = selectedDistrict ? (() => {
    // Exact match?
    if (joinedData[selectedDistrict]) return joinedData[selectedDistrict];
    // Lookup by Name prefix (e.g. "Kanpur Nagar" matches "Kanpur Nagar|Uttar Pradesh")
    const key = Object.keys(joinedData).find(k => k.startsWith(selectedDistrict + '|'));
    return key ? joinedData[key] : null;
  })() : null;

  return (
    <main className="flex h-screen w-screen bg-slate-950 overflow-hidden relative">
      <a
        href="#main-map"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-md shadow-lg font-bold transition-all"
      >
        Skip to Main Map
      </a>

      {/* Sidebar / Dashboard */}
      <Dashboard
        selectedDistrict={selectedDistrict}
        currentYear={year}
        onClose={() => setSelectedDistrict(null)}
        onDistrictSelect={setSelectedDistrict}
        currentCrop={crop}
        onCropChange={setCrop}
        currentMetric={metric}
        onMetricChange={setMetric}
        districtData={selectedData}
        showRainfallLayer={showRainfallLayer}
        onRainfallLayerToggle={() => setShowRainfallLayer(!showRainfallLayer)}
      />

      {/* Main Content Area (Offset by Sidebar Width on desktop only) */}
      <div className="flex-1 flex flex-col h-full relative md:ml-80">

        {/* Map Area */}
        <div id="main-map" className="flex-1 relative z-0" aria-label="Interactive Map Region">
          <MapInterface
            year={year}
            crop={crop}
            metric={metric}
            selectedDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
            showRainfallLayer={showRainfallLayer}
          />
        </div>

        {/* Time Slider Control */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-10 md:right-10 z-10 pointer-events-none flex justify-center">
          <div className="pointer-events-auto w-full max-w-4xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 md:p-4 rounded-xl shadow-2xl">
            <TimeSlider
              minYear={1990}
              maxYear={2017}
              currentYear={year}
              onChange={setYear}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

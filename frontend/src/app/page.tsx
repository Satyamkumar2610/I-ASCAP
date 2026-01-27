"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TimeSlider from './components/TimeSlider';
import Dashboard from './components/Dashboard';

// Define props interface
interface MapInterfaceProps {
  year: number;
  selectedDistrict?: string | null;
  onDistrictSelect: (id: string) => void;
}

// Dynamically import MapInterface to avoid SSR issues with Mapbox/Window
const MapInterface = dynamic<MapInterfaceProps>(() => import('./components/MapInterface'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white">Initializing Geospatial Engine...</div>
});

export default function Home() {
  const [year, setYear] = useState(2024);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      {/* Header / Title Overlay */}
      <div className="absolute top-0 left-0 z-10 w-full p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-lg tracking-tight">
            I-ASCAP
          </h1>
          <p className="text-gray-300 text-xs md:text-sm font-light tracking-widest uppercase opacity-80 mt-1">
            Indian Agri-Spatial Comparative Analytics Platform
          </p>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="absolute inset-0 z-0">
        <MapInterface year={year} selectedDistrict={selectedDistrict} onDistrictSelect={setSelectedDistrict} />
      </div>

      {/* Dashboard & Left Panel */}
      <Dashboard
        selectedDistrict={selectedDistrict}
        currentYear={year}
        onClose={() => setSelectedDistrict(null)}
        onDistrictSelect={setSelectedDistrict}
      />

      {/* Time Slider Control */}
      <div className="absolute bottom-0 w-full z-10 pointer-events-none">
        <div className="pointer-events-auto pb-8 pt-4 bg-gradient-to-t from-black/90 to-transparent">
          <TimeSlider
            minYear={1966}
            maxYear={2024}
            currentYear={year}
            onChange={setYear}
          />
        </div>
      </div>
    </main>
  );
}

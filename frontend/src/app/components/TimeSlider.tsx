"use client";

import React, { useState } from 'react';

interface TimeSliderProps {
    minYear: number;
    maxYear: number;
    currentYear: number;
    onChange: (year: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ minYear, maxYear, currentYear, onChange }) => {
    return (
        <div className="w-[90%] md:w-[60%] mx-auto bg-black/40 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-end mb-4">
                <span className="font-medium text-gray-400 text-sm">{minYear}</span>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-1">Selected Year</span>
                    <span className="font-black text-4xl text-white shadow-blue-500/50 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        {currentYear}
                    </span>
                </div>
                <span className="font-medium text-gray-400 text-sm">{maxYear}</span>
            </div>

            <div className="relative w-full h-8 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-100 ease-out"
                        style={{ width: `${((currentYear - minYear) / (maxYear - minYear)) * 100}%` }}
                    ></div>
                </div>

                {/* Thumb input overlay */}
                <input
                    type="range"
                    min={minYear}
                    max={maxYear}
                    value={currentYear}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
                />

                {/* Custom Thumb (Visual only) */}
                <div
                    className="absolute h-6 w-6 bg-white border-4 border-blue-500 rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out"
                    style={{ left: `calc(${((currentYear - minYear) / (maxYear - minYear)) * 100}% - 12px)` }}
                ></div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-600 mt-3 md:px-2 font-mono">
                <span className="hidden md:block">| 1947 Partition</span>
                <span>| 2000 New States</span>
                <span>| 2014 Telangana</span>
                <span className="hidden md:block">Today |</span>
            </div>
        </div>
    );
};

export default TimeSlider;

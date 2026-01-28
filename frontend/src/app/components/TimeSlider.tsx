"use client";

import React, { useState } from 'react';

interface TimeSliderProps {
    minYear: number;
    maxYear: number;
    currentYear: number;
    onChange: (year: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ minYear, maxYear, currentYear, onChange }) => {
    // Generate marks for every 5 years
    const marks = [];
    for (let y = minYear; y <= maxYear; y++) {
        if (y % 5 === 0 || y === minYear || y === maxYear) {
            marks.push(y);
        }
    }

    return (
        <div className="w-full relative px-2">
            <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-slate-200 font-mono tracking-tighter">{currentYear}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Timeline</span>
            </div>

            <input
                type="range"
                min={minYear}
                max={maxYear}
                value={currentYear}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />

            {/* Ticks */}
            <div className="flex justify-between w-full mt-2 select-none">
                {marks.map(year => (
                    <div key={year} className="flex flex-col items-center">
                        <div className="h-1.5 w-px bg-slate-600 mb-1"></div>
                        <span className={`text-[10px] ${year === currentYear ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                            {year}
                        </span>
                    </div>
                ))}
            </div>

            {/* Micro-markers for context (Optional) */}
            <div className="absolute top-8 left-0 w-full h-4 pointer-events-none mt-2 opacity-30">
                {/* Just some visual noise/context markers could go here */}
            </div>
        </div>
    );
};

export default TimeSlider;

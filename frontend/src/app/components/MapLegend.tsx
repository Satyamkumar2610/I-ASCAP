import React from 'react';

interface MapLegendProps {
    min: number;
    max: number;
    label: string;
    type: 'agri' | 'rainfall';
}

import { AGRI_COLORS, RAINFALL_COLORS } from '../utils/colors';

export const MapLegend: React.FC<MapLegendProps> = ({ min, max, label, type }) => {
    const colors = type === 'rainfall' ? RAINFALL_COLORS : AGRI_COLORS;

    return (
        <div className="absolute bottom-8 right-8 bg-slate-900/90 border border-slate-700 p-3 rounded-lg backdrop-blur-sm shadow-xl z-10 max-w-[200px]">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">{label}</h4>

            <div className="flex items-center gap-1 mb-1">
                {colors.map((color, idx) => (
                    <div key={idx} className="h-2 flex-1 rounded-sm" style={{ backgroundColor: color }} />
                ))}
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{min.toLocaleString()}</span>
                <span>{max.toLocaleString()}</span>
            </div>
        </div>
    );
};

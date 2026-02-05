
"use client";

import React from 'react';
import { BarChart3, LineChart, PieChart, Table as TableIcon, ScatterChart, Map as MapIcon } from 'lucide-react';

export type ChartType = 'bar' | 'line' | 'pie' | 'table' | 'scatter' | 'map';

interface VisualizerToolbarProps {
    currentType: ChartType;
    onTypeChange: (type: ChartType) => void;
}

const TOOLBAR_ITEMS: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar', icon: <BarChart3 className="w-4 h-4" /> },
    { type: 'line', label: 'Line', icon: <LineChart className="w-4 h-4" /> },
    { type: 'pie', label: 'Pie', icon: <PieChart className="w-4 h-4" /> },
    { type: 'table', label: 'Table', icon: <TableIcon className="w-4 h-4" /> },
    { type: 'scatter', label: 'Scatter', icon: <ScatterChart className="w-4 h-4" /> },
    { type: 'map', label: 'Map', icon: <MapIcon className="w-4 h-4" /> },
];

export function VisualizerToolbar({ currentType, onTypeChange }: VisualizerToolbarProps) {
    return (
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-700 mr-2">Visualise</span>
            <div className="flex space-x-2">
                {TOOLBAR_ITEMS.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onTypeChange(item.type)}
                        className={`
              flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-colors
              ${currentType === item.type
                                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'}
            `}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

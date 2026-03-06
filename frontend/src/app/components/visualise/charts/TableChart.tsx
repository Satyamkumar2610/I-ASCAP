"use client";

import React from 'react';

interface ChartDataPoint {
    year: number;
    [key: string]: number;
}

interface TableChartProps {
    data: ChartDataPoint[];
    metrics: string[]; // e.g., ['yield', 'production', 'area']
}

export function TableChart({ data, metrics }: TableChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">No data available for table</span>
            </div>
        );
    }

    // Sort by year descending
    const sortedData = [...data].sort((a, b) => b.year - a.year);

    return (
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-300">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Year
                            </th>
                            {metrics.map(metric => (
                                <th key={metric} scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    {metric}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedData.map((row, i) => (
                            <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {row.year}
                                </td>
                                {metrics.map(metric => (
                                    <td key={metric} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right font-mono">
                                        {row[metric]?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

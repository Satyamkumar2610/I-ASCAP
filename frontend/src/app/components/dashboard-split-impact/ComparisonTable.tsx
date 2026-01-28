
"use client";
import React from 'react';

export function ComparisonTable({ data, series, splitYear, metric }: any) {
    if (!data || data.length === 0) return null;

    // Calculate Stats for each Series
    const rows = series.map((s: any) => {
        // Pre-Split Window (Split-5 to Split-1)
        const preData = data.filter((d: any) => d.year >= splitYear - 5 && d.year < splitYear && d[s.id] != null)
            .map((d: any) => d[s.id]);

        // Post-Split Window (Split to Split+5)
        const postData = data.filter((d: any) => d.year >= splitYear && d.year <= splitYear + 5 && d[s.id] != null)
            .map((d: any) => d[s.id]);

        const avgPre = preData.length > 0 ? preData.reduce((a: number, b: number) => a + b, 0) / preData.length : null;
        const avgPost = postData.length > 0 ? postData.reduce((a: number, b: number) => a + b, 0) / postData.length : null;

        let change = null;
        if (avgPre != null && avgPost != null && avgPre !== 0) {
            change = ((avgPost - avgPre) / avgPre) * 100;
        }

        return {
            entity: s.label,
            pre: avgPre,
            post: avgPost,
            change: change,
            yearsPre: preData.length,
            yearsPost: postData.length
        };
    });

    return (
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Statistical Comparison (±5 Year Window)
            </div>
            <table className="w-full text-xs text-left">
                <thead>
                    <tr className="border-b border-slate-800/50 text-slate-500">
                        <th className="px-4 py-2">Entity</th>
                        <th className="px-4 py-2 text-right">Avg (Pre-{splitYear})</th>
                        <th className="px-4 py-2 text-right">Avg (Post-{splitYear})</th>
                        <th className="px-4 py-2 text-right">% Change</th>
                        <th className="px-4 py-2 text-center">Confidence</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {rows.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium text-slate-300">{r.entity}</td>
                            <td className="px-4 py-3 text-right text-slate-400">
                                {r.pre !== null ? r.pre.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400">
                                {r.post !== null ? r.post.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {r.change !== null ? (
                                    <span className={`${r.change > 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono font-bold`}>
                                        {r.change > 0 ? '+' : ''}{r.change.toFixed(1)}%
                                    </span>
                                ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {r.yearsPre >= 3 && r.yearsPost >= 3 ? (
                                    <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-[10px]">High</span>
                                ) : (
                                    <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-[10px]">Low Data</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Shield, Activity, AlertTriangle } from 'lucide-react';
import { useBookmarks, Bookmark } from '../hooks/useBookmarks';

// Helper to fetch data
async function fetchComparisonData(id: string) {
    const [district, yearStr, crop] = id.split('-');
    const year = parseInt(yearStr);

    // We need bridge data to get CDK... assuming district name IS the CDK or close enough for now
    // Ideally we pass CDK in the ID. Let's assume ID is "DistrictName-Year-Crop"
    // In real app, we might need a lookup if CDK != Name. 
    // For V1, let's try using the name as CDK or fetching the bridge.

    // Fetch all metrics in parallel
    const [efficRes, riskRes] = await Promise.all([
        fetch(`/api/analysis/efficiency?cdk=${district}&crop=${crop}&year=${year}`),
        fetch(`/api/analysis/risk-profile?cdk=${district}&crop=${crop}`)
    ]);

    return {
        id,
        district,
        year,
        crop,
        efficiency: efficRes.ok ? await efficRes.json() : null,
        risk: riskRes.ok ? await riskRes.json() : null
    };
}

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ids = searchParams.get('ids')?.split(',') || [];

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ids.length === 0) return;

        const load = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(ids.map(fetchComparisonData));
                setData(results);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [searchParams]);

    if (ids.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl text-slate-400">No districts selected for comparison.</h2>
                <Link href="/" className="text-emerald-400 hover:underline mt-4 inline-block">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading comparison data...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                    <ArrowLeft size={20} className="text-slate-200" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Comparative Analysis</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">{item.district}</h2>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-800 rounded">{item.year}</span>
                                <span className="capitalize">{item.crop}</span>
                            </div>
                        </div>

                        {/* Efficiency */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                                <TrendingUp size={14} /> Efficiency
                            </h3>
                            {item.efficiency ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Relative Score</span>
                                        <span className="text-xl font-bold text-white">
                                            {(item.efficiency.relative_efficiency.efficiency_score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Historical</span>
                                        <div className={`text-sm font-mono ${item.efficiency.historical_efficiency.is_above_trend ? 'text-blue-400' : 'text-amber-400'}`}>
                                            {item.efficiency.historical_efficiency.is_above_trend ? 'Above Trend' : 'Below Trend'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 italic">No Data</div>
                            )}
                        </div>

                        {/* Risk */}
                        <div>
                            <h3 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                                <Shield size={14} /> Resilience
                            </h3>
                            {item.risk ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Resilience Score</span>
                                        <span className="text-xl font-bold text-white">
                                            {(item.risk.resilience_index.resilience_score * 100).toFixed(0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Reliability</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.risk.resilience_index.reliability_rating === 'A' ? 'bg-green-500/10 text-green-400' :
                                                'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            Grade {item.risk.resilience_index.reliability_rating}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 italic">No Data</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="text-white text-center pt-20">Loading comparisons...</div>}>
            <CompareContent />
        </Suspense>
    );
}

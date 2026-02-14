
// Direct Render Backend URL - avoids Vercel proxy timeout issues
// Use env var if set, otherwise default to production Render URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://i-ascap.onrender.com';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${BASE_URL}/api/v1/${cleanEndpoint}`;

    console.log(`[API] Fetching: ${url}`);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            // Allow backend time to wake from cold start
            signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`[API] Error ${response.status}: ${errorText}`);

            if (response.status === 404) {
                throw new ApiError(404, 'Resource not found');
            }
            if (response.status >= 500) {
                throw new ApiError(response.status, `Server error: ${errorText}`);
            }
            throw new ApiError(response.status, `API Error: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error(`[API] Network error:`, error);
        throw new ApiError(0, `Network error - backend may be waking up. Please retry.`);
    }
}

// --- Typed API Methods ---

export interface StateSummary {
    states: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats: Record<string, any>;
}

export interface SplitDistrict {
    id: string;
    parent_district: string;
    parent_cdk: string;
    split_year: number;
    children_districts: string[];
    children_cdks: string[];
    state: string;
}

export interface AnalysisResult {
    // Define the shape of your analysis data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// --- Additional Interfaces ---

export interface DistrictMetric {
    cdk: string;
    state: string;
    district: string;
    value: number;
    metric: string;
    method: string;
    geo_key?: string;
}

// Local definitions for DiversificationData and CropCorrelationData removed in favor of imports from ../../types/analysis

export interface DistrictRanking {
    rank: number;
    district: string;
    value: number;
}

export interface RainfallData {
    annual: number;
    seasonal: {
        monsoon_jjas: number;
        pre_monsoon_mam: number;
        post_monsoon_ond: number;
        winter_jf: number;
    };
}

import { EfficiencyData, RiskData, DiversificationData, CorrelationData, YieldTrendData, SplitImpactData } from '../../types/analysis';

export interface HistoryItem {
    year: number;
    [key: string]: number;
}

export interface AnalyticsSummary {
    summary: string;
    stats: Record<string, number>;
}

export interface SimulationResult {
    result: {
        baseline_yield: number;
        slope: number;
        data_points: { year: number; rain: number; yield: number }[];
        r_squared: number;
    };
}

// EfficiencyData and RiskProfileData removed in favor of imported types

export const api = {
    getSummary: () => fetcher<StateSummary>('analysis/split-impact/summary'),

    getSplitEvents: (state: string) =>
        fetcher<SplitDistrict[]>(`analysis/split-impact/districts?state=${encodeURIComponent(state)}`),

    getAnalysis: (params: Record<string, string | number>) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        return fetcher<AnalysisResult>(`analysis/split-impact/analysis?${searchParams.toString()}`);
    },

    // --- New Methods for Core Platform ---

    getDistrictMetrics: (year: number, crop: string, metric: string) =>
        fetcher<DistrictMetric[]>(`metrics?year=${year}&crop=${crop}&metric=${metric}`),

    getHistory: (district: string, crop: string) =>
        fetcher<HistoryItem[]>(`metrics/history?district=${encodeURIComponent(district)}&crop=${crop}`),

    // --- Advanced Analytics --

    getDiversification: (cdk: string, year: number) =>
        fetcher<DiversificationData>(`analytics/diversification?cdk=${cdk}&year=${year}`),

    getYieldTrend: (cdk: string, crop: string) =>
        fetcher<YieldTrendData>(`analytics/yield-trend?cdk=${cdk}&crop=${crop}`),

    getSplitImpact: (parentCdk: string, childCdks: string[], splitYear: number, crop: string) =>
        fetcher<SplitImpactData>(`analytics/split-impact?parent_cdk=${parentCdk}&child_cdks=${childCdks.join(',')}&split_year=${splitYear}&crop=${crop}`),

    getCropCorrelations: (state: string, year: number, crops?: string[]) =>
        fetcher<CorrelationData>(`analytics/crop-correlations?state=${encodeURIComponent(state)}&year=${year}${crops ? `&crops=${crops.join(',')}` : ''}`),

    getDistrictRankings: (state: string, crop: string, year: number) =>
        fetcher<DistrictRanking[]>(`analytics/district-rankings?state=${encodeURIComponent(state)}&crop=${crop}&year=${year}`),

    getAnalyticsSummary: (cdk: string, year: number) =>
        fetcher<AnalyticsSummary>(`analytics/summary?cdk=${cdk}&year=${year}`),

    // --- Simulation ---

    runSimulation: (district: string, state: string, crop: string, year: number) =>
        fetcher<SimulationResult>(`simulation?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&crop=${crop}&year=${year}`),

    // --- Legacy / Other ---

    getEfficiency: (cdk: string, crop: string, year: number) =>
        fetcher<EfficiencyData>(`analysis/efficiency?cdk=${cdk}&crop=${crop}&year=${year}`),

    getRiskProfile: (cdk: string, crop: string) =>
        fetcher<RiskData>(`analysis/risk-profile?cdk=${cdk}&crop=${crop}`),

    getRainfall: (district: string, state: string, year: number) =>
        fetcher<RainfallData>(`climate/rainfall?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&year=${year}`),
};


// Direct Render Backend URL - avoids Vercel proxy timeout issues
// Use env var if set, otherwise default to production Render URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://i-ascap.onrender.com';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchOnce<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

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
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${BASE_URL}/api/v1/${cleanEndpoint}`;

    console.log(`[API] Fetching: ${url}`);

    try {
        return await fetchOnce<T>(url, options);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        // Retry once after 2s for timeout / network errors (Render cold start)
        console.warn(`[API] Retrying after network error:`, error);
        await new Promise(r => setTimeout(r, 2000));
        try {
            return await fetchOnce<T>(url, options);
        } catch (retryError) {
            if (retryError instanceof ApiError) throw retryError;
            console.error(`[API] Retry failed:`, retryError);
            throw new ApiError(0, `Network error - backend may be waking up. Please retry.`);
        }
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

// V2 Prediction Types
export interface PredictionFactor {
    name: string;
    key: string;
    importance: number;
    coefficient: number;
    contribution: number;
    direction: string;
    description: string;
}

export interface PredictionV2Data {
    predicted_yield: number;
    baseline_yield: number;
    confidence_lower: number;
    confidence_upper: number;
    slope_rain: number;
    mean_rain: number;
    r_squared: number;
    adjusted_r_squared: number;
    rmse: number;
    sample_size: number;
    feature_count: number;
    method: string;
    factors: PredictionFactor[];
    model_equation: string;
    methodology: string;
    data_quality_notes: string[];
    data_points: { rain: number; yield: number; district: string }[];
    regression_line: { x: number; y: number }[];
}

export interface PredictionV2Result {
    district: string;
    state: string;
    crop: string;
    year: number;
    prediction: PredictionV2Data;
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

    getHistory: (district: string, crop: string, state?: string) =>
        fetcher<HistoryItem[]>(`metrics/history?district=${encodeURIComponent(district)}&crop=${crop}${state ? `&state=${encodeURIComponent(state)}` : ''}`),

    // --- Advanced Analytics --

    getDiversification: (cdk: string, year: number) =>
        fetcher<DiversificationData>(`analytics/diversification?cdk=${encodeURIComponent(cdk)}&year=${year}`),

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

    runPredictionV2: (district: string, state: string, crop: string, year: number) =>
        fetcher<PredictionV2Result>(`simulation/v2?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&crop=${crop}&year=${year}`),

    // --- Legacy / Other ---

    getEfficiency: (cdk: string, crop: string, year: number) =>
        fetcher<EfficiencyData>(`analysis/efficiency?cdk=${cdk}&crop=${crop}&year=${year}`),

    getRiskProfile: (cdk: string, crop: string) =>
        fetcher<RiskData>(`analysis/risk-profile?cdk=${cdk}&crop=${crop}`),

    getYoyGrowth: (cdk: string, crop: string, startYear: number = 1990, endYear: number = 2020) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`analytics/yoy-growth?cdk=${cdk}&crop=${crop}&start_year=${startYear}&end_year=${endYear}`),

    getRainfall: (district: string, state: string, year: number) =>
        fetcher<RainfallData>(`climate/rainfall?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&year=${year}`),

    // --- State-Level ---

    getStatesList: () =>
        fetcher<{ state: string; district_count: number }[]>('states/list'),

    getStateOverview: (state: string, crop: string = 'wheat', year?: number) =>
        fetcher<StateOverview>(`states/${encodeURIComponent(state)}/overview?crop=${crop}${year ? `&year=${year}` : ''}`),

    // --- Search ---

    getDistrictsByState: (state: string) =>
        fetcher<{ total: number; items: { cdk: string; name: string; state: string }[] }>(`districts?state=${encodeURIComponent(state)}`),

    searchDistricts: (query: string, type: string = 'all') =>
        fetcher<SearchResult>(`search?q=${encodeURIComponent(query)}&type=${type}`),

    // --- Anomaly Detection ---

    getDistrictAnomalies: (cdk: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`anomalies/district/${cdk}`),

    getStateAnomalies: (state: string, limit: number = 20) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`anomalies/state/${encodeURIComponent(state)}?limit=${limit}`),

    getHighRiskDistricts: (limit: number = 10) =>
        fetcher<HighRiskResult>(`anomalies/high-risk?limit=${limit}`),

    // --- Lineage ---

    getLineageHistory: (state?: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any[]>(`lineage/history${state ? `?state=${encodeURIComponent(state)}` : ''}`),

    getDataTracking: (cdk: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`lineage/tracking?cdk=${cdk}`),

    getStateCoverage: (state: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`lineage/coverage?state=${encodeURIComponent(state)}`),

    // --- Forecast ---

    getYieldForecast: (cdk: string, crop: string, horizon: number = 3) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`forecast/${cdk}/${crop}?horizon=${horizon}`),

    getCropRecommendations: (cdk: string, topN: number = 5) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`forecast/${cdk}/recommend?top_n=${topN}`),

    // --- Reports ---

    getDistrictReport: (cdk: string, crop: string = 'wheat', format: string = 'json') =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fetcher<any>(`reports/district-profile?cdk=${cdk}&crop=${crop}&format=${format}`),
};

// --- Additional Interfaces for New Pages ---

export interface StateOverview {
    state: string;
    year: number;
    crop: string;
    total_districts: number;
    districts_with_data: number;
    year_range: { min: number | null; max: number | null };
    avg_yield: number;
    total_area: number;
    total_production: number;
    top_performers: { district_name: string; cdk: string; yield_value: number }[];
    bottom_performers: { district_name: string; cdk: string; yield_value: number }[];
    available_crops: string[];
}

export interface SearchResult {
    query: string;
    total: number;
    results: {
        cdk?: string;
        name: string;
        state: string;
        result_type: 'district' | 'state';
        start_year?: number;
        end_year?: number;
        district_count?: number;
    }[];
}

export interface HighRiskResult {
    high_risk_districts: {
        cdk: string;
        state: string;
        district_name: string;
        risk_score: number;
        risk_level: string;
        factors: string[];
    }[];
    total_scanned: number;
}

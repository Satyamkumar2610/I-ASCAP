import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://i-ascap.onrender.com';
const API_KEY = process.env.API_KEY || 'dev-secret-key-123';

class ApiError extends Error {
    constructor(public status: number, public message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${BASE_URL}/api/v1/${cleanEndpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        // Backend requires Authorization header (even if token is dummy for now) 
        // because API_KEY is likely not configured on Render.
        'Authorization': 'Bearer dev-token-bypass',
        'X-API-Key': API_KEY, // Keep for backward compatibility if fixed later
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new ApiError(404, 'Resource not found');
        }
        if (response.status >= 500) {
            throw new ApiError(response.status, 'Server error - Retrying...');
        }
        throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return response.json();
}

// --- Typed API Methods ---

export interface StateSummary {
    states: string[];
    stats: Record<string, any>; // Consider refining 'any' if schema is known
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
    [key: string]: any;
}

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
        fetcher<any[]>(`metrics?year=${year}&crop=${crop}&metric=${metric}`),

    getEfficiency: (cdk: string, crop: string, year: number) =>
        fetcher<any>(`analysis/efficiency?cdk=${cdk}&crop=${crop}&year=${year}`),

    getRiskProfile: (cdk: string, crop: string) =>
        fetcher<any>(`analysis/risk-profile?cdk=${cdk}&crop=${crop}`),

    // --- Remaining Endpoints ---

    getDiversification: (state: string, year: number) =>
        fetcher<any>(`analysis/diversification?state=${encodeURIComponent(state)}&year=${year}`),

    getCorrelation: (state: string, crop: string, year: number) =>
        fetcher<any>(`climate/correlation?state=${encodeURIComponent(state)}&crop=${crop}&year=${year}`),

    getHistory: (district: string, crop: string) =>
        fetcher<any>(`history?district=${encodeURIComponent(district)}&crop=${crop}`),

    getRainfall: (district: string, state: string, year: number) =>
        fetcher<any>(`rainfall?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&year=${year}`),

    runSimulation: (district: string, state: string, crop: string, year: number) =>
        fetcher<any>(`simulation?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}&year=${year}`)
};

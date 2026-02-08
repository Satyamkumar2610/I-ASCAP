import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useStateSummary() {
    return useQuery({
        queryKey: ['stateSummary'],
        queryFn: api.getSummary,
        // Summary data changes rarely, cache for a long time
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useSplitEvents(state: string) {
    return useQuery({
        queryKey: ['splitEvents', state],
        queryFn: () => api.getSplitEvents(state),
        enabled: !!state, // Only run if state is selected
    });
}

export interface AnalysisParams {
    parent: string;
    children: string;
    splitYear: number;
    crop: string;
    metric: string;
    mode: string;
}

export function useAnalysis(params: AnalysisParams | null) {
    return useQuery({
        queryKey: ['analysis', params],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => api.getAnalysis(params as any),
        enabled: !!params,
        retry: 1, // Reduce retries for analysis
    });
}

// --- New Analytics Hooks ---

export function useYieldTrend(cdk: string, crop: string) {
    return useQuery({
        queryKey: ['yieldTrend', cdk, crop],
        queryFn: () => api.getYieldTrend(cdk, crop),
        enabled: !!cdk && !!crop,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useCropDiversification(cdk: string, year: number) {
    return useQuery({
        queryKey: ['diversification', cdk, year],
        queryFn: () => api.getDiversification(cdk, year),
        enabled: !!cdk,
        staleTime: 1000 * 60 * 60,
    });
}

export function useSplitImpactAnalysis(
    parentCdk: string,
    childCdks: string[],
    splitYear: number,
    crop: string
) {
    return useQuery({
        queryKey: ['splitImpact', parentCdk, childCdks, splitYear, crop],
        queryFn: () => api.getSplitImpact(parentCdk, childCdks, splitYear, crop),
        enabled: !!parentCdk && childCdks.length > 0 && !!crop,
        staleTime: 1000 * 60 * 60,
        select: (data) => {
            // Validate data structure before passing to component
            if (!data || !data.impact || !data.before || !data.after) return null;
            return data;
        }
    });
}

export function useDistrictRankings(state: string, crop: string, year: number) {
    return useQuery({
        queryKey: ['districtRankings', state, crop, year],
        queryFn: () => api.getDistrictRankings(state, crop, year),
        enabled: !!state && !!crop,
        staleTime: 1000 * 60 * 60,
    });
}

export function useCropCorrelations(state: string, year: number, crops?: string[]) {
    return useQuery({
        queryKey: ['cropCorrelations', state, year, crops],
        queryFn: () => api.getCropCorrelations(state, year, crops),
        enabled: !!state,
        staleTime: 1000 * 60 * 60,
    });
}

export function useAnalyticsSummary(cdk: string, year: number) {
    return useQuery({
        queryKey: ['analyticsSummary', cdk, year],
        queryFn: () => api.getAnalyticsSummary(cdk, year),
        enabled: !!cdk,
        staleTime: 1000 * 60 * 60,
    });
}

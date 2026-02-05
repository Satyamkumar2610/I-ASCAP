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
        queryFn: () => api.getAnalysis(params as unknown as Record<string, string | number>),
        enabled: !!params, // Only run if params are provided
        retry: 3, // Retry logic explicitly enabled
    });
}

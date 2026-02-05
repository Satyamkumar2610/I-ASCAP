
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import bridgeData from '../../data/map_bridge.json';

export interface DistrictMetric {
    cdk: string;
    state: string;
    district: string;
    value: number;
    metric: string;
    method: string;
}

export const useDistrictMetrics = (year: number, crop: string, metric: string) => {
    // React Query handles loading, data, and errors
    const { data: rawData = [], isLoading: loading } = useQuery({
        queryKey: ['districtMetrics', year, crop, metric],
        queryFn: () => api.getDistrictMetrics(year, crop, metric),
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });

    // Bridge is static
    const bridge = bridgeData as Record<string, string>;

    // 2. Join (Derived State)
    const joinedData = useMemo(() => {
        if (!rawData.length) return {};

        // Map CDK -> Metric
        const cdkToMetric: Record<string, DistrictMetric> = {};
        rawData.forEach((d: DistrictMetric) => cdkToMetric[d.cdk] = d);

        // Create Join Map: GeoKey -> Metric
        const join: Record<string, DistrictMetric> = {};

        Object.keys(bridge).forEach(geoKey => {
            const cdk = bridge[geoKey];
            if (cdkToMetric[cdk]) {
                join[geoKey] = cdkToMetric[cdk];
            }
        });

        return join;
    }, [rawData, bridge]);

    return { joinedData, loading, rawData };
};

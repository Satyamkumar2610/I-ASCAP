
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
    geo_key?: string; // Pre-computed from backend
}

// Build reverse bridge: CDK -> GeoKey
const bridge = bridgeData as Record<string, string>;
const reverseBridge: Record<string, string> = {};
Object.entries(bridge).forEach(([geoKey, cdk]) => {
    if (!reverseBridge[cdk]) {
        reverseBridge[cdk] = geoKey;
    }
});

/**
 * Normalize a name for fuzzy matching
 */
const normalizeName = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const useDistrictMetrics = (year: number, crop: string, metric: string) => {
    // React Query handles loading, data, and errors
    const { data: rawData = [], isLoading: loading } = useQuery({
        queryKey: ['districtMetrics', year, crop, metric],
        queryFn: () => api.getDistrictMetrics(year, crop, metric),
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });

    // Join with multiple fallback strategies
    const joinedData = useMemo(() => {
        if (!rawData.length) return {};

        const join: Record<string, DistrictMetric> = {};
        let unmappedCount = 0;

        rawData.forEach((d: DistrictMetric) => {
            // Priority 1: Use backend-provided geo_key (best - from MappingService)
            if (d.geo_key && d.geo_key in bridge) {
                join[d.geo_key] = d;
                return;
            }

            // Priority 2: Reverse bridge lookup (CDK -> GeoKey)
            if (reverseBridge[d.cdk]) {
                join[reverseBridge[d.cdk]] = d;
                return;
            }

            // Priority 3: Direct name construction
            const directKey = `${d.district}|${d.state}`;
            if (directKey in bridge) {
                join[directKey] = d;
                return;
            }

            // Priority 4: Fuzzy name matching (client-side fallback)
            const normDistrict = normalizeName(d.district);
            const normState = normalizeName(d.state);

            for (const geoKey of Object.keys(bridge)) {
                const [geoDistrict, geoState] = geoKey.split('|');
                const normGeoDistrict = normalizeName(geoDistrict);
                const normGeoState = normalizeName(geoState);

                // Check if normalized names match
                if (normDistrict === normGeoDistrict && normState === normGeoState) {
                    join[geoKey] = d;
                    return;
                }

                // Check if one contains the other (partial match)
                if (normGeoState.includes(normState) || normState.includes(normGeoState)) {
                    if (normGeoDistrict.includes(normDistrict) || normDistrict.includes(normGeoDistrict)) {
                        // Partial match found
                        join[geoKey] = d;
                        return;
                    }
                }
            }

            // No match found
            unmappedCount++;
        });

        if (unmappedCount > 0) {
            console.debug(`[useDistrictMetrics] ${unmappedCount} districts could not be mapped to GeoJSON`);
        }

        return join;
    }, [rawData]);

    return { joinedData, loading, rawData };
};

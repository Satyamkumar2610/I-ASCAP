
import { useState, useEffect } from 'react';
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
    const [data, setData] = useState<DistrictMetric[]>([]);
    // Bridge is now static import
    const bridge = bridgeData as Record<string, string>;

    const [loading, setLoading] = useState(true);
    const [joinedData, setJoinedData] = useState<Record<string, DistrictMetric>>({});

    // 1. Fetch Metrics (On Change)
    useEffect(() => {
        setLoading(true);
        fetch(`/api/v1/metrics?year=${year}&crop=${crop}&metric=${metric}`)
            .then(res => res.json())
            .then((json) => {
                if (Array.isArray(json)) {
                    setData(json);
                } else {
                    console.error("API returned error", json);
                    setData([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load metrics", err);
                setLoading(false);
            });
    }, [year, crop, metric]);

    // 2. Join
    useEffect(() => {
        if (!data.length) return;

        // Map CDK -> Metric
        const cdkToMetric: Record<string, DistrictMetric> = {};
        data.forEach(d => cdkToMetric[d.cdk] = d);

        // Create Join Map: GeoKey -> Metric
        const join: Record<string, DistrictMetric> = {};

        Object.keys(bridge).forEach(geoKey => {
            const cdk = bridge[geoKey];
            if (cdkToMetric[cdk]) {
                join[geoKey] = cdkToMetric[cdk];
            }
        });

        setJoinedData(join);
    }, [data]);

    return { joinedData, loading, rawData: data };
};

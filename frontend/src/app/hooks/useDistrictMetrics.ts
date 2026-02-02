
import React, { useState, useEffect } from 'react';
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


    // 1. Fetch Metrics (On Change)
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = `/api/metrics?year=${year}&crop=${crop}&metric=${metric}`;
                const res = await fetch(url);
                const json: DistrictMetric[] | { error: string } = await res.json();

                if (isMounted) {
                    if (Array.isArray(json)) {
                        setData(json);
                    } else {
                        console.error("API returned error", json);
                        setData([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to load metrics", err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [year, crop, metric]);

    // 2. Join (Derived State)
    const joinedData = React.useMemo(() => {
        if (!data.length) return {};

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

        return join;
    }, [data, bridge]);

    return { joinedData, loading, rawData: data };
};

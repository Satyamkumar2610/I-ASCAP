/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { fetchFromBackend, buildParams, BackendApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2020';
    const crop = searchParams.get('crop') || 'wheat';
    const metric = searchParams.get('metric') || 'yield';

    try {
        const params = buildParams({
            year,
            crop: crop.toLowerCase(),
            metric: metric.toLowerCase(),
        });

        const data = await fetchFromBackend<any[]>('/api/v1/metrics', params);

        // Transform to match expected frontend format
        return NextResponse.json(data.map(item => ({
            cdk: item.cdk,
            state: item.state,
            district: item.district,
            value: item.value,
            metric: metric.toLowerCase(),
            method: item.method || 'Raw',
        })));
    } catch (error) {
        console.error('Metrics API Error:', error);
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { error: error.message, detail: error.detail },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

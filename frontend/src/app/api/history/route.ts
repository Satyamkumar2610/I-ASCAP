/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { fetchFromBackend, buildParams, BackendApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const state = searchParams.get('state');
    const cdk = searchParams.get('cdk');
    const crop = searchParams.get('crop') || 'wheat';

    try {
        const params = buildParams({
            cdk: cdk || undefined,
            district: district || undefined,
            state: state || undefined,
            crop: crop.toLowerCase(),
        });

        const data = await fetchFromBackend<any[]>('/api/v1/metrics/history', params);

        return NextResponse.json(data);
    } catch (error) {
        console.error('History API Error:', error);
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { error: error.message, detail: error.detail },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { fetchFromBackend, buildParams, BackendApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
        return NextResponse.json({ error: 'State parameter required' }, { status: 400 });
    }

    try {
        const params = buildParams({ state });
        const data = await fetchFromBackend<any[]>('/api/v1/analysis/split-impact/districts', params);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Split Impact Districts API Error:', error);
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { error: error.message, detail: error.detail },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { fetchFromBackend, BackendApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await fetchFromBackend<any>('/api/v1/split-impact/summary', {});
        return NextResponse.json(data);
    } catch (error) {
        console.error('Split Impact Summary API Error:', error);
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { error: error.message, detail: error.detail },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Summary Failed' }, { status: 500 });
    }
}

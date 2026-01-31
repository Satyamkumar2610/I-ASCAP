import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://i-ascap.onrender.com'
    : 'http://127.0.0.1:8000';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    try {
        // Build query params
        const params = new URLSearchParams();
        if (state) params.append('state', state);

        const url = `${BACKEND_URL}/api/v1/climate/rainfall/all${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Rainfall API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rainfall data' },
            { status: 500 }
        );
    }
}

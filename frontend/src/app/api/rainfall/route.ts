import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://i-ascap.onrender.com';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');

    try {
        // If both state and district provided, get specific district
        if (state && district) {
            const params = new URLSearchParams({ state, district });
            const url = `${BACKEND_URL}/api/v1/climate/rainfall?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-API-Key': process.env.API_KEY || 'dev-secret-key-123'
                },
                next: { revalidate: 3600 },
            });

            if (!response.ok) {
                throw new Error(`Backend returned ${response.status}`);
            }

            const data = await response.json();
            return NextResponse.json(data);
        }

        // Otherwise, get all rainfall data (for map)
        const params = new URLSearchParams();
        if (state) params.append('state', state);

        const url = `${BACKEND_URL}/api/v1/climate/rainfall/all${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': process.env.API_KEY || 'dev-secret-key-123'
            },
            next: { revalidate: 3600 },
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

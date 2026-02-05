
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://i-ascap.onrender.com';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Proxy to backend /api/v1/simulation (now corrected)
    const url = `${BACKEND_URL}/api/v1/simulation${queryString ? '?' + queryString : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': process.env.API_KEY || 'dev-secret-key-123'
            },
            next: { revalidate: 3600 },
        } as RequestInit);

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(errorJson, { status: response.status });
            } catch {
                return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Simulation API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch simulation data' },
            { status: 500 }
        );
    }
}

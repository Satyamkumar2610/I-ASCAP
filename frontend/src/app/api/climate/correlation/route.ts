import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://i-ascap.onrender.com'
    : 'http://127.0.0.1:8000';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Pass through all query parameters
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/climate/correlation?${queryString}`;

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(errorJson, { status: response.status });
            } catch {
                return NextResponse.json(
                    { error: `Backend returned ${response.status}: ${errorText}` },
                    { status: response.status }
                );
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Correlation API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch correlation data' },
            { status: 500 }
        );
    }
}

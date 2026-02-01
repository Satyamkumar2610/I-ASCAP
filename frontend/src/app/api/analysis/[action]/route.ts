import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://i-ascap.onrender.com'
    : 'http://127.0.0.1:8000';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ action: string }> } // Params is a Promise in Next.js 15+
) {
    const { action } = await params;
    const { searchParams } = new URL(request.url);

    // Validate allowed actions
    const allowedActions = ['diversification', 'efficiency', 'risk-profile'];
    if (!allowedActions.includes(action)) {
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

    try {
        const url = `${BACKEND_URL}/api/v1/analysis/${action}?${searchParams.toString()}`;

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            // Forward backend error
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(errorJson, { status: response.status });
            } catch {
                return NextResponse.json({ error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Analysis API error (${action}):`, error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 }
        );
    }
}


import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://i-ascap.onrender.com';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
    const slugPath = slug.join('/');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Construct the backend URL
    // The backend route is /api/v1/analysis/split-impact/{path}
    // Our slug captures everything after /split-impact/
    const url = `${BACKEND_URL}/api/v1/analysis/split-impact/${slugPath}${queryString ? '?' + queryString : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': process.env.API_KEY || 'dev-secret-key-123'
            },
            next: { revalidate: 3600 },
        } as RequestInit);

        if (!response.ok) {
            console.error(`Backend error: ${response.status} for ${url}`);
            return NextResponse.json(
                { error: `Backend returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Split Impact API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 }
        );
    }
}

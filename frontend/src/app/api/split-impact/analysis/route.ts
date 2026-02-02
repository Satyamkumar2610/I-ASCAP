
import { NextResponse } from 'next/server';
import { fetchFromBackend, buildParams, BackendApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const parentCdk = searchParams.get('parent');
    const childCdksStr = searchParams.get('children');
    const splitYearStr = searchParams.get('splitYear');
    const crop = searchParams.get('crop') || 'wheat';
    const metric = searchParams.get('metric') || 'yield';
    const mode = searchParams.get('mode') || 'before_after';

    if (!parentCdk || !splitYearStr) {
        return NextResponse.json({ error: 'Missing required params' }, { status: 400 });
    }

    try {
        const params = buildParams({
            parent: parentCdk,
            children: childCdksStr || undefined,
            splitYear: splitYearStr,
            crop: crop.toLowerCase(),
            metric: metric.toLowerCase(),
            mode,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchFromBackend<any>('/api/v1/analysis/split-impact/analysis', params);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Split Impact Analysis API Error:', error);
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { error: error.message, detail: error.detail },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Analysis Failed' }, { status: 500 });
    }
}

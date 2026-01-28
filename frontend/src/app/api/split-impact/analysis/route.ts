
import { NextResponse } from 'next/server';
import { pool } from '../utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const parentCdk = searchParams.get('parent');
    const childCdksStr = searchParams.get('children');
    const splitYearStr = searchParams.get('splitYear');
    const crop = (searchParams.get('crop') || 'wheat').toLowerCase();
    const metric = (searchParams.get('metric') || 'yield').toLowerCase();

    if (!parentCdk || !childCdksStr || !splitYearStr) {
        return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const childCdks = childCdksStr.split(',');
    const splitYear = parseInt(splitYearStr);

    const client = await pool.connect();
    try {
        // Fetch Area, Production, Yield for all relevant districts
        const variables = [`${crop}_area`, `${crop}_production`, `${crop}_yield`];
        const allCdks = [parentCdk, ...childCdks];

        const query = `
            SELECT cdk, year, variable_name, value 
            FROM agri_metrics 
            WHERE cdk = ANY($1) 
              AND variable_name = ANY($2)
            ORDER BY year ASC
        `;

        const res = await client.query(query, [allCdks, variables]);

        // Pivot: Map<Year, Map<CDK, { area, prod, yield }>>
        const dataMap = new Map<number, Map<string, { area: number, prod: number, yld: number }>>();

        res.rows.forEach(r => {
            const y = r.year;
            const cdk = r.cdk;
            const val = parseFloat(r.value);

            if (!dataMap.has(y)) dataMap.set(y, new Map());
            const yrMap = dataMap.get(y)!;
            if (!yrMap.has(cdk)) yrMap.set(cdk, { area: 0, prod: 0, yld: 0 });

            const rec = yrMap.get(cdk)!;
            if (r.variable_name.endsWith('_area')) rec.area = val;
            else if (r.variable_name.endsWith('_production')) rec.prod = val;
            else if (r.variable_name.endsWith('_yield')) rec.yld = val;
        });

        const timeline: any[] = [];
        const years = Array.from(dataMap.keys()).sort((a, b) => a - b);

        years.forEach(y => {
            const yrMap = dataMap.get(y)!;
            let finalVal = 0;
            let type = 'unknown';

            // Phase 1: Pre-Split (Parent)
            // Even if we are post-split, we can show Parent data if it exists (ghost parent?)
            // Usually parent stops existing.
            // Split Impact logic: Before = Parent. After = Sum(Children).

            if (y < splitYear) {
                type = 'parent';
                const p = yrMap.get(parentCdk);
                if (p) {
                    if (metric === 'area') finalVal = p.area;
                    else if (metric === 'production') finalVal = p.prod;
                    else if (metric === 'yield') finalVal = p.yld;
                }
            } else {
                type = 'reconstructed';
                // Aggregate Children
                let sumArea = 0;
                let sumProd = 0;
                let weightedYieldSum = 0;
                let validChildren = 0;

                childCdks.forEach(c => {
                    const cData = yrMap.get(c);
                    if (cData && cData.area > 0) { // Only count if Area exists
                        sumArea += cData.area;
                        sumProd += cData.prod;
                        weightedYieldSum += (cData.yld * cData.area);
                        validChildren++;
                    }
                });

                if (sumArea > 0) {
                    if (metric === 'area') finalVal = sumArea;
                    else if (metric === 'production') finalVal = sumProd;
                    else if (metric === 'yield') finalVal = weightedYieldSum / sumArea;
                }
            }

            // Only add if we have a value
            if (finalVal > 0) {
                timeline.push({
                    year: y,
                    type: type,
                    value: finalVal,
                    // Pass raw components for tooltip debugging
                    raw: { metric, splitYear }
                });
            }
        });

        return NextResponse.json(timeline);

    } catch (e) {
        console.error("Analysis API Error", e);
        return NextResponse.json({ error: "Analysis Failed" }, { status: 500 });
    } finally {
        client.release();
    }
}

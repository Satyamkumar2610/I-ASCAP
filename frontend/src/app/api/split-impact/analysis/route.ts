
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
    const mode = searchParams.get('mode') || 'before_after';

    if (!parentCdk || !splitYearStr) {
        return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const splitYear = parseInt(splitYearStr);
    const childCdks = childCdksStr ? childCdksStr.split(',') : [];

    const client = await pool.connect();
    try {
        // Fetch Data
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

        // Helper to extract value
        const getValue = (yrMap: Map<string, any>, cdk: string) => {
            const d = yrMap.get(cdk);
            if (!d || d.area === 0) return null;
            if (metric === 'area') return d.area;
            if (metric === 'production') return d.prod;
            if (metric === 'yield') return d.yld;
            return null;
        };

        // Pivot Data
        const dataMap = new Map<number, Map<string, { area: number, prod: number, yld: number }>>();
        res.rows.forEach(r => {
            const y = r.year;
            if (!dataMap.has(y)) dataMap.set(y, new Map());
            const yrMap = dataMap.get(y)!;
            if (!yrMap.has(r.cdk)) yrMap.set(r.cdk, { area: 0, prod: 0, yld: 0 });
            const rec = yrMap.get(r.cdk)!;
            const val = parseFloat(r.value);
            if (r.variable_name.endsWith('_area')) rec.area = val;
            else if (r.variable_name.endsWith('_production')) rec.prod = val;
            else if (r.variable_name.endsWith('_yield')) rec.yld = val;
        });

        const timeline: any[] = [];
        const years = Array.from(dataMap.keys()).sort((a, b) => a - b);
        const seriesMeta: any[] = [];

        // Logic Branching
        if (mode === 'before_after') {
            seriesMeta.push({ id: 'value', label: 'Boundary Adjusted District', style: 'solid' });

            years.forEach(y => {
                const yrMap = dataMap.get(y)!;
                let val = null;

                if (y < splitYear) {
                    val = getValue(yrMap, parentCdk);
                } else {
                    // Reconstruct
                    let sumArea = 0, sumProd = 0, wYld = 0, cnt = 0;
                    childCdks.forEach(c => {
                        const d = yrMap.get(c);
                        if (d && d.area > 0) {
                            sumArea += d.area;
                            sumProd += d.prod;
                            wYld += (d.yld * d.area);
                            cnt++;
                        }
                    });
                    if (sumArea > 0) {
                        if (metric === 'area') val = sumArea;
                        else if (metric === 'production') val = sumProd;
                        else if (metric === 'yield') val = wYld / sumArea;
                    }
                }
                if (val !== null) timeline.push({ year: y, value: val });
            });

        } else if (mode === 'parent_child') {
            // Parent Series
            seriesMeta.push({ id: 'parent', label: `Parent (${parentCdk})`, style: 'solid' });
            // Children Series
            childCdks.forEach(c => {
                seriesMeta.push({ id: c, label: `Child (${c})`, style: 'dashed' });
            });

            years.forEach(y => {
                const yrMap = dataMap.get(y)!;
                const row: any = { year: y };

                // Parent Data - show for all years (parent existed before split)
                const pVal = getValue(yrMap, parentCdk);
                if (pVal !== null) row['parent'] = pVal;

                // Children Data - ONLY show for years >= splitYear
                // Children did not exist before the split, any pre-split data is invalid backcast
                if (y >= splitYear) {
                    childCdks.forEach(c => {
                        const cVal = getValue(yrMap, c);
                        if (cVal !== null) row[c] = cVal;
                    });
                }

                // Only push if at least one value
                if (Object.keys(row).length > 1) timeline.push(row);
            });
        }

        // Add 'compare_children' logic? For now 'parent_child' covers it.
        // User asked for "Parent vs Child" explicitly.

        // Advanced Analytics Calculation
        let advancedStats: any = null;

        if (mode === 'before_after' && timeline.length > 0) {
            const preData = timeline.filter(d => d.year < splitYear).map(d => d.value);
            const postData = timeline.filter(d => d.year >= splitYear).map(d => d.value);

            const calcStats = (arr: number[]) => {
                if (arr.length === 0) return { mean: 0, cv: 0, cagr: 0 };
                const n = arr.length;
                const mean = arr.reduce((a, b) => a + b, 0) / n;
                const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
                const stdDev = Math.sqrt(variance);
                const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

                // CAGR
                // We need the first and last year values, but 'arr' here is just values.
                // We should really strictly use the timeline objects for CAGR to be precise about 'years'.
                // Approximating with first/last index of the values array for now.
                const startVal = arr[0];
                const endVal = arr[n - 1];
                const years = n; // roughly
                const cagr = startVal > 0 && years > 1
                    ? (Math.pow(endVal / startVal, 1 / (years - 1)) - 1) * 100
                    : 0;

                return { mean, cv, cagr };
            };

            advancedStats = {
                pre: calcStats(preData),
                post: calcStats(postData),
                impact: {
                    // Simple difference in means
                    abs_change: (calcStats(postData).mean - calcStats(preData).mean),
                    pct_change: (calcStats(preData).mean > 0)
                        ? ((calcStats(postData).mean - calcStats(preData).mean) / calcStats(preData).mean) * 100
                        : 0
                }
            };
        }

        return NextResponse.json({
            data: timeline,
            series: seriesMeta,
            advancedStats,
            meta: {
                splitYear,
                mode,
                metric
            }
        });

    } catch (e) {
        console.error("API Error", e);
        return NextResponse.json({ error: "Analysis Failed" }, { status: 500 });
    } finally {
        client.release();
    }
}

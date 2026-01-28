
import { NextResponse } from 'next/server';
import { pool, getLineage } from '../utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
        return NextResponse.json({ error: "State parameter required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // 1. Build Metadata Map (CDK -> Name/State)
        // We fetch ALL districts to handle children lookups too.
        const res = await client.query("SELECT cdk, state_name, district_name FROM districts");
        const meta = new Map<string, { name: string, state: string }>();

        res.rows.forEach(r => {
            meta.set(r.cdk, { name: r.district_name, state: r.state_name });
        });

        // 2. Parse Lineage
        const events = getLineage();

        // 3. Filter & Group
        // Key: parent_cdk|event_year
        const groups = new Map<string, { parent: string, year: number, children: Set<string> }>();

        events.forEach(e => {
            // Check if parent belongs to requested State
            const pInfo = meta.get(e.parent_cdk);

            // Loose matching: If pInfo exists, check state.
            // If pInfo missing? (Maybe pre-1951 parent). We skip.
            if (pInfo && pInfo.state === state) {
                const key = `${e.parent_cdk}|${e.event_year}`;
                if (!groups.has(key)) {
                    groups.set(key, {
                        parent: e.parent_cdk,
                        year: e.event_year,
                        children: new Set()
                    });
                }
                groups.get(key)!.children.add(e.child_cdk);
            }
        });

        // 4. Transform to List
        const result = Array.from(groups.values()).map(g => {
            const pName = meta.get(g.parent)?.name || g.parent;
            const childrenList = Array.from(g.children);
            const cNames = childrenList.map(c => meta.get(c)?.name || c);

            return {
                id: `${g.parent}_${g.year}`,
                parentCdk: g.parent,
                parentName: pName,
                splitYear: g.year,
                childrenCdks: childrenList,
                childrenNames: cNames,
                // Placeholder: Real coverage check requires querying metrics table count
                coverage: 'High'
            };
        });

        // Sort: Most recent splits first
        result.sort((a, b) => b.splitYear - a.splitYear);

        return NextResponse.json(result);

    } catch (e) {
        console.error("Districts API Error", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    } finally {
        client.release();
    }
}

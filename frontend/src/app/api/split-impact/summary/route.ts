
import { NextResponse } from 'next/server';
import { pool, getLineage } from '../utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    const client = await pool.connect();
    try {
        // 1. Get States & CDKs from DB
        const res = await client.query("SELECT cdk, state_name, district_name FROM districts");
        const distMap = new Map<string, string>(); // cdk -> state
        const states = new Set<string>();

        res.rows.forEach(r => {
            distMap.set(r.cdk, r.state_name);
            if (r.state_name) states.add(r.state_name);
        });

        // 2. Process Lineage to find "Changed" districts
        const events = getLineage();
        const stateStats: Record<string, { changed: Set<string> }> = {};

        events.forEach(e => {
            const state = distMap.get(e.parent_cdk);
            if (state) {
                if (!stateStats[state]) stateStats[state] = { changed: new Set() };
                stateStats[state].changed.add(e.parent_cdk);
            }
        });

        // 3. Compile Statistics
        const finalStats: any = {};
        const stateCounts: Record<string, number> = {};

        // Count distinct CDKs per state (Current Snapshot count usually)
        // But districts table has ALL districts (historical too). 
        // We count unique CDKs as proxy for complexity.
        res.rows.forEach(r => {
            if (r.state_name) {
                stateCounts[r.state_name] = (stateCounts[r.state_name] || 0) + 1;
            }
        });

        const sortedStates = Array.from(states).sort();
        sortedStates.forEach(s => {
            finalStats[s] = {
                total: stateCounts[s] || 0,
                changed: stateStats[s]?.changed.size || 0,
                coverage: 100 // Placeholder, handled in detail view
            };
        });

        return NextResponse.json({
            states: sortedStates,
            stats: finalStats
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Summary Failed" }, { status: 500 });
    } finally {
        client.release();
    }
}

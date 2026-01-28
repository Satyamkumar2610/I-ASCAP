
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/i_ascap",
    connectionTimeoutMillis: 2000,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district'); // Name
    const state = searchParams.get('state');       // State Name
    const cdk = searchParams.get('cdk');           // Unique ID (Preferred)
    const crop = (searchParams.get('crop') || 'wheat').toLowerCase();

    const client = await pool.connect();
    try {
        let targetCdk = cdk;

        // 1. Resolve CDK if not provided
        if (!targetCdk && district) {
            // Try to find matching district
            // If state provided, strict match. Else loose.
            let q = "SELECT cdk FROM districts WHERE district_name ILIKE $1";
            let params = [district];
            if (state) {
                q += " AND state_name ILIKE $2";
                params.push(state);
            }
            q += " LIMIT 1";
            const res = await client.query(q, params);
            if (res.rows.length > 0) targetCdk = res.rows[0].cdk;
        }

        if (!targetCdk) {
            return NextResponse.json({ error: "District not found" }, { status: 404 });
        }

        // 2. Fetch Time Series
        // We want Area, Production, Yield for the specific crop
        const vars = [`${crop}_area`, `${crop}_production`, `${crop}_yield`];

        const dataQuery = `
            SELECT year, variable_name, value 
            FROM agri_metrics 
            WHERE cdk = $1 AND variable_name = ANY($2)
            ORDER BY year ASC
        `;

        const res = await client.query(dataQuery, [targetCdk, vars]);

        // 3. Pivot Data (Year -> { area, production, yield })
        const timeline: any = {};
        res.rows.forEach(row => {
            if (!timeline[row.year]) timeline[row.year] = { year: row.year };
            // variable_name is crop_metric. Extract metric.
            const parts = row.variable_name.split('_');
            const metric = parts[parts.length - 1]; // area, production, yield
            timeline[row.year][metric] = parseFloat(row.value);
        });

        return NextResponse.json(Object.values(timeline));

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    } finally {
        client.release();
    }
}

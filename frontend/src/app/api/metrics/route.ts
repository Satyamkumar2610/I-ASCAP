
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// DB Configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/i_ascap",
    connectionTimeoutMillis: 2000, // Fail fast if Docker is down (2s)
});

// CSV Cache
let cachedData: any[] | null = null;

// Helper: Fetch from DB
async function getDataFromDB(year: number, crop: string, metric: string) {
    const metricKey = `${crop}_${metric}`;
    const client = await pool.connect();
    try {
        const query = `
            SELECT m.cdk, d.state_name, d.district_name, m.value, m.source
            FROM agri_metrics m
            JOIN districts d ON m.cdk = d.cdk
            WHERE m.year = $1 AND m.variable_name = $2
        `;

        const res = await client.query(query, [year, metricKey]);

        return res.rows.map(row => ({
            cdk: row.cdk,
            state: row.state_name,
            district: row.district_name,
            value: parseFloat(row.value),
            metric: metric,
            method: row.source === 'V1.5_Harmonized' ? 'Backcast' : 'Raw'
        }));
    } finally {
        client.release();
    }
}

// Helper: Fetch from CSV (Fallback)
function getDataFromCSV(year: number, crop: string, metric: string) {
    if (!cachedData) {
        const csvPath = path.join(process.cwd(), 'public', 'data', 'dataset.csv');

        if (!fs.existsSync(csvPath)) {
            console.error("CSV File not found:", csvPath);
            return null;
        }

        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        cachedData = lines.slice(1).map(line => {
            if (!line.trim()) return null;
            const vals = line.split(',');
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = vals[i]);
            return obj;
        }).filter(x => x);

        console.log(`Loaded ${cachedData?.length} rows into cache from CSV.`);
    }

    const metricKey = `${crop}_${metric}`;

    if (cachedData && cachedData.length > 0 && !(metricKey in cachedData[0])) {
        return [];
    }

    return cachedData?.filter(row => parseInt(row.year) === year)
        .map(row => ({
            cdk: row.cdk,
            state: row.state_name,
            district: row.dist_name,
            value: parseFloat(row[metricKey] || '0'),
            metric: metric,
            method: row.harmonization_method
        })) || [];
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2001');
    // Normalize to lowercase to match DB keys (e.g. Maize -> maize)
    const crop = (searchParams.get('crop') || 'wheat').toLowerCase();
    const metric = (searchParams.get('metric') || 'yield').toLowerCase();

    try {
        // 1. Try Database
        try {
            const dbData = await getDataFromDB(year, crop, metric);
            if (dbData && dbData.length > 0) {
                return NextResponse.json(dbData);
            }
        } catch (dbError) {
            // Minimal warning for expected offline DB state
            console.warn("DB offline. Using CSV fallback.");
        }

        // 2. Fallback to CSV
        const csvData = getDataFromCSV(year, crop, metric);
        if (csvData) {
            return NextResponse.json(csvData);
        } else {
            return NextResponse.json({ error: "Data source unavailable" }, { status: 500 });
        }

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

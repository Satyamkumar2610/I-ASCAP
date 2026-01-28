
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/i_ascap",
    connectionTimeoutMillis: 2000,
});

export interface LineageEvent {
    parent_cdk: string;
    child_cdk: string;
    event_year: number;
    event_type: string;
    confidence: number;
    weight_type: string;
}

// Dev: process.cwd() is frontend/
// Prod: likely different, but this is a research dashboard.
// We try to locate data relative to root.
const DATA_DIR = path.resolve(process.cwd(), '../data/v1');

export function getLineage(): LineageEvent[] {
    try {
        const p = path.join(DATA_DIR, 'district_lineage.csv');
        if (!fs.existsSync(p)) {
            console.error("Lineage CSV missing at", p);
            return [];
        }
        const file = fs.readFileSync(p, 'utf-8');
        const lines = file.split('\n').filter(l => l.trim().length > 0);

        // Skip header
        return lines.slice(1).map(l => {
            const cols = l.split(',');
            // parent,child,year,type,conf,weight
            return {
                parent_cdk: cols[0],
                child_cdk: cols[1],
                event_year: parseInt(cols[2] || '0'),
                event_type: cols[3],
                confidence: parseFloat(cols[4] || '1.0'),
                weight_type: cols[5]?.trim() || 'none'
            };
        });
    } catch (e) {
        console.error("Lineage Load Error", e);
        return [];
    }
}

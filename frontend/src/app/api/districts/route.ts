
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // Basic filtering if search term exists (This is computationally expensive on large files, 
    // but works for this scale). Year filtering requires year-specific files.
    const search = searchParams.get('search');

    try {
        // Read the real GeoJSON file generated from Shapefile
        const geojsonPath = path.join(process.cwd(), 'public/data/districts.json');
        if (!fs.existsSync(geojsonPath)) {
            return NextResponse.json({ error: "GeoJSON file not found. Please ensure convert_data.py ran successfully." }, { status: 404 });
        }

        const fileContents = fs.readFileSync(geojsonPath, 'utf8');
        const geojson = JSON.parse(fileContents);

        if (search) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filteredFeatures = geojson.features.filter((f: any) => {
                // Check common name properties
                const name = f.properties.DISTRICT || f.properties.NAME || f.properties.district_name || "";
                return name.toLowerCase().includes(search.toLowerCase());
            });
            geojson.features = filteredFeatures;
        }

        return NextResponse.json(geojson);
    } catch (error) {
        console.error("Error reading GeoJSON:", error);
        return NextResponse.json({ error: "Failed to load district data" }, { status: 500 });
    }
}

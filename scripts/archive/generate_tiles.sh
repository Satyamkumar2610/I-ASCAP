#!/bin/bash
set -e

# Configuration
INPUT_FILE="data/raw/INDIA_DISTRICTS.geojson"
OUTPUT_DIR="frontend/public/data"
OUTPUT_FILE="$OUTPUT_DIR/districts.pmtiles"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "Generating PMTiles from $INPUT_FILE..."

# Tippecanoe Command
# -o: Output file
# -zg: Auto-detect max zoom
# --drop-densest-as-needed: Drop features if too many at low zooms
# --extend-zooms-if-still-dropping: Ensure visibility
# --force: Overwrite existing
# -l districts: Name of the layer within the tiles
tippecanoe -o "$OUTPUT_FILE" \
    --force \
    --layer=districts \
    --detect-shared-borders \
    --simplification=10 \
    -zg \
    --drop-densest-as-needed \
    "$INPUT_FILE"

echo "✅ Generated $OUTPUT_FILE"

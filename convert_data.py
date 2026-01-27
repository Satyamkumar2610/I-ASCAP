
import geopandas as gpd
import json
import os

# Define paths
INPUT_SHP = 'frontend/public/data/districts.shp'
OUTPUT_GEOJSON = 'frontend/public/data/districts.json'

def convert_shp_to_geojson():
    print(f"Reading shapefile from {INPUT_SHP}...")
    try:
        gdf = gpd.read_file(INPUT_SHP)
        
        # Ensure CRS is WGS84 for web mapping
        if gdf.crs != 'EPSG:4326':
            print("Reprojecting to EPSG:4326...")
            gdf = gdf.to_crs('EPSG:4326')
            
        print(f"Converting {len(gdf)} districts to GeoJSON...")
        
        # Save to GeoJSON
        gdf.to_file(OUTPUT_GEOJSON, driver='GeoJSON')
        
        print(f"Successfully saved to {OUTPUT_GEOJSON}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_shp_to_geojson()

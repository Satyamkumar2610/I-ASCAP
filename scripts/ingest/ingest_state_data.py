
import pandas as pd
import asyncio
import os
import sys

# Add project root and backend to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.database import get_pool
from app.repositories.metric_repo import MetricRepository

FILE_PATH = "data/raw/crop-area-and-production (1).xlsx"

# Map Excel column suffixes to metric types
METRIC_MAP = {
    "_TA": "area",
    "_TQ": "production",
    "_KA": "area", # Kharif Area? Usually treat as just area for specific crop
    "_KQ": "production",
    "_RA": "area", # Rabi Area?
    "_RQ": "production"
}

# Crop name normalization
CROP_MAP = {
    "RICE": "rice",
    "WHT": "wheat",
    "MAIZ": "maize",
    "SORG": "sorghum",
    "PMLT": "pearl_millet",
    "FMLT": "finger_millet",
    "BRLY": "barley",
    "CERL": "cereals",
    "CPEA": "chickpea",
    "PPEA": "pigeonpea",
    "MPUL": "minor_pulses",
    "PULS": "pulses",
    "GNUT": "groundnut",
    "SESA": "sesamum",
    "RM": "rapeseed_mustard",
    "SAFF": "safflower",
    "CAST": "castor",
    "LINS": "linseed",
    "SUNF": "sunflower",
    "SOYA": "soybean",
    "OILS": "oilseeds",
    "COTN": "cotton",
    "FRUT": "fruits",
    "VEGT": "vegetables",
    "SUGC": "sugarcane",
    "SGUR": "sugarcane" # typos in headers sometimes
}

async def ingest_state_data():
    print(f"Reading {FILE_PATH}...")
    # Skip first 4 rows of metadata
    df = pd.read_excel(FILE_PATH, header=4)
    
    # Filter rows where State is valid
    df = df[df['State'].notna()]
    
    pool = await get_pool()
    
    metrics_to_insert = []
    
    print("Processing rows...")
    for idx, row in df.iterrows():
        state_name = str(row['State']).strip()
        year = int(row['YEAR'])
        
        # Create a pseudo-CDK for the state
        # Format: S_<STATE_NAME_UPPER_NO_SPACE>
        cdk = f"S_{state_name.upper().replace(' ', '_').replace('&', 'AND')}"
        
        for col in df.columns:
            if col in ['St_code', 'State', 'YEAR']:
                continue
                
            # Parse column name (e.g., RICE_TA)
            parts = col.split('_')
            if len(parts) != 2:
                continue
                
            crop_code = parts[0]
            suffix = "_" + parts[1]
            
            if crop_code not in CROP_MAP:
                continue
                
            metric_type = METRIC_MAP.get(suffix)
            if not metric_type:
                continue
                
            crop_name = CROP_MAP[crop_code]
            variable_name = f"{crop_name}_{metric_type}"
            
            value = row[col]
            
            # Handle non-numeric or missing data
            if pd.isna(value) or value == -1:
                continue
                
            try:
                val_float = float(value)
                # Area is in '000 ha, Production in '000 tonnes. 
                # Our system expects Ha and Tonnes? 
                # The dashboard existing data for districts is usually in raw units (Ha, Tonnes).
                # Current header says "Units: Area in '000 ha".
                # Let's standardize to Base Units (Ha, Tonnes) by multiplying by 1000.
                val_float = val_float * 1000
                
                metrics_to_insert.append((
                    cdk,
                    year,
                    variable_name,
                    val_float,
                    "State_Census_Raw"
                ))
            except ValueError:
                continue

    print(f"Prepared {len(metrics_to_insert)} records.")
    
    chunk_size = 5000
    async with pool.acquire() as conn:
        # First, ensure these "State Districts" exist in the districts table?
        # Or does agri_metrics verify FK?
        # Usually metrics are linked to districts. We might need to insert dummy districts for states.
        
        # Let's check if we need to insert into 'districts' table first
        unique_states = set(r[0] for r in metrics_to_insert)
        print(f"Upserting {len(unique_states)} pseudo-districts for states...")
        
        for s_cdk in unique_states:
            state_real_name = s_cdk[2:].replace('_', ' ').title()
            # Ensure unique constraint exists for upsert
            await conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_agri_metrics_unique 
                ON agri_metrics (cdk, year, variable_name)
            """)

            # Try to insert if not exists
            await conn.execute("""
                INSERT INTO districts (cdk, state_name, district_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (cdk) DO NOTHING
            """, s_cdk, state_real_name, "Whole State")

        print("Inserting metrics...")
        for i in range(0, len(metrics_to_insert), chunk_size):
            chunk = metrics_to_insert[i:i+chunk_size]
            await conn.executemany("""
                INSERT INTO agri_metrics (cdk, year, variable_name, value, source)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (cdk, year, variable_name) 
                DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source
            """, chunk)
            print(f"Inserted chunk {i} to {i+len(chunk)}")
            
    print("Ingestion complete.")

if __name__ == "__main__":
    asyncio.run(ingest_state_data())

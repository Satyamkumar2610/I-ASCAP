#!/usr/bin/env python3
"""
Hybrid ETL: Combine ICRISAT (1966-1997) + DES (1998-2021) crop data.

This script loads:
- ICRISAT data for years 1966-1997 (historical coverage)
- DES data for years 1998-2021 (more crops, seasonal breakdown)

Both sources are loaded with a 'source' column for transparency.
"""

import os
import sys
import asyncio
import asyncpg
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "raw"

ICRISAT_FILE = DATA_DIR / "ICRISAT_correct.csv"
DES_FILE = DATA_DIR / "Sheet 1-crop-wise-area-production-yield (1).csv"

# Load environment
load_dotenv(PROJECT_ROOT / "backend" / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")


def generate_cdk(state: str, district: str, year: int) -> str:
    """Generate Canonical District Key."""
    state_code = state[:2].upper()
    dist_clean = ''.join(c for c in district.lower() if c.isalnum())[:6]
    return f"{state_code}_{dist_clean}_{year}"


def load_icrisat_1966_1997() -> pd.DataFrame:
    """Load ICRISAT data for years 1966-1997 only."""
    print("Loading ICRISAT data (1966-1997)...")
    
    # ICRISAT CSV has unnamed first column, year in column[1]
    df = pd.read_csv(ICRISAT_FILE)
    
    # Get column structure from existing ETL
    # Columns: [unnamed, year, state_code, state_name, district_name, ...]
    # Crop columns start at index 5
    
    # Rename first columns
    cols = list(df.columns)
    df.columns = ['idx', 'year', 'state_code', 'state_name', 'district_name'] + cols[5:]
    
    # Filter to 1966-1997
    df = df[(df['year'] >= 1966) & (df['year'] <= 1997)]
    print(f"  ICRISAT rows for 1966-1997: {len(df):,}")
    
    # Get crop columns (area, production, yield for each crop)
    crop_cols = cols[5:]
    
    # Define crop mappings (column groups of 3: area, production, yield)
    crops = [
        'rice', 'wheat', 'kharif_sorghum', 'rabi_sorghum', 'sorghum',
        'pearl_millet', 'maize', 'finger_millet', 'barley', 'chickpea',
        'pigeonpea', 'minor_pulses', 'groundnut', 'sesamum', 'rapeseed_and_mustard',
        'safflower', 'castor', 'linseed', 'sunflower', 'soyabean',
        'oilseeds', 'cotton', 'sugarcane', 'potatoes', 'onion',
        'fruits_area', 'vegetables_area', 'fruits_and_vegetables_area', 'fodder_area'
    ]
    
    # Melt into long format
    records = []
    for _, row in df.iterrows():
        year = int(row['year'])
        state = row['state_name']
        district = row['district_name']
        cdk = generate_cdk(state, district, 1951)  # Use base year for CDK
        
        col_idx = 5  # Start of crop data
        for crop in crops[:22]:  # Main crops with area/production/yield
            try:
                area = float(row.iloc[col_idx]) if pd.notna(row.iloc[col_idx]) and row.iloc[col_idx] != -1 else None
                prod = float(row.iloc[col_idx + 1]) if pd.notna(row.iloc[col_idx + 1]) and row.iloc[col_idx + 1] != -1 else None
                yld = float(row.iloc[col_idx + 2]) if pd.notna(row.iloc[col_idx + 2]) and row.iloc[col_idx + 2] != -1 else None
                
                if area is not None:
                    records.append({'cdk': cdk, 'year': year, 'variable_name': f'{crop}_area', 'value': area, 'source': 'ICRISAT'})
                if prod is not None:
                    records.append({'cdk': cdk, 'year': year, 'variable_name': f'{crop}_production', 'value': prod, 'source': 'ICRISAT'})
                if yld is not None:
                    records.append({'cdk': cdk, 'year': year, 'variable_name': f'{crop}_yield', 'value': yld, 'source': 'ICRISAT'})
                
                col_idx += 3
            except (IndexError, ValueError):
                col_idx += 3
                continue
    
    print(f"  Generated {len(records):,} ICRISAT metric records")
    return pd.DataFrame(records)


def load_des_1998_2021() -> pd.DataFrame:
    """Load DES data for years 1998-2021."""
    print("Loading DES data (1998-2021)...")
    
    df = pd.read_csv(DES_FILE)
    print(f"  Total DES rows: {len(df):,}")
    
    # Convert year format "1998-99" to integer 1998
    df['year_int'] = df['year'].str[:4].astype(int)
    
    # Normalize crop names to match ICRISAT format
    crop_mapping = {
        'Rice': 'rice',
        'Wheat': 'wheat',
        'Jowar': 'sorghum',
        'Bajra': 'pearl_millet',
        'Maize': 'maize',
        'Ragi': 'finger_millet',
        'Barley': 'barley',
        'Gram': 'chickpea',
        'Arhar/Tur': 'pigeonpea',
        'Groundnut': 'groundnut',
        'Sesamum': 'sesamum',
        'Rapeseed & Mustard': 'rapeseed_and_mustard',
        'Safflower': 'safflower',
        'Castor Seed': 'castor',
        'Linseed': 'linseed',
        'Sunflower': 'sunflower',
        'Soyabean': 'soyabean',
        'Cotton(Lint)': 'cotton',
        'Sugarcane': 'sugarcane',
        'Potato': 'potatoes',
        'Onion': 'onion',
        'Moong(Green Gram)': 'moong',
        'Urad': 'urad',
        'Masoor': 'masoor',
        'Other Kharif Pulses': 'other_kharif_pulses',
        'Other Rabi Pulses': 'other_rabi_pulses',
        'Niger Seed': 'niger_seed',
        'Tobacco': 'tobacco',
        'Dry Chillies': 'chillies',
        'Turmeric': 'turmeric',
        'Ginger': 'ginger',
        'Garlic': 'garlic',
        'Tapioca': 'tapioca',
        'Coriander': 'coriander',
        'Banana': 'banana',
        'Black Pepper': 'black_pepper',
        'Cardamom': 'cardamom',
        'Coconut': 'coconut',
        'Arecanut': 'arecanut',
        'Cashewnut': 'cashewnut',
        'Mesta': 'mesta',
        'Jute': 'jute',
        'Sweet Potato': 'sweet_potato',
        'Horse-Gram': 'horse_gram',
        'Small Millets': 'small_millets',
        'other oilseeds': 'other_oilseeds',
        'Peas & Beans': 'peas_beans',
        'Khesari': 'khesari',
        'Moth': 'moth',
        'Kulthi': 'kulthi',
        'Lentil': 'lentil',
        'Total Pulses': 'total_pulses',
        'Total Foodgrains': 'total_foodgrains',
    }
    
    # Apply mapping (case-insensitive)
    df['crop_normalized'] = df['crop_name'].str.strip().map(
        lambda x: crop_mapping.get(x, x.lower().replace(' ', '_').replace('(', '').replace(')', ''))
    )
    
    records = []
    for _, row in df.iterrows():
        year = row['year_int']
        state = row['state_name']
        district = row['district_name']
        crop = row['crop_normalized']
        season = row['season'].strip().lower()
        
        cdk = generate_cdk(state, district, 1951)
        
        # Add season suffix for non-annual data
        season_suffix = '' if season == 'whole year' else f'_{season}'
        
        # Area
        if pd.notna(row['area']) and row['area'] > 0:
            records.append({
                'cdk': cdk, 
                'year': year, 
                'variable_name': f'{crop}_area{season_suffix}', 
                'value': float(row['area']), 
                'source': 'DES'
            })
        
        # Production
        if pd.notna(row['production']) and row['production'] > 0:
            records.append({
                'cdk': cdk, 
                'year': year, 
                'variable_name': f'{crop}_production{season_suffix}', 
                'value': float(row['production']), 
                'source': 'DES'
            })
        
        # Yield (convert to kg/ha for consistency with ICRISAT)
        if pd.notna(row['yield']) and row['yield'] > 0:
            yield_kg_ha = float(row['yield']) * 1000  # tonnes/ha to kg/ha
            records.append({
                'cdk': cdk, 
                'year': year, 
                'variable_name': f'{crop}_yield{season_suffix}', 
                'value': yield_kg_ha, 
                'source': 'DES'
            })
    
    print(f"  Generated {len(records):,} DES metric records")
    return pd.DataFrame(records)


async def load_to_database(df: pd.DataFrame):
    """Load combined data to database."""
    print(f"\nLoading {len(df):,} records to database...")
    
    conn = await asyncpg.connect(DATABASE_URL, ssl='require')
    
    # Add source column if not exists
    await conn.execute("""
        ALTER TABLE agri_metrics ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'ICRISAT'
    """)
    
    # Clear existing data
    print("Clearing existing agri_metrics data...")
    await conn.execute("DELETE FROM agri_metrics")
    
    # Prepare data for batch insert
    values = [
        (row['cdk'], row['year'], row['variable_name'], row['value'], row['source'])
        for _, row in df.iterrows()
    ]
    
    # Batch insert
    batch_size = 10000
    inserted = 0
    for i in range(0, len(values), batch_size):
        batch = values[i:i + batch_size]
        await conn.executemany("""
            INSERT INTO agri_metrics (cdk, year, variable_name, value, source)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (cdk, year, variable_name) DO UPDATE SET
                value = EXCLUDED.value,
                source = EXCLUDED.source
        """, batch)
        inserted += len(batch)
        print(f"  Inserted {inserted:,}/{len(values):,} records...")
    
    # Verify
    count = await conn.fetchval("SELECT COUNT(*) FROM agri_metrics")
    icrisat_count = await conn.fetchval("SELECT COUNT(*) FROM agri_metrics WHERE source = 'ICRISAT'")
    des_count = await conn.fetchval("SELECT COUNT(*) FROM agri_metrics WHERE source = 'DES'")
    
    await conn.close()
    
    print(f"\n✅ Total records in database: {count:,}")
    print(f"   ICRISAT (1966-1997): {icrisat_count:,}")
    print(f"   DES (1998-2021): {des_count:,}")


async def main():
    print("=" * 60)
    print("HYBRID ETL: ICRISAT (1966-1997) + DES (1998-2021)")
    print("=" * 60)
    
    # Load both datasets
    icrisat_df = load_icrisat_1966_1997()
    des_df = load_des_1998_2021()
    
    # Combine
    combined = pd.concat([icrisat_df, des_df], ignore_index=True)
    print(f"\nCombined dataset: {len(combined):,} records")
    print(f"  Year range: {combined['year'].min()} - {combined['year'].max()}")
    print(f"  Variables: {combined['variable_name'].nunique()}")
    
    # Load to database
    await load_to_database(combined)
    
    print("\n" + "=" * 60)
    print("✅ HYBRID ETL COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

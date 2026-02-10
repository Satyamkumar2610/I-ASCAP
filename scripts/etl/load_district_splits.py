import os
import pandas as pd
import logging
from sqlalchemy import create_engine, text
from difflib import get_close_matches
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXCEL_PATH = os.path.join(BASE_DIR, 'data', 'District Splits and Carve outs-decadewise  1951-2024 (1).xlsx')
SQL_PATH = os.path.join(BASE_DIR, 'db_export', 'district_splits.sql')

# Load env
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))
DB_URL = os.getenv('DATABASE_URL')

if not DB_URL:
    logger.error("DATABASE_URL not found in backend/.env")
    exit(1)

def get_engine():
    return create_engine(DB_URL)

def load_excel():
    if not os.path.exists(EXCEL_PATH):
        logger.error(f"Excel file not found at {EXCEL_PATH}")
        return None
    
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name='Data')
        # Rename columns to match our convention
        df = df.rename(columns={
            'State/UT': 'state_name',
            'Decade': 'decade',
            'Year': 'split_year',
            'District-Before': 'parent_district',
            'District-After': 'child_district'
        })
        # Clean data
        df['state_name'] = df['state_name'].str.strip()
        df['parent_district'] = df['parent_district'].str.strip()
        df['child_district'] = df['child_district'].str.strip()
        
        # Drop duplicates that would violate unique constraint
        original_len = len(df)
        df = df.drop_duplicates(subset=['state_name', 'split_year', 'parent_district', 'child_district'])
        if len(df) < original_len:
            logger.info(f"Dropped {original_len - len(df)} duplicate rows")
            
        logger.info(f"Loaded {len(df)} rows from Excel")
        return df
    except Exception as e:
        logger.error(f"Error reading Excel: {e}")
        return None

def normalize_name(name):
    """Normalize for fuzzy matching: lowercase, remove space/punctuation, remove 'district'"""
    if not isinstance(name, str): return ""
    # Remove 'district' suffix if present
    name = name.lower().replace(" district", "").replace("district", "")
    return name.replace(" ", "").replace("-", "").replace(".", "")

def get_cdk_map(engine):
    """Get map of dataset name -> cdk from districts table"""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT cdk, district_name, state_name FROM districts"))
        districts = result.fetchall()
    
    # Create lookup dictionaries
    # (state, district_name) -> cdk
    lookup = {}
    
    for row in districts:
        cdk, d_name, s_name = row
        norm_d = normalize_name(d_name)
        norm_s = normalize_name(s_name)
        
        lookup[(norm_s, norm_d)] = cdk
    
    return lookup, districts

def find_cdk(name, state, lookup, all_districts_data):
    """Find CDK for a given district name and state using exact & fuzzy match"""
    norm_name = normalize_name(name)
    norm_state = normalize_name(state)
    
    # 1. Exact match (state + district)
    if (norm_state, norm_name) in lookup:
        return lookup[(norm_state, norm_name)]
    
    # 2. Fuzzy match within state
    # Get all district names for this state
    state_districts = [d for cdk, d, s in all_districts_data if normalize_name(s) == norm_state]
    
    # If no districts found for state, try soft matching state name too
    if not state_districts:
        all_states = set(s for c, d, s in all_districts_data)
        state_matches = get_close_matches(state, all_states, n=1, cutoff=0.8)
        if state_matches:
            matched_state = state_matches[0]
            norm_state = normalize_name(matched_state)
            state_districts = [d for cdk, d, s in all_districts_data if normalize_name(s) == norm_state]

    if not state_districts:
        return None
        
    # Relaxed fuzzy match (cutoff 0.6)
    matches = get_close_matches(name, state_districts, n=1, cutoff=0.6)
    if matches:
        match_name = matches[0]
        return lookup.get((norm_state, normalize_name(match_name)))
    
    return None

def main():
    logger.info("Starting District Splits ETL...")
    engine = get_engine()
    
    # 1. Create Table
    with open(SQL_PATH, 'r') as f:
        sql = f.read()
        with engine.begin() as conn:
            conn.execute(text(sql))
    logger.info("Ensured district_splits table exists.")
    
    # 2. Load Excel
    df = load_excel()
    if df is None: return

    # 3. Get existing CDKs map
    lookup, all_districts = get_cdk_map(engine)
    logger.info(f"Loaded {len(all_districts)} existing districts for matching.")
    
    # 4. Process and Insert
    records = []
    matches = 0
    
    for _, row in df.iterrows():
        parent_cdk = find_cdk(row['parent_district'], row['state_name'], lookup, all_districts)
        child_cdk = find_cdk(row['child_district'], row['state_name'], lookup, all_districts)
        
        if parent_cdk or child_cdk:
            matches += 1
            
        records.append({
            'state_name': row['state_name'],
            'decade': row['decade'],
            'split_year': row['split_year'],
            'parent_district': row['parent_district'],
            'child_district': row['child_district'],
            'parent_cdk': parent_cdk,
            'child_cdk': child_cdk,
            'source': 'excel_decadewise'
        })
        
    # Bulk insert
    if records:
        # Clear existing data to avoid duplicates if re-running
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE TABLE district_splits RESTART IDENTITY"))
        
        # Save to DB
        result_df = pd.DataFrame(records)
        result_df.to_sql('district_splits', engine, if_exists='append', index=False)
        logger.info(f"Inserted {len(records)} records into district_splits.")
        logger.info(f"Matched {matches} records to existing CDKs.")
    else:
        logger.warning("No records to insert.")

if __name__ == "__main__":
    main()

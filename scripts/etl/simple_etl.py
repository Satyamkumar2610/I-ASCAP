"""
Simple ETL: Raw Data → Neon Database
Loads districts, lineage events, and agricultural metrics.
"""

import pandas as pd
import numpy as np
import os
import logging
from difflib import get_close_matches
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Setup
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    raise ValueError("DATABASE_URL not set in backend/.env")

# File paths
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage_cleaned.csv')
ICRISAT_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'ICRISAT_correct.csv')


def simple_normalize(name):
    """Normalize district name for matching."""
    return "".join(c for c in str(name).lower().strip() if c.isalnum())[:6]


# State name mappings (ICRISAT → Master)
STATE_ALIASES = {
    'Orissa': 'Odisha',
    'Uttaranchal': 'Uttarakhand',
    'Pondicherry': 'Puducherry',
    'Chattisgarh': 'Chhattisgarh',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Delhi': 'NCT of Delhi',
}

# District name fixes (normalized ICRISAT → normalized Master)
NAME_FIXES = {
    '24parg': 'south2',
    'ysrkad': 'kadapa',
    'spsnel': 'sripot',
    'khandw': 'eastn',
    'beed': 'bhir',
    'mehsan': 'mahesa',
    'dholpu': 'dhaulp',
    'thriss': 'trichu',
    'phulba': 'kandha',
    'burdwa': 'barddh',
    'mungai': 'munger',
    'bhabhu': 'kaimur',
    'dahod': 'dohad',
    'shrimu': 'mukts',
    'karoli': 'karaul',
    'gbnaga': 'gautam',
    'jagity': 'jagtia',
}


def create_schema(engine):
    """Create database tables."""
    with engine.connect() as conn:
        # Drop existing tables
        conn.execute(text("DROP TABLE IF EXISTS agri_metrics CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS lineage_events CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS districts CASCADE"))
        conn.commit()
        
        # Create tables
        conn.execute(text("""
            CREATE TABLE districts (
                cdk TEXT PRIMARY KEY,
                state_name TEXT,
                district_name TEXT,
                creation_year INTEGER
            )
        """))
        
        conn.execute(text("""
            CREATE TABLE lineage_events (
                parent_cdk TEXT,
                child_cdk TEXT,
                event_year INTEGER,
                event_type TEXT,
                PRIMARY KEY (parent_cdk, child_cdk, event_year),
                FOREIGN KEY (parent_cdk) REFERENCES districts(cdk),
                FOREIGN KEY (child_cdk) REFERENCES districts(cdk)
            )
        """))
        
        conn.execute(text("""
            CREATE TABLE agri_metrics (
                id SERIAL PRIMARY KEY,
                cdk TEXT REFERENCES districts(cdk),
                year INTEGER,
                variable_name TEXT,
                value REAL
            )
        """))
        
        # Create indexes
        conn.execute(text("CREATE INDEX idx_metrics_cdk ON agri_metrics(cdk)"))
        conn.execute(text("CREATE INDEX idx_metrics_year ON agri_metrics(year)"))
        conn.execute(text("CREATE INDEX idx_metrics_var ON agri_metrics(variable_name)"))
        conn.execute(text("CREATE INDEX idx_metrics_cdk_year ON agri_metrics(cdk, year)"))
        conn.commit()
    
    logger.info("Schema created successfully")


def load_districts(engine):
    """Load districts from master file."""
    master = pd.read_csv(MASTER_PATH)
    
    # Select and clean columns
    districts = master[['cdk', 'state_name', 'district_name', 'creation_year']].copy()
    districts = districts.drop_duplicates(subset=['cdk'])
    districts['creation_year'] = districts['creation_year'].fillna(0).astype(int)
    
    districts.to_sql('districts', engine, if_exists='append', index=False, method='multi', chunksize=500)
    logger.info(f"Loaded {len(districts)} districts")
    return districts


def load_lineage(engine):
    """Load lineage events."""
    lineage = pd.read_csv(LINEAGE_PATH)
    
    # Only keep columns we need
    lineage = lineage[['parent_cdk', 'child_cdk', 'event_year', 'event_type']].copy()
    
    lineage.to_sql('lineage_events', engine, if_exists='append', index=False, method='multi', chunksize=500)
    logger.info(f"Loaded {len(lineage)} lineage events")


def load_metrics(engine, districts_df):
    """Load agricultural metrics from ICRISAT data."""
    icrisat = pd.read_csv(ICRISAT_PATH)
    logger.info(f"Loaded ICRISAT data: {len(icrisat)} rows")
    
    # Build lookup: (state, normalized_name) → cdk
    all_master_names = []
    cdk_lookup = {}
    for _, row in districts_df.iterrows():
        nm = simple_normalize(row['district_name'])
        cdk_lookup[(row['state_name'], nm)] = row['cdk']
        all_master_names.append(nm)
    
    # Map ICRISAT rows to CDKs
    def get_cdk(row):
        state = STATE_ALIASES.get(row['state_name'], row['state_name'])
        nm = simple_normalize(row['dist_name'])
        nm = NAME_FIXES.get(nm, nm)
        
        # Try exact match
        if (state, nm) in cdk_lookup:
            return cdk_lookup[(state, nm)]
        
        # Try matching just by name (find in any state)
        matches = [(s, n) for (s, n) in cdk_lookup.keys() if n == nm]
        if len(matches) == 1:
            return cdk_lookup[matches[0]]
        
        # Fuzzy match
        fuzzy = get_close_matches(nm, all_master_names, n=1, cutoff=0.7)
        if fuzzy:
            matches = [(s, n) for (s, n) in cdk_lookup.keys() if n == fuzzy[0]]
            if matches:
                return cdk_lookup[matches[0]]
        
        return None
    
    icrisat['cdk'] = icrisat.apply(get_cdk, axis=1)
    
    # Report mapping stats
    mapped = icrisat['cdk'].notna().sum()
    logger.info(f"Mapped {mapped}/{len(icrisat)} rows to CDKs")
    
    # Keep only mapped rows
    icrisat = icrisat[icrisat['cdk'].notna()]
    
    # Melt to long format
    id_cols = ['cdk', 'year']
    value_cols = [c for c in icrisat.columns if c not in ['dist_code', 'year', 'state_code', 'state_name', 'dist_name', 'cdk']]
    
    metrics = icrisat.melt(id_vars=id_cols, value_vars=value_cols, var_name='variable_name', value_name='value')
    
    # Clean: remove -1 (missing) and NaN
    metrics['value'] = metrics['value'].replace(-1, np.nan)
    metrics = metrics.dropna(subset=['value'])
    
    logger.info(f"Transformed to {len(metrics)} metric rows")
    
    # Insert in chunks
    metrics.to_sql('agri_metrics', engine, if_exists='append', index=False, method='multi', chunksize=5000)
    logger.info("Metrics loaded successfully")


def main():
    logger.info("Starting ETL...")
    engine = create_engine(DB_URL)
    
    # Step 1: Create schema
    create_schema(engine)
    
    # Step 2: Load districts
    districts_df = load_districts(engine)
    
    # Step 3: Load lineage
    load_lineage(engine)
    
    # Step 4: Load metrics
    load_metrics(engine, districts_df)
    
    logger.info("ETL complete!")


if __name__ == "__main__":
    main()

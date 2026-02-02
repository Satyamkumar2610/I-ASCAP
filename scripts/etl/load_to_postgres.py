
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os
import logging

# Config
# Config
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/i_ascap") # Fallback to local if not set, but prefers ENV
if not os.getenv("DATABASE_URL"):
    logger.warning("DATABASE_URL not set, using default local URL.")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ICRISAT_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'ICRISAT_correct.csv')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_schema(engine):
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS agri_metrics CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS districts CASCADE;"))
        conn.commit()

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS districts (
                cdk TEXT PRIMARY KEY,
                state_name TEXT,
                district_name TEXT,
                start_year INTEGER,
                end_year INTEGER
            );
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agri_metrics (
                id SERIAL PRIMARY KEY,
                cdk TEXT,
                year INTEGER,
                variable_name TEXT,
                value REAL,
                source TEXT DEFAULT 'ICRISAT',
                FOREIGN KEY (cdk) REFERENCES districts(cdk)
            );
        """))
        conn.commit()
    logger.info("Schema setup complete.")

def load_data():
    try:
        engine = create_engine(DB_URL)
        setup_schema(engine)
    except Exception as e:
        logger.error(f"Failed to connect to DB at {DB_URL}. Ensure Docker is running: `docker compose up -d db`")
        logger.error(e)
        return

    logger.info(f"Reading {ICRISAT_PATH}...")
    df = pd.read_csv(ICRISAT_PATH)
    
    # 1. Prepare Districts Table
    # ICRISAT doesn't have CDK/Start/End clearly, but we can synthesize unique districts.
    # Ideally, we load from 'data/v1/district_master.csv' if available?
    # Let's check if Master exists.
    MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
    if os.path.exists(MASTER_PATH):
        logger.info("Loading District Master...")
        master = pd.read_csv(MASTER_PATH)
        # Select cols
        dists = master[['cdk', 'state_name', 'district_name', 'start_year', 'end_year']].copy()
        # Drop duplicates
        dists = dists.drop_duplicates(subset=['cdk'])
        
        # Load to DB using URL string (safest for pandas/sqlalchemy compatibility)
        # Use append because we created the table in setup_schema
        dists.to_sql('districts', DB_URL, if_exists='append', index=False, method='multi', chunksize=1000)
            
        # PK is already set in CREATE TABLE
        # No need to alter again if we didn't drop it.
        
        logger.info(f"Loaded {len(dists)} districts.")

    # 2. Prepare Metrics
    PANEL_PATH = os.path.join(BASE_DIR, 'data', 'v1_5', 'district_year_panel_v1_5.csv')
    logger.info(f"Loading Harmonized Panel from {PANEL_PATH}...")
    panel = pd.read_csv(PANEL_PATH)
    
    value_vars = [c for c in panel.columns if c not in ['cdk', 'year', 'state_name', 'district_name', 'dist_name', 'harmonization_method']]
    
    long_df = panel.melt(id_vars=['cdk', 'year'], value_vars=value_vars, var_name='variable_name', value_name='value')
    
    long_df['value'] = long_df['value'].replace(-1, np.nan)
    long_df = long_df.dropna(subset=['value'])
    
    logger.info(f"Transformed to {len(long_df)} rows.")
    
    # Insert
    long_df['source'] = 'V1.5_Harmonized'
    
    long_df.to_sql('agri_metrics', DB_URL, if_exists='append', index=False, method='multi', chunksize=5000)
        
    logger.info("Metrics Loaded.")

if __name__ == "__main__":
    load_data()

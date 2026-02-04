
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import os

import logging
from dotenv import load_dotenv

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(BASE_DIR, 'backend', '.env')
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)
    logger.info(f"Loaded env from {ENV_PATH}")
else:
    logger.warning("No backend/.env file found.")

# Config
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/i_ascap")
if not os.getenv("DATABASE_URL"):
    logger.warning("DATABASE_URL not set, using default local URL.")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ICRISAT_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'ICRISAT_correct.csv')


def setup_schema(engine):
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS agri_metrics CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS lineage_events CASCADE;"))
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

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lineage_events (
                parent_cdk TEXT,
                child_cdk TEXT,
                event_year INTEGER,
                event_type TEXT,
                confidence_score REAL,
                weight_type TEXT,
                PRIMARY KEY (parent_cdk, child_cdk, event_year),
                FOREIGN KEY (parent_cdk) REFERENCES districts(cdk),
                FOREIGN KEY (child_cdk) REFERENCES districts(cdk)
            );
        """))
        conn.commit()
    logger.info("Schema setup complete.")


def load_data():
    try:
        engine = create_engine(DB_URL)
        setup_schema(engine)
    except Exception as e:
        logger.error(f"Failed to connect/setup DB: {e}")
        return

    # 1. Prepare Districts Table
    try:
        MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
        if os.path.exists(MASTER_PATH):
            logger.info("Loading District Master...")
            master = pd.read_csv(MASTER_PATH)
            dists = master[['cdk', 'state_name', 'district_name', 'start_year', 'end_year']].copy()
            dists = dists.drop_duplicates(subset=['cdk'])
            
            dists.to_sql('districts', DB_URL, if_exists='append', index=False, method='multi', chunksize=1000)
            logger.info(f"Loaded {len(dists)} districts.")
    except Exception as e:
        logger.error(f"Failed loading districts: {e}")
        return

    # 2. Prepare Lineage Table (NEW)
    try:
        LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage_cleaned.csv')
        if os.path.exists(LINEAGE_PATH):
            logger.info(f"Loading Lineage Events from {LINEAGE_PATH}...")
            lineage = pd.read_csv(LINEAGE_PATH)

            lineage.to_sql('lineage_events', DB_URL, if_exists='append', index=False, method='multi', chunksize=500)
            logger.info(f"Loaded {len(lineage)} lineage events.")
        else:
            logger.warning(f"Cleaned lineage file missing.")
    except Exception as e:
        logger.error(f"Failed loading lineage: {e}")
        # optional: return, or continue to metrics

    # 3. Prepare Metrics
    try:
        PANEL_PATH = os.path.join(BASE_DIR, 'data', 'v1_5', 'district_year_panel_v1_5.csv')
        logger.info(f"Loading Harmonized Panel from {PANEL_PATH}...")
        panel = pd.read_csv(PANEL_PATH)
        
        value_vars = [c for c in panel.columns if c not in ['cdk', 'year', 'state_name', 'district_name', 'dist_name', 'harmonization_method']]
        long_df = panel.melt(id_vars=['cdk', 'year'], value_vars=value_vars, var_name='variable_name', value_name='value')
        long_df['value'] = long_df['value'].replace(-1, np.nan)
        long_df = long_df.dropna(subset=['value'])
        
        logger.info(f"Transformed to {len(long_df)} rows.")
        long_df['source'] = 'V1.5_Harmonized'
        
        long_df.to_sql('agri_metrics', DB_URL, if_exists='append', index=False, method='multi', chunksize=5000)
        logger.info("Metrics Loaded.")
    except Exception as e:
        logger.error(f"Failed loading metrics: {e}")

if __name__ == "__main__":
    load_data()


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
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    logger.error("DATABASE_URL not set. Set it in backend/.env or as an environment variable.")
    raise EnvironmentError("DATABASE_URL is required. Example: postgresql://user:pass@host:5432/i_ascap")
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
                lgd_code INTEGER PRIMARY KEY,
                state_name TEXT,
                district_name TEXT,
                start_year INTEGER,
                end_year INTEGER
            );
        """))
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agri_metrics (
                id SERIAL PRIMARY KEY,
                district_lgd INTEGER,
                year INTEGER,
                variable_name TEXT,
                value REAL,
                source TEXT DEFAULT 'ICRISAT',
                FOREIGN KEY (district_lgd) REFERENCES districts(lgd_code)
            );
        """))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lineage_events (
                parent_lgd INTEGER,
                child_lgd INTEGER,
                event_year INTEGER,
                event_type TEXT,
                confidence_score REAL,
                weight_type TEXT,
                PRIMARY KEY (parent_lgd, child_lgd, event_year),
                FOREIGN KEY (parent_lgd) REFERENCES districts(lgd_code),
                FOREIGN KEY (child_lgd) REFERENCES districts(lgd_code)
            );
        """))
        
        # Create indexes for common query patterns
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_agri_metrics_district_lgd ON agri_metrics(district_lgd);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_agri_metrics_year ON agri_metrics(year);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_agri_metrics_variable ON agri_metrics(variable_name);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_agri_metrics_lgd_var ON agri_metrics(district_lgd, variable_name);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_lineage_parent ON lineage_events(parent_lgd);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_lineage_child ON lineage_events(child_lgd);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_name);"))
        
        conn.commit()
    logger.info("Schema setup complete with indexes.")


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
            # Make sure it aligns with 'lgd_code' expectation. If master has 'cdk', map it to 'lgd_code'
            if 'lgd_code' not in master.columns and 'cdk' in master.columns:
                master = master.rename(columns={'cdk': 'lgd_code'})
            
            dists = master[['lgd_code', 'state_name', 'district_name', 'start_year', 'end_year']].copy()
            dists = dists.drop_duplicates(subset=['lgd_code'])
            
            with engine.begin() as conn:
                dists.to_sql('districts', conn, if_exists='append', index=False, method='multi', chunksize=1000)
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
            if 'parent_cdk' in lineage.columns:
                lineage = lineage.rename(columns={'parent_cdk': 'parent_lgd', 'child_cdk': 'child_lgd'})

            with engine.begin() as conn:
                lineage.to_sql('lineage_events', conn, if_exists='append', index=False, method='multi', chunksize=500)
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
        
        if 'cdk' in panel.columns:
            panel = panel.rename(columns={'cdk': 'district_lgd'})
        
        value_vars = [c for c in panel.columns if c not in ['district_lgd', 'year', 'state_name', 'district_name', 'dist_name', 'harmonization_method']]
        long_df = panel.melt(id_vars=['district_lgd', 'year'], value_vars=value_vars, var_name='variable_name', value_name='value')
        long_df['value'] = long_df['value'].replace(-1, np.nan)
        long_df = long_df.dropna(subset=['value'])
        
        logger.info(f"Transformed to {len(long_df)} rows.")
        long_df['source'] = 'V1.5_Harmonized'
        
        with engine.begin() as conn:
            long_df.to_sql('agri_metrics', conn, if_exists='append', index=False, method='multi', chunksize=5000)
        logger.info("Metrics Loaded.")
    except Exception as e:
        logger.error(f"Failed loading metrics: {e}")

if __name__ == "__main__":
    load_data()

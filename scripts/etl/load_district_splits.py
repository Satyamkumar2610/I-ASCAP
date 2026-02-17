import os
import pandas as pd
import logging
from sqlalchemy import create_engine, text
from difflib import get_close_matches
from dotenv import load_dotenv
from name_resolver import NameResolver

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw', 'district split')
PROLIF_PATH = os.path.join(RAW_DIR, 'district_proliferation_1951_2024.xlsx')
NEW_DIST_PATH = os.path.join(RAW_DIR, 'New Districts Created between 1951-2024.xlsx')
NAME_CHANGES_PATH = os.path.join(RAW_DIR, 'Name Changes_Districts_Indian States_1951-2021.xlsx')
SQL_PATH = os.path.join(BASE_DIR, 'db_export', 'district_splits.sql')

# Load env
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))
DB_URL = os.getenv('DATABASE_URL')

if not DB_URL:
    logger.error("DATABASE_URL not found in backend/.env")
    exit(1)

def get_engine():
    return create_engine(DB_URL)

class DistrictSplitLoader:
    def __init__(self, engine):
        self.engine = engine
        self.resolver = NameResolver(NAME_CHANGES_PATH)
        self.split_years_map = self._load_split_years()

    def _load_split_years(self):
        """Load exact split years from 'New Districts' file."""
        if not os.path.exists(NEW_DIST_PATH):
            logger.warning("New Districts file not found, will default to decade end.")
            return {}
        
        try:
            df = pd.read_excel(NEW_DIST_PATH)
            # Map (State, New District) -> Year
            year_map = {}
            for _, row in df.iterrows():
                state = self.resolver._normalize(row['State/UT'])
                dist = self.resolver._normalize(row['New District'])
                year = row['Year']
                if pd.notna(year):
                    year_map[(state, dist)] = int(year)
            logger.info(f"Loaded {len(year_map)} exact split years.")
            return year_map
        except Exception as e:
            logger.error(f"Error loading split years: {e}")
            return {}

    def get_lgd_map(self):
        """Get map of dataset name -> lgd_code from districts table"""
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT lgd_code, district_name, state_name FROM districts"))
            districts = result.fetchall()
        
        lookup = {}
        processed_districts = [] 

        for row in districts:
            lgd, d_name, s_name = row
            norm_d = self.resolver._normalize(d_name)
            norm_s = self.resolver._normalize(s_name)
            
            resolved_d = self.resolver.resolve(d_name)
            
            lookup[(norm_s, norm_d)] = lgd
            if resolved_d != norm_d:
                lookup[(norm_s, resolved_d)] = lgd
            
            processed_districts.append((lgd, norm_d, norm_s, d_name, s_name))
        
        return lookup, processed_districts

    def find_lgd(self, name, state, lookup, all_districts_data):
        """Find LGD using resolver and fuzzy matching"""
        norm_name = self.resolver._normalize(name)
        norm_state = self.resolver._normalize(state)
        resolved_name = self.resolver.resolve(name)

        # 1. Exact match (state + district)
        if (norm_state, norm_name) in lookup:
            return lookup[(norm_state, norm_name)]
        if (norm_state, resolved_name) in lookup:
            return lookup[(norm_state, resolved_name)]
        
        # 2. Fuzzy match within state
        state_districts = [d for lgd, d, s, od, os in all_districts_data if s == norm_state]
        
        # If no districts found for state, try soft matching state name
        if not state_districts:
            all_states = set(s for lgd, d, s, od, os in all_districts_data)
            state_matches = get_close_matches(norm_state, all_states, n=1, cutoff=0.8)
            if state_matches:
                norm_state = state_matches[0]
                state_districts = [d for lgd, d, s, od, os in all_districts_data if s == norm_state]

        if not state_districts:
            # Fallback: Try global unique match if name is unique across India
            # This handles state reorganization (e.g. Ladakh out of J&K)
            matches_global = [lgd for lgd, d, s, od, os in all_districts_data if self.resolver._normalize(d) == norm_name]
            if len(matches_global) == 1:
                return matches_global[0]
            
            # Try resolved name globally
            matches_global_res = [lgd for lgd, d, s, od, os in all_districts_data if self.resolver._normalize(d) == resolved_name]
            if len(matches_global_res) == 1:
                return matches_global_res[0]
                
            return None
            
        matches = get_close_matches(norm_name, state_districts, n=1, cutoff=0.8)
        if matches:
            return lookup.get((norm_state, matches[0]))
            
        if resolved_name != norm_name:
            matches_res = get_close_matches(resolved_name, state_districts, n=1, cutoff=0.8)
            if matches_res:
                 return lookup.get((norm_state, matches_res[0]))

        return None

    def process_splits(self):
        if not os.path.exists(PROLIF_PATH):
            logger.error("Proliferation file not found.")
            return

        try:
            df = pd.read_excel(PROLIF_PATH)
        except Exception as e:
            logger.error(f"Error reading proliferation file: {e}")
            return

        lookup, all_districts = self.get_lgd_map()
        logger.info(f"Loaded {len(all_districts)} existing districts from DB.")

        records = []
        seen_splits = set()
        
        grouped = df.groupby(['filter_state', 'source_year', 'dest_year', 'source_district'])
        
        for (state, s_year, d_year, s_dist), group in grouped:
            dest_dists = group['dest_district'].unique()
            
            if len(dest_dists) > 1:
                for output_dist in dest_dists:
                    if output_dist == s_dist:
                         continue 
                    
                    norm_s = self.resolver._normalize(state)
                    norm_d = self.resolver._normalize(output_dist)
                    
                    year = self.split_years_map.get((norm_s, norm_d))
                    if not year:
                         year = d_year 
                    
                    parent_lgd = self.find_lgd(s_dist, state, lookup, all_districts)
                    child_lgd = self.find_lgd(output_dist, state, lookup, all_districts)
                    
                    key = (state, year, s_dist, output_dist)
                    if key in seen_splits: continue
                    seen_splits.add(key)
                    
                    records.append({
                        'state_name': state,
                        'decade': f"{s_year}-{d_year}",
                        'split_year': int(year),
                        'parent_district': s_dist,
                        'child_district': output_dist,
                        'parent_lgd': parent_lgd,
                        'child_lgd': child_lgd,
                        'source': 'prolif_v2'
                    })
            
        return records

    def run(self):
        logger.info("Starting District Splits ETL (Multi-Source)...")
        
        # 1. Ensure Table
        with open(SQL_PATH, 'r') as f:
            sql = f.read()
            with self.engine.begin() as conn:
                conn.execute(text(sql))
                
        # 2. Process
        records = self.process_splits()
        
        if not records:
            logger.warning("No records found.")
            return

        # 3. Save
        with self.engine.begin() as conn:
            conn.execute(text("TRUNCATE TABLE district_splits RESTART IDENTITY"))
        
        df_result = pd.DataFrame(records)
        df_result.to_sql('district_splits', self.engine, if_exists='append', index=False)
        
        logger.info(f"Inserted {len(records)} records.")
        matched = df_result['child_lgd'].notna().sum()
        logger.info(f"Resolved {matched}/{len(records)} child district LGDs.")

def main():
    engine = get_engine()
    loader = DistrictSplitLoader(engine)
    loader.run()

if __name__ == "__main__":
    main()

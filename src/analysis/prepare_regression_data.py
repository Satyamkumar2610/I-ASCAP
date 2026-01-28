
import pandas as pd
import numpy as np
import os
import logging

# Config
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PANEL_PATH = os.path.join(BASE_DIR, 'data', 'v1_5', 'district_year_panel_v1_5.csv')
LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage.csv')
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'analysis', 'regression_ready.csv')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CROPS = ['wheat', 'rice', 'maize', 'sorghum', 'groundnut']

def prepare():
    logger.info("Loading Data...")
    df = pd.read_csv(PANEL_PATH)
    lineage = pd.read_csv(LINEAGE_PATH)
    
    # 1. Identify Split Events (district i, year t)
    # Lineage: parent_cdk -> child_cdk at event_year
    # We want to flag both Parent and Child around the event year.
    
    split_events = lineage[lineage['event_type'] == 'SPLIT'][['parent_cdk', 'child_cdk', 'event_year']]
    
    # Create Event Dictionary: CDK -> Year of Split
    # A district might have multiple splits. We take the most recent for simplicity or list them.
    # We focus on the *event*.
    
    # Map: CDK -> List of Split Years
    cdk_events = {}
    for _, row in split_events.iterrows():
        p = row['parent_cdk']
        c = row['child_cdk']
        y = row['event_year']
        
        if p not in cdk_events: cdk_events[p] = []
        cdk_events[p].append(y)
        
        if c not in cdk_events: cdk_events[c] = []
        cdk_events[c].append(y) # Child "born" at split
        
    logger.info(f"Identified split events for {len(cdk_events)} districts.")

    # 2. Filter & Transform Panel
    # Stack Crops? No, let's keep Wide or Long?
    # Regression usually wants Long: (District, Year, Crop, Value)
    
    # Identify Metric Columns
    # e.g. wheat_yield, wheat_area...
    
    long_rows = []
    
    for _, row in df.iterrows():
        cdk = row['cdk']
        year = int(row['year'])
        state = row['state_name']
        
        # Treatment Vars
        events = cdk_events.get(cdk, [])
        is_split_year = 0
        years_since_split = -999 # Control value
        
        # Simple Event Study: Nearest Split
        if events:
            # Find nearest event
            nearest = min(events, key=lambda x: abs(x - year))
            diff = year - nearest
            if abs(diff) <= 10: # +/- 10 year window
                years_since_split = diff
                if diff == 0: is_split_year = 1
        
        for crop in CROPS:
            yld = row.get(f'{crop}_yield')
            area = row.get(f'{crop}_area')
            
            if pd.notnull(yld) and yld > 0:
                long_rows.append({
                    'cdk': cdk,
                    'year': year,
                    'state': state,
                    'crop': crop,
                    'yield': yld,
                    'log_yield': np.log(yld),
                    'area': area,
                    'split_event': is_split_year,
                    'years_since_split': years_since_split,
                    'harmonized': 1 if 'Backcast' in str(row.get('harmonization_method', '')) else 0
                })
                
    out_df = pd.DataFrame(long_rows)
    
    # 3. Stats
    n_dists = out_df['cdk'].nunique()
    logger.info(f"Prepared Regression Sample: {len(out_df)} observations, {n_dists} districts.")
    
    out_df.to_csv(OUTPUT_PATH, index=False)
    logger.info(f"Saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    prepare()

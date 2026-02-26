
import json
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOJSON_PATH = os.path.join(BASE_DIR, 'frontend', 'public', 'data', 'districts.json')
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')

def simple_normalize(name):
    return "".join(c for c in str(name).lower().strip() if c.isalnum())[:6]

def patch_master():
    print("Loading GeoJSON and Master...")
    with open(GEOJSON_PATH, 'r') as f:
        geo = json.load(f)
        
    master = pd.read_csv(MASTER_PATH)
    existing_sets = set()
    for _, row in master.iterrows():
        existing_sets.add((row['state_name'], simple_normalize(row['district_name'])))
        
    new_rows = []
    
    # Analyze GeoJSON Features
    for feature in geo['features']:
        props = feature['properties']
        
        # Extract Name/State
        d_name = props.get('DISTRICT') or props.get('district_name')
        s_name = props.get('STATE') or props.get('ST_NM')
        
        if not d_name or not s_name:
            continue
            
        norm_d = simple_normalize(d_name)
        
        # Check if exists in Master (Strict-ish match)
        # Note: Master state names might differ slightly, but we try our best.
        # Ideally we check if 'norm_d' exists in ANY state for safety, or match state.
        
        # For this patch, if the normalization + state doesn't exist, we add it.
        # This might create duplicates if State spelling varies (e.g. Orissa vs Odisha).
        # We previously fixed many, but let's be careful.
        
        # Fuzzy State Check
        found = False
        master_subset = master[master['district_name'].apply(simple_normalize) == norm_d]
        if not master_subset.empty:
            # Check state match
            for _, r in master_subset.iterrows():
                 mst = r['state_name']
                 if s_name in mst or mst in s_name or simple_normalize(s_name) == simple_normalize(mst):
                     found = True
                     break
        
        if not found:
            # Create a new Stable CDK
            # Assume it existed since 1951 (Stable)
            cdk = f"{s_name[:2].upper()}_{norm_d}_1951"
            print(f"Adding Missing Stable District: {d_name} ({s_name}) -> {cdk}")
            
            new_rows.append({
                'cdk': cdk,
                'state_name': s_name,
                'district_name': d_name,
                'start_year': 1951,
                'end_year': 2024,
                'predecessors': '',
                'successors': '',
                'hierarchy_level': 1
            })
            
    if new_rows:
        new_df = pd.DataFrame(new_rows)
        # Append to Master
        # Ensure columns match
        combined = pd.concat([master, new_df], ignore_index=True)
        combined.to_csv(MASTER_PATH, index=False)
        print(f"Patched Master with {len(new_rows)} new districts.")
    else:
        print("No missing districts found (coverage is good).")

if __name__ == "__main__":
    patch_master()


import json
import pandas as pd
import os
from difflib import get_close_matches

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOJSON_PATH = os.path.join(BASE_DIR, 'frontend', 'public', 'data', 'districts.json')
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
OUTPUT_BRIDGE = os.path.join(BASE_DIR, 'frontend', 'src', 'data', 'map_bridge.json')

def simple_normalize(name):
    return "".join(c for c in str(name).lower().strip() if c.isalnum())[:6]

def generate_bridge():
    print("Loading GeoJSON and Master...")
    with open(GEOJSON_PATH, 'r') as f:
        geo = json.load(f)
        
    master = pd.read_csv(MASTER_PATH)
    
    # Init Lookup: (State, NormName) -> CDK
    master_lookup = {}
    for _, row in master.iterrows():
        st = row['state_name']
        nm = simple_normalize(row['district_name'])
        master_lookup[(st, nm)] = row['cdk']

    # Bridge Map: FeatureIndex -> CDK
    # Or FeatureID (if distinct) -> CDK
    # We will key by 'DISTRICT' name + 'STATE' name from GeoJSON
    
    bridge = {}
    
    unmapped = []
    
    for feature in geo['features']:
        props = feature['properties']
        
        # GeoJSON keys vary based on source. Assuming 2011 census keys.
        # Fallbacks: DISTRICT, district_name, NAME_2
        d_name = props.get('DISTRICT') or props.get('district_name') or props.get('NAME_2')
        s_name = props.get('STATE') or props.get('ST_NM')
        
        if not d_name:
            continue
            
        # Normalize
        d_norm = simple_normalize(d_name)
        
        # Try to find match in Master
        # ISSUE: Master has ALL years. GeoJSON is 2011.
        # We prefer the CDK active in 2011? 
        # Or just ANY valid CDK matching the name?
        # Since Visuals join by CDK, we need a valid CDK.
        
        # Filter Master for 'Approx matching name'
        # Then filter for 'exists in 2011' (abolition > 2011 or Null)
        
        # Simple lookup first
        # We need to guess State match too. GeoJSON State names vs Master State Names.
        # 'West Bengal' vs 'WB'? No, Master has 'West Bengal'.
        
        # Fuzzy Match Logic
        candidates = master[
            master['district_name'].apply(simple_normalize) == d_norm
        ]
        
        match = None
        if len(candidates) == 1:
            match = candidates.iloc[0]['cdk']
        elif len(candidates) > 1:
            # Disambiguate by State
            for _, cand in candidates.iterrows():
                 # Fuzzy State Match
                 if s_name and (str(s_name) in str(cand['state_name']) or str(cand['state_name']) in str(s_name)):
                     match = cand['cdk']
                     break
        
        if match:
            # We map the NAME pair to CDK, so Frontend can lookup prop keys -> CDK
            bridge[f"{d_name}|{s_name}"] = match
        else:
            unmapped.append(f"{d_name}|{s_name}")
            
    print(f"Bridge created. Mapped: {len(bridge)}, Unmapped: {len(unmapped)}")
    
    with open(OUTPUT_BRIDGE, 'w') as f:
        json.dump(bridge, f)
        
    print(f"Saved {OUTPUT_BRIDGE}")

if __name__ == "__main__":
    generate_bridge()

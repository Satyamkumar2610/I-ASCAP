import json
import os

BRIDGE_PATH = "/Users/satyamkumar/Desktop/DistrictEvolution/frontend/src/data/map_bridge.json"

# Same mapping as DB fix
UPDATES = {
    'RJ_': 'RA_',
    'PB_': 'PU_',
    'GJ_': 'GU_',
    'HR_': 'HA_',
    'HP_': 'HI_',
    'WB_': 'WE_',
    'UP_': 'UT_',
    'UK_': 'UT_',  # Uttarakhand mapped to UT in DB
    'CG_': 'CH_',
    'TG_': 'TE_',
    'TN_': 'TA_',
    'BR_': 'BI_',
    'MZ_': 'MI_',
    'MH_': 'MA_'   # Warning: Only for Madhya Pradesh districts!
}

def fix_bridge():
    print(f"Loading {BRIDGE_PATH}...")
    with open(BRIDGE_PATH, 'r') as f:
        data = json.load(f)
        
    print(f"Total entries: {len(data)}")
    
    updated_count = 0
    
    new_data = {}
    
    for geo_key, cdk in data.items():
        new_cdk = cdk
        
        # Helper to check if this is an MP district (state name in key is usually "District|State")
        is_mp = "|Madhya Pradesh" in geo_key
        
        updated = False
        
        # MP Special Case: MH_ -> MA_
        if is_mp and cdk.startswith('MH_'):
            new_cdk = 'MA_' + cdk[3:]
            updated = True
            
        # Standard updates
        else:
            for old, new in UPDATES.items():
                if old == 'MH_': continue # handled above specifically for MP
                
                if cdk.startswith(old):
                    new_cdk = new + cdk[len(old):]
                    updated = True
                    break
        
        if updated:
            updated_count += 1
            # print(f"  {cdk} -> {new_cdk}")
            
        new_data[geo_key] = new_cdk
        
    print(f"Updated {updated_count} entries.")
    
    # Backup
    os.rename(BRIDGE_PATH, BRIDGE_PATH + ".bak")
    
    with open(BRIDGE_PATH, 'w') as f:
        json.dump(new_data, f, indent=4) # Indent for readability? Original was minified-ish.
        # Actually, let's keep it compact if original was compact?
        # Original file view showed one line.
        # But for diffs, formatted is better. Let's use indent=2
        
    print("Saved updated bridge file.")

if __name__ == "__main__":
    fix_bridge()

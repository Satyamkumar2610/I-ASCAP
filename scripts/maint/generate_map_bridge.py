import asyncio
import os
import json
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def normalize(s):
    if not s: return ""
    return s.lower().replace(" ", "").replace("&", "and").replace("district", "")

async def run_mapping():
    # 1. Fetch Available CDKs from DB
    print("Fetching available CDKs from Database...")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics")
        available_cdks = sorted([r['cdk'] for r in rows])
        print(f"Loaded {len(available_cdks)} available CDKs from Database.")
    finally:
        await conn.close()

    # 2. Load GeoJSON
    with open("frontend/public/data/districts.json", "r") as f:
        geojson = json.load(f)
        
    features = geojson['features']
    print(f"Loaded {len(features)} features from GeoJSON.")
    
    bridge = {}
    unmapped_features = []
    
    # Manual Overrides for fuzzy/renamed districts
    manual_overrides = {
        "Ahmadnagar": "ahmedn",
        "Barddhaman": "barddh",
        "Chittaurgarh": "chitto", 
        "Dhaulpur": "dhaulp",
        "Firozpur": "ferozep",
        "Hardwar": "hardwa",
        "Hugli": "hooghly",
        "Jaintia Hills": "jainti",
        "Kancheepuram": "kanche",
        "Koch Bihar": "coocb",
        "Kodarma": "kodarm",
        "Mahbubnagar": "mahboo",
        "Narsimhapur": "narsin",
        "Punch": "poonch",
        "Purba Champaran": "eastch",
        "Purbi Singhbhum": "easts",
        "Sahibganj": "saheb",
        "The Dangs": "dangs",
        "Thoothukkudi": "tutico",
        "Viluppuram": "villup",
        "Virudunagar": "virudh", 
        "East Nimar": "khandw",
        "West Nimar": "khargo",
        "Y.s.r.": "cuddap",
        "Uttar Bastar Kanker": "kanker",
        "Kabeerdham": "kaward",
        "Jyotiba Phule Nagar": "amroha",
        "Kansiram Nagar": "kasgan",
        "Mahamaya Nagar": "hathra",
        "Sahibzada Ajit Singh Nagar": "mohali",
        "Subarnapur": "sonepu",
        "Buldana": "buldan",
        "Bauda": "baudh",
        "Debagarh": "deogarh",
        "Jagatsinghapur": "jagats",
        "Jajapur": "jajpur",
        "Khandwa (East Nimar)": "khandw",
        "Khargone (West Nimar)": "khargo",
        "Muktsar": "srimuk",  # Sri Muktsar Sahib
        "Sant Ravidas Nagar": "bhadoh", # Bhadohi
        "Sonbhadra": "soneph", # ? Sonebhadra
        "Mewat": "nuh",
        "Panch Mahals": "panchm",
        "Sabar Kantha": "sabark",
        "Banas Kantha": "banask",
        "The Nilgiris": "nilgir",
        "Tirunelveli": "tirune",
        "North 24 Parganas": "north2",
        "South 24 Parganas": "south2",
        "Dakshin Dinajpur": "dakshi",
        "Uttar Dinajpur": "uttard",
        "Pashchim Champaran": "westch",
        "Kaimur (bhabua)": "bhabua",
        "Lakhimpur": "lakhim",
        "Leh (ladakh)": "lehlad",
        "Latur": "latur" # ensure Latur specific matches MA_latur explicitly if needed?
    }

    # State Prefix Map (Updated for accuracy)
    state_prefixes = {
        'Rajasthan': 'RA', 'Punjab': 'PU', 'Uttar Pradesh': 'UT', 'Gujarat': 'GU',
        'Haryana': 'HA', 'Himachal Pradesh': 'HI', 'West Bengal': 'WE', 
        'Madhya Pradesh': 'MA', 'Maharashtra': 'MA', 'Andhra Pradesh': 'AP', # MA for MH now
        'Karnataka': 'KA', 'Tamil Nadu': 'TA', 'Kerala': 'KL', 'Bihar': 'BI',
        'Odisha': 'OD', 'Assam': 'AS', 'Chhattisgarh': 'CH', 'Jharkhand': 'JH',
        'Uttarakhand': 'UT', 'Telangana': 'TE', 'Tripura': 'TR', 'Meghalaya': 'ML',
        'Manipur': 'MN', 'Nagaland': 'NL', 'Arunachal Pradesh': 'AR', 'Mizoram': 'MI',
        'Sikkim': 'SK', 'Goa': 'GA'
    }

    for feature in features:
        props = feature['properties']
        # Prioritize 'dtname', then 'district', then 'DISTRICT'
        # Prioritize 'stname', then 'state', then 'STATE', then 'ST_NM'
        dist_name = props.get('dtname') or props.get('district') or props.get('DISTRICT')
        state_name = props.get('stname') or props.get('state') or props.get('STATE') or props.get('ST_NM')
        
        if not dist_name:
            continue
            
        # Key used in frontend - IMPORTANT: Ensure this matches MapInterface logic!
        # MapInterface uses '|' separator.
        # If state_name is None, use "None" string? Or empty?
        # MapInterface logic: coalesce(STATE, ST_NM).
        # We need to make sure we use the same fallback.
        # Check GeoJSON props usage.
        
        safe_state = state_name if state_name else "None"
        geo_key = f"{dist_name}|{safe_state}"
        
        match = None
        
        # Strategy 0: Manual Override
        if dist_name in manual_overrides:
            override_term = manual_overrides[dist_name]
            # Search available CDKs for this term
            # Iterate all CDKs to find best match
            for cdk in available_cdks:
                if override_term in cdk.lower():
                    # For manual overrides, we might need to filter by state if ambiguous
                    # But usually override term is specific enough
                    match = cdk
                    break
        
        if match:
            bridge[geo_key] = match
            continue

        target_prefix = state_prefixes.get(state_name)
        
        candidates = []
        norm_dist = normalize(dist_name)
        
        # Pass 1: Strict Prefix Match
        for cdk in available_cdks:
            parts = cdk.split('_')
            cdk_prefix = parts[0]
            cdk_name = parts[1]
            
            if target_prefix and cdk_prefix != target_prefix:
                continue
                
            norm_cdk = normalize(cdk_name)
            
            if norm_cdk == norm_dist:
                match = cdk
                break
            
            if norm_dist.startswith(norm_cdk) or norm_cdk.startswith(norm_dist):
                candidates.append(cdk)
        
        # Pass 2: Loose Match (Ignore Prefix if Pass 1 failed)
        if not match and not candidates:
            for cdk in available_cdks:
                parts = cdk.split('_')
                cdk_name = parts[1]
                norm_cdk = normalize(cdk_name)
                
                if norm_cdk == norm_dist:
                    match = cdk
                    break # Found exact name match in another state (likely split state)
                    
                if norm_dist.startswith(norm_cdk) or norm_cdk.startswith(norm_dist):
                    candidates.append(cdk)

        if not match and candidates:
            # Pick first
            match = candidates[0]
            
        if match:
            bridge[geo_key] = match
        else:
            unmapped_features.append(geo_key)
            
    print(f"Mapped {len(bridge)} features.")
    print(f"Unmapped: {len(unmapped_features)}")
    
    with open("frontend/src/data/map_bridge_FIXED.json", "w") as f:
        json.dump(bridge, f, indent=4)

if __name__ == "__main__":
    asyncio.run(run_mapping())

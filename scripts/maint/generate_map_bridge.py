import json
import difflib

def normalize(s):
    return s.lower().replace(" ", "").replace("&", "and").replace("district", "")

def run_mapping():
    # Load available data
    with open("available_cdks.json", "r") as f:
        available_cdks = json.load(f)
        
    print(f"Loaded {len(available_cdks)} available CDKs from Database.")
    
    # Load GeoJSON
    with open("frontend/public/data/districts.json", "r") as f:
        geojson = json.load(f)
        
    features = geojson['features']
    print(f"Loaded {len(features)} features from GeoJSON.")
    
    # Build Lookup Maps for Available Data
    # 1. Exact CDK
    cdk_lookup = {cdk: cdk for cdk in available_cdks}
    
    # 2. Normalized Name + State (e.g. "kanpur|uttarpradesh" -> [UT_kanpur_1951])
    name_state_lookup = {}
    for cdk in available_cdks:
        # CDK Format: PREFIX_NAME_YEAR (e.g. RA_jaipur_1951)
        parts = cdk.split('_')
        if len(parts) >= 2:
            prefix = parts[0]
            name = parts[1]
            # We don't have full state name in CDK, only prefix.
            # But we can try to guess or just map name->cdk list
            if name not in name_state_lookup:
                name_state_lookup[name] = []
            name_state_lookup[name].append(cdk)
            
    # Start Matching
    bridge = {}
    unmapped_features = []
    
    # Manual Overrides for fuzzy/renamed districts
    # Format: "GeoJSON Name": "CDK Search Term" (or part of it)
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
        "Lakhimpur": "lakhim", # Assam vs Kheri?
        "Leh (ladakh)": "lehlad" 
    }

    for feature in features:
        props = feature['properties']
        dist_name = props.get('dtname') or props.get('district') or props.get('DISTRICT')
        state_name = props.get('stname') or props.get('state') or props.get('STATE')
        
        if not dist_name:
            print(f"Skipping feature with no name: {props}")
            continue
            
        # Key used in frontend
        geo_key = f"{dist_name}|{state_name}"
        
        match = None
        
        # Strategy 0: Manual Override
        if dist_name in manual_overrides:
            override_term = manual_overrides[dist_name]
            # Search available CDKs for this term
            for cdk in available_cdks:
                if override_term in cdk.lower():
                    # Optional: Check state match if needed, but override usually implies specific
                    match = cdk
                    break
        
        if match:
            bridge[geo_key] = match
            continue

        # Strategy 1: Fuzzy Name Match in Data
        # We need to recognize that "Jaipur" in GeoJSON matches "RA_jaipur_1951" in DB.
        # We need a state map to filter by prefix?
        # State Prefixes (from our fix)
        state_prefixes = {
            'Rajasthan': 'RA', 'Punjab': 'PU', 'Uttar Pradesh': 'UT', 'Gujarat': 'GU',
            'Haryana': 'HA', 'Himachal Pradesh': 'HI', 'West Bengal': 'WE', 
            'Madhya Pradesh': 'MA', 'Maharashtra': 'MH', 'Andhra Pradesh': 'AP',
            'Karnataka': 'KA', 'Tamil Nadu': 'TA', 'Kerala': 'KL', 'Bihar': 'BI',
            'Odisha': 'OD', 'Assam': 'AS', 'Chhattisgarh': 'CH', 'Jharkhand': 'JH',
            'Uttarakhand': 'UT', 'Telangana': 'TE', 'Tripura': 'TR', 'Meghalaya': 'ML',
            'Manipur': 'MN', 'Nagaland': 'NL', 'Arunachal Pradesh': 'AR', 'Mizoram': 'MI',
            'Sikkim': 'SK', 'Goa': 'GA'
        }
        
        target_prefix = state_prefixes.get(state_name)
        
        candidates = []
        
        # normalized dist name
        norm_dist = normalize(dist_name)
        
        # Search all CDKs
        for cdk in available_cdks:
            parts = cdk.split('_')
            cdk_prefix = parts[0]
            cdk_name = parts[1]
            
            # Check Prefix (if we know it)
            if target_prefix and cdk_prefix != target_prefix:
                # Special case: Shared prefixes or split states might differentiate?
                # But generally if we know it's Rajasthan, it MUST be RA_.
                continue
                
            # Check Name similarity
            # 1. Exact prefix match + fuzzy name
            if normalize(cdk_name) == norm_dist:
                match = cdk
                break
                
            # 2. Starts with check (e.g. "Dantewada" vs "Dante")
            if norm_dist.startswith(normalize(cdk_name)) or normalize(cdk_name).startswith(norm_dist):
                 candidates.append(cdk)
                 
        if not match and candidates:
            # Pick best candidate?
            # For now pick first, or prioritize shortest?
            match = candidates[0]
            
        if match:
            bridge[geo_key] = match
        else:
            unmapped_features.append(geo_key)

    print(f"Mapped {len(bridge)} features.")
    print(f"Unmapped: {len(unmapped_features)}")
    
    # Save the NEW bridge
    with open("frontend/src/data/map_bridge_FIXED.json", "w") as f:
        json.dump(bridge, f, indent=4)
        
    # Validation Report
    with open("mapping_report.txt", "w") as f:
        f.write(f"Total GeoJSON Features: {len(features)}\n")
        f.write(f"Mapped: {len(bridge)}\n")
        f.write(f"Unmapped: {len(unmapped_features)}\n")
        f.write("\n--- Unmapped Features ---\n")
        for u in unmapped_features:
            f.write(f"{u}\n")

if __name__ == "__main__":
    run_mapping()

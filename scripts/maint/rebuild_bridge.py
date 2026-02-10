"""
Rebuild map_bridge.json with comprehensive fuzzy matching.

Maps GeoJSON feature keys (DISTRICT|ST_NM) to DB CDK codes.
Uses multiple strategies:
1. Exact match
2. Normalized match (lowercase, strip spaces/punctuation)
3. Fuzzy match (difflib)
4. Substring containment

The goal is to maximize coverage so every GeoJSON polygon gets
a CDK code, enabling the choropleth map to show data.
"""
import json
import os
import re
import asyncio
import asyncpg
from difflib import get_close_matches
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GEOJSON_PATH = os.path.join(BASE_DIR, 'frontend', 'public', 'data', 'districts.json')
BRIDGE_PATH = os.path.join(BASE_DIR, 'frontend', 'public', 'data', 'map_bridge.json')

load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))
DB_URL = os.getenv('DATABASE_URL')


# State name aliases (GeoJSON name -> DB name variations)
STATE_ALIASES = {
    'nct of delhi': 'delhi',
    'andaman & nicobar islands': 'andaman & nicobar',
    'dadra & nagar haveli': 'dadra and nagar haveli',
    'daman & diu': 'daman and diu',
    'jammu & kashmir': 'jammu and kashmir',
}

# Known district name aliases
DISTRICT_ALIASES = {
    'alleppey': 'alappuzha',
    'trivandrum': 'thiruvananthapuram',
    'calicut': 'kozhikode',
    'trichur': 'thrissur',
    'cannanore': 'kannur',
    'quilon': 'kollam',
    'palghat': 'palakkad',
    'bombay': 'mumbai',
    'madras': 'chennai',
    'calcutta': 'kolkata',
    'bangalore': 'bengaluru',
    'bellary': 'ballari',
    'shimoga': 'shivamogga',
    'tumkur': 'tumakuru',
    'gulbarga': 'kalaburagi',
    'bijapur': 'vijayapura',
    'raichur': 'raichur',
    'belgaum': 'belagavi',
    'mysore': 'mysuru',
    'baroda': 'vadodara',
    'poona': 'pune',
    'orissa': 'odisha',
    'uttaranchal': 'uttarakhand',
}


def normalize(name):
    """Normalize name for matching."""
    if not name:
        return ''
    n = name.lower().strip()
    # Apply aliases
    n = DISTRICT_ALIASES.get(n, n)
    n = STATE_ALIASES.get(n, n)
    # Remove common suffixes
    for suffix in [' district', ' division']:
        n = n.replace(suffix, '')
    # Remove special chars
    n = re.sub(r'[^a-z0-9\s]', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n


async def rebuild():
    print("Loading GeoJSON...")
    with open(GEOJSON_PATH) as f:
        geojson = json.load(f)
    
    features = geojson['features']
    print(f"  {len(features)} features")
    
    # Extract geo keys
    geo_entries = []
    for feat in features:
        props = feat['properties']
        district = props.get('DISTRICT', '')
        state = props.get('ST_NM', '')
        if district and state:
            geo_key = f"{district}|{state}"
            geo_entries.append({
                'geo_key': geo_key,
                'district': district,
                'state': state,
                'norm_district': normalize(district),
                'norm_state': normalize(state),
            })
    
    print(f"  {len(geo_entries)} geo entries extracted")
    
    # Load DB districts
    print("Loading DB districts...")
    conn = await asyncpg.connect(DB_URL)
    db_districts = await conn.fetch("SELECT cdk, district_name, state_name FROM districts")
    await conn.close()
    
    print(f"  {len(db_districts)} DB districts")
    
    # Build DB lookup structures
    db_by_state = {}  # normalized_state -> [(cdk, district_name, norm_district)]
    db_exact = {}     # (norm_state, norm_district) -> cdk
    
    for r in db_districts:
        cdk = r['cdk']
        d_name = r['district_name']
        s_name = r['state_name']
        
        if not d_name or not s_name:
            continue
        
        # Skip state aggregate rows
        if d_name == 'State Average' or cdk.startswith('S_'):
            continue
            
        norm_d = normalize(d_name)
        norm_s = normalize(s_name)
        
        db_exact[(norm_s, norm_d)] = cdk
        
        if norm_s not in db_by_state:
            db_by_state[norm_s] = []
        db_by_state[norm_s].append((cdk, d_name, norm_d))
    
    # Build bridge
    bridge = {}
    matched = 0
    unmatched = 0
    methods = {'exact': 0, 'fuzzy': 0, 'substring': 0}
    
    for entry in geo_entries:
        geo_key = entry['geo_key']
        norm_d = entry['norm_district']
        norm_s = entry['norm_state']
        
        # 1. Exact match
        cdk = db_exact.get((norm_s, norm_d))
        if cdk:
            bridge[geo_key] = cdk
            matched += 1
            methods['exact'] += 1
            continue
        
        # 2. Find candidates in state
        state_candidates = db_by_state.get(norm_s, [])
        
        if not state_candidates:
            # Try state alias
            for alias, standard in STATE_ALIASES.items():
                if norm_s == normalize(alias) or norm_s == normalize(standard):
                    alt_s = normalize(standard) if norm_s == normalize(alias) else normalize(alias)
                    state_candidates = db_by_state.get(alt_s, [])
                    if state_candidates:
                        break
        
        if not state_candidates:
            unmatched += 1
            continue
        
        # 3. Fuzzy match within state
        candidate_names = [c[1] for c in state_candidates]
        fuzzy_matches = get_close_matches(entry['district'], candidate_names, n=1, cutoff=0.6)
        
        if fuzzy_matches:
            match_name = fuzzy_matches[0]
            for c_cdk, c_name, c_norm in state_candidates:
                if c_name == match_name:
                    bridge[geo_key] = c_cdk
                    matched += 1
                    methods['fuzzy'] += 1
                    break
            continue
        
        # 4. Substring containment
        for c_cdk, c_name, c_norm in state_candidates:
            if norm_d in c_norm or c_norm in norm_d:
                bridge[geo_key] = c_cdk
                matched += 1
                methods['substring'] += 1
                break
        else:
            unmatched += 1
    
    print(f"\n=== Results ===")
    print(f"Matched: {matched} / {len(geo_entries)}")
    print(f"  Exact: {methods['exact']}")
    print(f"  Fuzzy: {methods['fuzzy']}")
    print(f"  Substring: {methods['substring']}")
    print(f"Unmatched: {unmatched}")
    
    # Save bridge
    with open(BRIDGE_PATH, 'w') as f:
        json.dump(bridge, f, indent=2, sort_keys=True)
    
    print(f"\nSaved bridge to {BRIDGE_PATH} ({len(bridge)} entries)")
    
    # Show unmatched for debugging
    matched_keys = set(bridge.keys())
    unmatched_entries = [e for e in geo_entries if e['geo_key'] not in matched_keys]
    if unmatched_entries:
        print(f"\nUnmatched GeoJSON features:")
        for e in unmatched_entries:
            print(f"  {e['geo_key']}")


if __name__ == '__main__':
    asyncio.run(rebuild())

import asyncio
import os
import sys
import asyncpg
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))
from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')))

DATABASE_URL = os.getenv("DATABASE_URL")

async def analyze_unmapped():
    conn = await asyncpg.connect(DATABASE_URL)
    
    districts = await conn.fetch("SELECT lgd_code, district_name, state_name FROM districts")
    lgd_lookup = {}
    for r in districts:
        key = (r['district_name'].strip().lower(), r['state_name'].strip().lower())
        lgd_lookup[key] = r['lgd_code']
        
    splits = await conn.fetch("SELECT parent_district, child_district, split_year, state_name FROM district_splits")
    
    NAME_CORRECTIONS = {
        "anantapuramu": "anantapur", "srikakulum": "srikakulam",
        "visakhapatnam": "visakhapatanam", "kokrajihar": "kokrajhar",
        "nalbali": "nalbari", "sibsagar": "sivasagar",
        "purnea": "purnia", "monghyr": "munger",
        "chittaurgarh": "chittorgarh", "darjiling": "darjeeling",
        "giridh": "giridih", "hazaribag": "hazaribagh",
        "sahibganj": "sahebganj", "baramula": "baramulla",
        "dakshina kannad": "dakshina kannada",
        "jayashankar bhupalpally": "jayashankar bhupalapally",
        "tiruchchirappalli": "tiruchirappalli",
        "tiruchirapalli": "tiruchirappalli",
        "kancheepuram": "kanchipuram",
        "dakshin bastar dantewada": "dantewada",
        "raj nandgaon": "rajnandgaon",
        "purba champaran": "purbi champaran",
        "pashchim champaran": "west champaran",
        "gurgaon": "gurugram", "bangalore": "bengaluru urban",
        "bangalore rural": "bengaluru rural", "bijapur": "vijayapura",
        "gulbarga": "kalaburagi", "mysore": "mysuru",
        "belgaum": "belagavi", "bellary": "ballari",
        "hoshangabad": "narmadapuram", "allahabad": "prayagraj",
        "faizabad": "ayodhya", "cannanore": "kannur",
        "quilon": "kollam", "trichur": "thrissur",
        "palghat": "palakkad",
        "champaran": "purbi champaran", "shahabad": "rohtas",
        "greater bombay": "mumbai", "west nimar": "khargone",
        "nimar": "khargone", "simla": "shimla",
    }
    
    STATE_ALIASES = {
        "andhra pradesh-telangana": ["TELANGANA", "ANDHRA PRADESH"],
        "daman and diu": ["THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU"],
    }
    
    TELANGANA_DISTRICTS = {
        "adilabad", "karimnagar", "warangal", "khammam", "nalgonda",
        "medak", "nizamabad", "rangareddy", "rangareddi", "mahabubnagar",
        "hyderabad",
    }

    def resolve_lgd(district_name, state_name):
        dn = district_name.lower().strip()
        sn = state_name.lower().strip()
        if (dn, sn) in lgd_lookup: return lgd_lookup[(dn, sn)]
        corrected = NAME_CORRECTIONS.get(dn, dn)
        if (corrected, sn) in lgd_lookup: return lgd_lookup[(corrected, sn)]
        for alias_key, alias_states in STATE_ALIASES.items():
            if alias_key in sn:
                for alt_state in alias_states:
                    if (dn, alt_state.lower()) in lgd_lookup: return lgd_lookup[(dn, alt_state.lower())]
                    if (corrected, alt_state.lower()) in lgd_lookup: return lgd_lookup[(corrected, alt_state.lower())]
        if dn in TELANGANA_DISTRICTS and "andhra" in sn:
             if (dn, "telangana") in lgd_lookup: return lgd_lookup[(dn, "telangana")]
             if (corrected, "telangana") in lgd_lookup: return lgd_lookup[(corrected, "telangana")]
        return None

    unmapped = set()
    for row in splits:
        parent_lgd = resolve_lgd(row['parent_district'], row['state_name'])
        if not parent_lgd:
            unmapped.add((row['parent_district'].strip(), row['state_name'].strip()))
        child_lgd = resolve_lgd(row['child_district'], row['state_name'])
        if not child_lgd:
            unmapped.add((row['child_district'].strip(), row['state_name'].strip()))

    with open('unmapped_report.json', 'w') as f:
        json.dump([{"district": d, "state": s} for d, s in sorted(list(unmapped), key=lambda x: (x[1], x[0]))], f, indent=2)
        
    print(f"Dumped {len(unmapped)} unique unmapped districts to unmapped_report.json")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(analyze_unmapped())

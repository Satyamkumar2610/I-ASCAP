
import asyncio
import os
import sys
import asyncpg
from collections import defaultdict
import json

# Add backend to path to import config if needed, or just read env directly
# Add backend to path to import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

# Load .env from project root
from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')))

DATABASE_URL = os.getenv("DATABASE_URL")

async def audit_data():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment.")
        return

    print(f"Connecting to database...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    print("--- Data Integrity Audit ---\n")

    # 1. Fetch all districts for mapping
    print("1. Fetching District Master Data...")
    districts = await conn.fetch("SELECT lgd_code, district_name, state_name FROM districts")
    
    # Create normalized lookup: (district_name, state_name) -> lgd_code
    lgd_lookup = {}
    for r in districts:
        key = (r['district_name'].strip().lower(), r['state_name'].strip().lower())
        lgd_lookup[key] = r['lgd_code']
        
    print(f"Total Master Districts: {len(districts)}")
    print(f"Lookup Keys: {len(lgd_lookup)}")
    print("\n")

    # 2. Audit Split Events
    print("2. Auditing Split Events (district_splits table)...")
    splits = await conn.fetch("SELECT * FROM district_splits")
    
    unmapped_parents = []
    unmapped_children = []
    
    # --- Name Corrections & Aliases (Copied from analysis.py) ---
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
        "lahaul and spiti": "lahul and spiti",
        "alleppey": "alappuzha",
        # Advanced mapped aliases
        "nicobar": "nicobars",
        "north & middle andaman": "north and middle andaman",
        "south andaman": "south andamans",
        "lepa - rada": "leparada",
        "pakke-kesang": "pakke kessang",
        "shi-yomi": "shi yomi",
        "subansiri": "upper subansiri",
        "dhuburi": "dhubri",
        "kamrup metropolitan": "kamrup metro",
        "south salmara-mankachar": "south salmara mancachar",
        "gaurela-pendra-marwahi": "gaurella pendra marwahi",
        "ahmedabad": "ahmadabad",
        "aravalli": "arvalli",
        "chhota udepur": "chhotaudepur",
        "mehsana": "mahesana",
        "charkhi dadri": "charki dadri",
        "kulu": "kullu",
        "badgam": "budgam",
        "bandipore": "bandipora",
        "rajauri": "rajouri",
        "shupiyan": "shopian",
        "kodarma": "koderma",
        "pakaur": "pakur",
        "saraikela-kharsawan": "saraikela kharsawan",
        "singhbhum": "west singhbhum",
        "bagalkot": "bagalkote",
        "chamarajanagar": "chamarajanagara",
        "davanagere": "davangere",
        "vijayanagara": "vijayanagar",
        "kasargod": "kasaragod",
        "agar-malwa": "agar malwa",
        "annupur": "anuppur",
        "narsimhapur": "narsinghpur",
        "gondiya": "gondia",
        "mumbai": "mumbai suburban",
        "garo hills": "west garo hills",
        "jaintia hills": "west jaintia hills",
        "hnathial": "hnahthial",
        "tseminyü": "tseminyu",
        "baudh": "boudh",
        "debagarh": "deogarh",
        "nabarangapur": "nabarangpur",
        "sonapur": "sonepur",
        "bhatinda": "bathinda",
        "firozpur": "ferozepur",
        "sahibzada ajit singh nagar": "shahid bhagat singh nagar",
        "dhaulpur": "dholpur",
        "chengalpattu mgr": "chengalpattu",
        "dindigul anna": "dindigul",
        "tirupattur": "tirupathur",
        "viluppuram": "villupuram",
        "jagtial": "jagitial",
        "jangaon": "jangoan",
        "mahbubnagar": "mahabubnagar",
        "medchal–malkajgiri": "medchal malkajgiri",
        "rangareddi": "ranga reddy",
        "rangareddy": "ranga reddy",
        "sipahijala": "sepahijala",
        "etawah'": "etawah",
        "kanpur": "jaunpur",
        "kanshiram nagar": "kushi nagar",
        "kushinagar": "kushi nagar",
        "sant kabir nagar": "sant kabeer nagar",
        "shrawasti": "shravasti",
        "siddharthnagar": "siddharth nagar",
        "rudraprayag": "rudra prayag",
        "udham singh nagar": "udam singh nagar",
        "medinipur": "medinipur west",
        "pashchim barddhaman": "paschim bardhaman",
        "purba barddhaman": "purba bardhaman",
        "dr. b. r. ambedkar konaseema": "konaseema",
        "nellore": "spsr nellore",
        "sri potti sriramulu nellore": "spsr nellore",
        "balipara frontier tract": "west kameng",
        "mikir hills": "karbi anglong",
        "north cachar hills": "dima hasao",
        "punch": "poonch",
        "pashchimi singhbhum": "west singhbhum",
        "purbi singhbhum": "east singhbhum",
        "phulabani": "kandhamal",
        "muktsar": "sri muktsar sahib",
        "nawanshahr": "shahid bhagat singh nagar",
        "ropar": "rupnagar",
        "kamarajar": "virudhunagar",
        "north arcot": "vellore",
        "periyar": "erode",
        "south arcot": "cuddalore",
        "tirunelveli kattabomman": "tirunelveli",
        "kumuram bheem": "komaram bheem asifabad",
        "warangal rural": "warangal",
        "jyotiba phule nagar": "amroha",
        "sant ravidas nagar": "bhadohi",
        "garhwal": "pauri garhwal",
        "barddhaman": "purba bardhaman",
        "twenty four parganas": "north twenty four parganas",
        "warangal urban (hanamkonda)": "hanamkonda",
        "hapur (panchsheel nagar)": "hapur",
        "sambhal (bhimnagar)": "sambhal",
        "shamli (prabuddhanagar)": "shamli",
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
        
        # 1. Direct match
        if (dn, sn) in lgd_lookup:
            return lgd_lookup[(dn, sn)]
            
        # 2. Name correction
        corrected = NAME_CORRECTIONS.get(dn, dn)
        if (corrected, sn) in lgd_lookup:
            return lgd_lookup[(corrected, sn)]
            
        # 3. State alias
        for alias_key, alias_states in STATE_ALIASES.items():
            if alias_key in sn:
                for alt_state in alias_states:
                    if (dn, alt_state.lower()) in lgd_lookup:
                        return lgd_lookup[(dn, alt_state.lower())]
                    if (corrected, alt_state.lower()) in lgd_lookup:
                        return lgd_lookup[(corrected, alt_state.lower())]

        # 4. Telangana check
        if dn in TELANGANA_DISTRICTS and "andhra" in sn:
             if (dn, "telangana") in lgd_lookup: return lgd_lookup[(dn, "telangana")]
             if (corrected, "telangana") in lgd_lookup: return lgd_lookup[(corrected, "telangana")]

        return None

    for row in splits:
        state = row['state_name'].strip().lower()
        
        # Check Parent
        parent_lgd = resolve_lgd(row['parent_district'], row['state_name'])
        if not parent_lgd:
            unmapped_parents.append(f"{row['parent_district']} ({row['state_name']})")
            
        # Check Child
        child_lgd = resolve_lgd(row['child_district'], row['state_name'])
        if not child_lgd:
            unmapped_children.append(f"{row['child_district']} ({row['state_name']})")

    print(f"Total Split Events: {len(splits)}")
    print(f"Unmapped Parents: {len(unmapped_parents)}")
    if unmapped_parents:
        print(f"Top 5 Unmapped Parents: {unmapped_parents[:5]}")
    
    print(f"Unmapped Children: {len(unmapped_children)}")
    if unmapped_children:
        print(f"Top 5 Unmapped Children: {unmapped_children[:5]}")
    print("\n")
    
    # 3. Check for Orphaned Metrics in agri_metrics
    # (previous code assumed we had LGDs from splits, now we check metric LGDs vs districts)


    # 3. Audit Agri Metrics
    print("3. Auditing Agricultural Metrics (agri_metrics table)...")
    # Count metrics
    metric_count = await conn.fetchval("SELECT COUNT(*) FROM agri_metrics")
    print(f"Total Metric Records: {metric_count}")
    
    # Check for orphaned metrics (LGD not in districts table)
    orphaned_metrics = await conn.fetchval("""
        SELECT COUNT(DISTINCT district_lgd) 
        FROM agri_metrics 
        WHERE district_lgd NOT IN (SELECT lgd_code FROM districts)
    """)
    print(f"Districts with metrics but missing from Master Table: {orphaned_metrics}")
    
    if orphaned_metrics > 0:
        sample_orphans = await conn.fetch("""
            SELECT DISTINCT district_lgd 
            FROM agri_metrics 
            WHERE district_lgd NOT IN (SELECT lgd_code FROM districts)
            LIMIT 5
        """)
        print(f"Sample Orphan LGDs: {[r['district_lgd'] for r in sample_orphans]}")

    # Check for coverage gaps (Years with low data)
    print("\nChecking Data Coverage by Year (Wheat Yield)...")
    coverage_by_year = await conn.fetch("""
        SELECT year, COUNT(*) as count
        FROM agri_metrics
        WHERE variable_name = 'wheat_yield' AND value > 0
        GROUP BY year
        ORDER BY year
    """)
    
    for row in coverage_by_year:
        print(f"Year {row['year']}: {row['count']} districts reported wheat yield")

    await conn.close()

if __name__ == "__main__":
    asyncio.run(audit_data())

import json
from difflib import get_close_matches

with open('unmapped_report.json') as f:
    unmapped = json.load(f)
    
with open('districts_master.json') as f:
    master = json.load(f)

# Build a dictionary of all lowercased district names in master
master_names = {}
for r in master:
    sn = r['state_name'].lower().strip()
    dn = r['district_name'].lower().strip()
    master_names[dn] = sn

matches = {}
for u in unmapped:
    dist = u['district'].lower().strip()
    state = u['state'].lower().strip()
    
    # Try exact match anywhere in country if state is tricky
    if dist in master_names:
        matches[dist] = dist
        continue
        
    # Try fuzzy match across country
    close = get_close_matches(dist, master_names.keys(), n=5, cutoff=0.75)
    
    if close:
        # Check if the close match is in a logically matching state
        best = None
        for c in close:
            m_state = master_names[c]
            # Naive state match logic
            if (state[:4] in m_state or m_state[:4] in state) or ("telangana" in state and "andhra" in m_state) or ("andhra" in state and "telangana" in m_state) or ("delhi" in state and "delhi" in m_state):
                best = c
                break
        if best:
            matches[dist] = best
        else:
            matches[f"{dist} ({state})"] = f"NO SAFE MATCH. Close: {close}"
    else:
        matches[f"{dist} ({state})"] = "NO MATCH"

# We know some manually
MANUAL = {
    "dr. b. r. ambedkar konaseema": "konaseema",
    "nellore": "spsr nellore",
    "sri potti sriramulu nellore": "spsr nellore",
    "vishakhapatnam": "visakhapatanam",
    "subansiri": "lower subansiri", # guess
    "dhuburi": "dhubri",
    "kamrup metropolitan": "kamrup metro",
    "balipara frontier tract": "west kameng", # outdated?
    "mikir hills": "karbi anglong",
    "north cachar hills": "dima hasao",
    "gaurela-pendra-marwahi": "gaurela pendra marwahi",
    "chhota udepur": "chhotaudepur",
    "kulu": "kullu",
    "badgam": "budgam",
    "bandipore": "bandipora",
    "baramula": "baramulla",
    "punch": "poonch",
    "rajauri": "rajouri",
    "shupiyan": "shopian",
    "kodarma": "koderma",
    "pakaur": "pakur",
    "pashchimi singhbhum": "west singhbhum",
    "purbi singhbhum": "east singhbhum",
    "saraikela-kharsawan": "seraikela kharsawan",
    "alleppey": "alappuzha",
    "annupur": "anuppur",
    "gondiya": "gondia",
    "garo hills": "west garo hills", # placeholder?
    "jaintia hills": "west jaintia hills",
    "tseminyü": "tseminyu",
    "baudh": "boudh",
    "debagarh": "deogarh",
    "nabarangapur": "nabarangpur",
    "phulabani": "kandhamal",
    "sonapur": "subarnapur",
    "bhatinda": "bathinda",
    "firozpur": "ferozepur",
    "muktsar": "sri muktsar sahib",
    "nawanshahr": "shahid bhagat singh nagar",
    "ropar": "rupnagar",
    "sahibzada ajit singh nagar": "s.a.s nagar",
    "dhaulpur": "dholpur",
    "dindigul anna": "dindigul",
    "kamarajar": "virudhunagar",
    "north arcot": "vellore",
    "periyar": "erode",
    "south arcot": "cuddalore",
    "tirunelveli kattabomman": "tirunelveli",
    "tirupattur": "tirupathur",
    "viluppuram": "villupuram",
    "kumuram bheem": "komaram bheem asifabad",
    "mahbubnagar": "mahabubnagar", # Telangana
    "medchal–malkajgiri": "medchal malkajgiri",
    "warangal rural": "warangal",
    "warangal urban (hanamkonda)": "hanamkonda",
    "sipahijala": "sepahijala",
    "etawah'": "etawah",
    "hapur (panchsheel nagar)": "hapur",
    "jyotiba phule nagar": "amroha",
    "kanshiram nagar": "kasganj",
    "sambhal (bhimnagar)": "sambhal",
    "sant kabir nagar": "sant kabeer nagar",
    "sant ravidas nagar": "bhadohi",
    "shamli (prabuddhanagar)": "shamli",
    "shrawasti": "shravasti",
    "siddharthnagar": "siddharth nagar",
    "garhwal": "pauri garhwal", # mostly
    "barddhaman": "purba bardhaman",
    "medinipur": "paschim medinipur",
    "twenty four parganas": "north twenty four parganas",
}

for k, v in list(matches.items()):
    if "MATCH" in v:
        # Check manual
        ck = k.split(" (")[0].strip()
        if ck in MANUAL:
            matches[ck] = MANUAL[ck]

print("NEW_ALIASES = {")
for k, v in matches.items():
    if "MATCH" not in v and k != v:
        print(f'    "{k.split(" (")[0]}": "{v}",')
        
for k, v in MANUAL.items():
    if k not in matches:
        print(f'    "{k}": "{v}",')
print("}")

print("\nSTILL UNMATCHED:")
for k, v in matches.items():
    if "MATCH" in v and k.split(" (")[0].strip() not in MANUAL:
        print(f"{k} -> {v}")


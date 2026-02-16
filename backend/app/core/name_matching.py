
"""
Name matching utilities for district resolution.
"""
from typing import Optional, Tuple, Dict

# Normalized corrections map
NAME_CORRECTIONS = {
    # Spelling variants
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
    # Renamed districts
    "gurgaon": "gurugram", "bangalore": "bengaluru urban",
    "bangalore rural": "bengaluru rural", "bijapur": "vijayapura",
    "gulbarga": "kalaburagi", "mysore": "mysuru",
    "belgaum": "belagavi", "bellary": "ballari",
    "hoshangabad": "narmadapuram", "allahabad": "prayagraj",
    "faizabad": "ayodhya", "cannanore": "kannur",
    "quilon": "kollam", "trichur": "thrissur",
    "palghat": "palakkad",
    # Historical/composite names (map to first split child if existing)
    "champaran": "purbi champaran", "shahabad": "rohtas",
    "greater bombay": "mumbai", "west nimar": "khargone",
    "nimar": "khargone", "simla": "shimla",
    "lahaul and spiti": "lahul and spiti",
    "alleppey": "alappuzha",
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

def resolve_district_name(district_name: str, state_name: Optional[str] = None) -> str:
    """
    Resolve a district name to its canonical form used in the database.
    """
    dn = district_name.lower().strip()
    
    # Check map
    if dn in NAME_CORRECTIONS:
        return NAME_CORRECTIONS[dn]
        
    return dn

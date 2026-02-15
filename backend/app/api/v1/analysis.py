"""
Analysis API: Split impact and advanced analytics endpoints.
Updated to use lgd_code/district_lgd schema.
"""
import hashlib

from fastapi import APIRouter, Depends, Query, Request
import asyncpg

from app.api.deps import get_db
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import SplitImpactResponse
from app.analytics import get_advanced_analyzer

router = APIRouter()


def _generate_query_hash(request: Request) -> str:
    """Generate hash of query params for provenance."""
    query_string = str(sorted(request.query_params.items()))
    return f"sha256:{hashlib.sha256(query_string.encode()).hexdigest()[:16]}"


@router.get("/split-impact/summary")
async def get_summary(db: asyncpg.Connection = Depends(get_db)):
    """
    Get summary statistics for all states.
    
    Returns list of states with district counts and boundary change counts.
    Uses district_splits table for split event counts.
    """
    # Get all states and district counts
    states = await db.fetch("""
        SELECT state_name, COUNT(*) as total_districts
        FROM districts
        GROUP BY state_name
        ORDER BY state_name
    """)
    
    # Count distinct split events (parent+year combos) per state from district_splits
    split_counts = await db.fetch("""
        SELECT state_name, COUNT(DISTINCT parent_district || '_' || split_year::text) as boundary_changes
        FROM district_splits
        GROUP BY state_name
    """)
    
    split_map = {r["state_name"].upper(): r["boundary_changes"] for r in split_counts}
    
    state_list = []
    stats = {}
    for row in states:
        state = row["state_name"]
        # Match state names case-insensitively
        changes = split_map.get(state.upper(), 0)
        # Also try title case match
        if changes == 0:
            for ds_state, cnt in split_map.items():
                if ds_state.upper() == state.upper() or ds_state.title() == state.title():
                    changes = cnt
                    break
        
        state_list.append(state)
        stats[state] = {
            "state": state,
            "total": row["total_districts"],
            "total_districts": row["total_districts"],
            "changed": changes,
            "boundary_changes": changes,
            "coverage": 100,
            "data_coverage": "High",
            "comparability": "Active" if changes > 0 else "N/A",
        }
    
    return {"states": state_list, "stats": stats}


@router.get("/split-impact/districts")
async def get_districts_for_state(
    state: str = Query(..., description="State name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get split events for a specific state.
    
    Queries district_splits table and resolves district names to LGD codes.
    Uses multi-strategy name matching with corrections for historical/variant names.
    """
    # --- Name correction maps ---
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
    
    # --- Build LGD lookup from districts table ---
    all_districts = await db.fetch(
        "SELECT lgd_code, UPPER(district_name) as dn, UPPER(state_name) as sn FROM districts"
    )
    lgd_lookup = {}
    for d in all_districts:
        lgd_lookup[(d["dn"].lower(), d["sn"].lower())] = d["lgd_code"]
    
    def _resolve_lgd(district_name: str, state_name: str):
        """Multi-strategy LGD resolution."""
        dn = district_name.lower().strip()
        sn = state_name.lower().strip()
        
        # 1. Direct match
        lgd = lgd_lookup.get((dn, sn))
        if lgd:
            return lgd
        
        # 2. Name correction
        corrected = NAME_CORRECTIONS.get(dn, dn)
        lgd = lgd_lookup.get((corrected, sn))
        if lgd:
            return lgd
        
        # 3. State alias (e.g. "Andhra Pradesh-Telangana" → try both)
        for alias_key, alias_states in STATE_ALIASES.items():
            if alias_key in sn:
                for alt_state in alias_states:
                    lgd = lgd_lookup.get((dn, alt_state.lower()))
                    if lgd:
                        return lgd
                    lgd = lgd_lookup.get((corrected, alt_state.lower()))
                    if lgd:
                        return lgd
        
        # 4. Telangana check (AP split entries)
        if dn in TELANGANA_DISTRICTS and "andhra" in sn:
            lgd = lgd_lookup.get((dn, "telangana"))
            if not lgd:
                lgd = lgd_lookup.get((corrected, "telangana"))
            if lgd:
                return lgd
        
        # 5. Prefix match (first 5 chars)
        if len(dn) >= 5:
            for (d, s), code in lgd_lookup.items():
                if s == sn and d[:5] == dn[:5]:
                    return code
        
        return None
    
    # --- Query split events ---
    rows = await db.fetch("""
        SELECT 
            ds.parent_district,
            ds.child_district,
            ds.split_year,
            ds.state_name,
            p.lgd_code as parent_lgd,
            c.lgd_code as child_lgd
        FROM district_splits ds
        LEFT JOIN districts p ON UPPER(p.district_name) = UPPER(ds.parent_district)
            AND UPPER(p.state_name) = UPPER(ds.state_name)
        LEFT JOIN districts c ON UPPER(c.district_name) = UPPER(ds.child_district)
            AND UPPER(c.state_name) = UPPER(ds.state_name)
        WHERE UPPER(ds.state_name) = UPPER($1)
        ORDER BY ds.split_year, ds.parent_district
    """, state)
    
    if not rows:
        return []
    
    # Group by (parent_district, split_year) to build split events
    from collections import defaultdict
    groups: dict = defaultdict(lambda: {
        "parent_district": "", "parent_cdk": None, "split_year": 0,
        "state": "", "children_districts": [], "children_cdks": []
    })
    
    for row in rows:
        key = (row["parent_district"], row["split_year"])
        g = groups[key]
        g["parent_district"] = row["parent_district"]
        # Use SQL JOIN result, fall back to Python-side name correction
        parent_lgd = row["parent_lgd"]
        if not parent_lgd:
            parent_lgd = _resolve_lgd(row["parent_district"], row["state_name"])
        g["parent_cdk"] = str(parent_lgd) if parent_lgd else None
        g["split_year"] = row["split_year"]
        g["state"] = row["state_name"]
        
        child_name = row["child_district"]
        child_lgd = row["child_lgd"]
        if not child_lgd:
            child_lgd = _resolve_lgd(child_name, row["state_name"])
        child_cdk = str(child_lgd) if child_lgd else None
        
        if child_name not in g["children_districts"]:
            g["children_districts"].append(child_name)
            g["children_cdks"].append(child_cdk)
    
    # Build response matching frontend SplitDistrict interface
    results = []
    for (parent, year), g in sorted(groups.items(), key=lambda x: -x[0][1]):
        results.append({
            "id": f"{parent}_{year}",
            "parent_district": g["parent_district"],
            "parent_name": g["parent_district"],
            "parent_cdk": g["parent_cdk"],
            "split_year": g["split_year"],
            "children_districts": g["children_districts"],
            "children_names": g["children_districts"],
            "children_cdks": g["children_cdks"],
            "state": g["state"],
        })
    
    return results


@router.get("/split-impact/analysis", response_model=SplitImpactResponse)
async def analyze_split_impact(
    request: Request,
    parent: str = Query(..., description="Parent district CDK"),
    children: str = Query(..., description="Comma-separated child CDKs"),
    splitYear: int = Query(..., alias="splitYear", description="Year of split"),
    crop: str = Query("wheat", description="Crop name"),
    metric: str = Query("yield", description="Metric: yield, area, production"),
    mode: str = Query("before_after", description="Mode: before_after or entity_comparison"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Perform split impact analysis.
    """
    children_list = [c.strip() for c in children.split(",") if c.strip()]
    variable = f"{crop.lower()}_{metric.lower()}"
    query_hash = _generate_query_hash(request)
    
    # Check Cache
    from app.cache import get_cache, CacheTTL
    cache = get_cache()
    cached_result = await cache.get(query_hash)
    if cached_result:
        return cached_result

    service = AnalysisService(db)
    result = await service.analyze_split_impact(
        parent_cdk=parent,
        children_cdks=children_list,
        split_year=splitYear,
        domain="agriculture",
        variable=variable,
        mode=mode,
        query_hash=query_hash,
    )
    
    # Set Cache
    await cache.set(query_hash, result, CacheTTL.ANALYSIS)
    return result


# Advanced Analytics Endpoints
# -----------------------------------------------------------------------------


@router.get("/diversification")
async def get_crop_diversification(
    state: str = Query(..., description="State name"),
    year: int = Query(..., description="Year to analyze"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate Crop Diversification Index (CDI) for a state.
    
    Uses Simpson's Diversity Index: 1 - Σ(pi²)
    Higher values indicate more diverse cropping patterns.
    """
    # Get crop area data aggregated by crop for the state/year
    query = """
        SELECT variable_name, value
        FROM agri_metrics m
        JOIN districts d ON m.district_lgd = d.lgd_code
        WHERE d.state_name = $1 
          AND m.year = $2 
          AND (m.variable_name LIKE '%_area' OR m.variable_name LIKE '%_area_%')
          AND m.value IS NOT NULL AND m.value > 0
    """
    rows = await db.fetch(query, state, year)
    
    if not rows:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No data found for specified state and year")
    
    crop_areas = {}
    for row in rows:
        var = row["variable_name"]
        val = float(row["value"])
        
        # Extract crop name: "rice_area" -> "rice", "rice_area_kharif" -> "rice"
        if "_area_" in var:
            crop = var.split("_area_")[0]
        else:
            crop = var.replace("_area", "")
            
        crop_areas[crop] = crop_areas.get(crop, 0) + val
    
    analyzer = get_advanced_analyzer()
    result = analyzer.calculate_diversification(crop_areas)
    
    return {
        "state": state,
        "year": year,
        **result.__dict__,
    }


@router.get("/efficiency")
async def get_yield_efficiency(
    cdk: str = Query(..., description="District LGD code (as text)"),
    crop: str = Query(..., description="Crop name"),
    year: int = Query(..., description="Year to analyze"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate yield efficiency for a district compared to state potential.
    """
    # 1. Try Base Variable
    variable = f"{crop.lower()}_yield"
    
    # Check if base variable exists for this district/year
    check_query = "SELECT 1 FROM agri_metrics WHERE district_lgd::text=$1 AND variable_name=$2 AND year=$3"
    exists = await db.fetchval(check_query, cdk, variable, year)
    
    if not exists:
        # Fallback to seasonal
        season_map = {
            "rice": "kharif", "wheat": "rabi", "maize": "kharif", 
            "soyabean": "kharif", "groundnut": "kharif", "cotton": "kharif",
            "pearl_millet": "kharif", "sorghum": "kharif", "chickpea": "rabi"
        }
        season = season_map.get(crop.lower())
        if season:
            variable = f"{crop.lower()}_yield_{season}"

    # Get district info
    district_query = """
        SELECT d.state_name, m.value as yield_val
        FROM agri_metrics m
        JOIN districts d ON m.district_lgd = d.lgd_code
        WHERE m.district_lgd::text = $1 AND m.variable_name = $2 AND m.year = $3
    """
    district_row = await db.fetchrow(district_query, cdk, variable, year)
    
    if not district_row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No data found for specified district, crop, and year")
    
    state_name = district_row["state_name"]
    district_yield = float(district_row["yield_val"]) if district_row["yield_val"] else 0
    
    # Get all state yields for this crop/year
    state_query = """
        SELECT m.value as yield_val
        FROM agri_metrics m
        JOIN districts d ON m.district_lgd = d.lgd_code
        WHERE d.state_name = $1 AND m.variable_name = $2 AND m.year = $3
        AND m.value IS NOT NULL AND m.value > 0
    """
    state_rows = await db.fetch(state_query, state_name, variable, year)
    state_yields = [float(r["yield_val"]) for r in state_rows]
    
    # Get historical yields for this district (last 10 years)
    history_query = """
        SELECT year, value as yield_val
        FROM agri_metrics
        WHERE district_lgd::text = $1 AND variable_name = $2 
        AND year < $3 AND year >= $3 - 10
        AND value IS NOT NULL AND value > 0
        ORDER BY year
    """
    history_rows = await db.fetch(history_query, cdk, variable, year)
    historical_yields = [float(r["yield_val"]) for r in history_rows]

    analyzer = get_advanced_analyzer()
    relative_result = analyzer.calculate_efficiency(district_yield, state_yields)
    historical_result = analyzer.calculate_historical_efficiency(district_yield, historical_yields)
    
    return {
        "cdk": cdk,
        "crop": crop,
        "year": year,
        "state": state_name,
        "relative_efficiency": relative_result.__dict__,
        "historical_efficiency": historical_result.__dict__,
    }


@router.get("/risk-profile")
async def get_risk_profile(
    cdk: str = Query(..., description="District LGD code (as text)"),
    crop: str = Query(..., description="Crop name"),
    metric: str = Query("yield", description="Metric: yield, area, production"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate risk profile based on historical volatility.
    """
    ALLOWED_METRICS = {"yield", "area", "production"}
    if metric.lower() not in ALLOWED_METRICS:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid metric. Allowed: {ALLOWED_METRICS}")
    
    variable = f"{crop.lower()}_{metric.lower()}"
    
    # Check if base variable exists
    check_query = "SELECT 1 FROM agri_metrics WHERE district_lgd::text=$1 AND variable_name=$2 LIMIT 1"
    exists = await db.fetchval(check_query, cdk, variable)
    
    if not exists:
        season_map = {
            "rice": "kharif", "wheat": "rabi", "maize": "kharif", 
            "soyabean": "kharif", "groundnut": "kharif", "cotton": "kharif",
            "pearl_millet": "kharif", "sorghum": "kharif", "chickpea": "rabi"
        }
        season = season_map.get(crop.lower())
        if season:
            variable = f"{variable}_{season}"
    
    query = """
        SELECT year, value
        FROM agri_metrics
        WHERE district_lgd::text = $1 AND variable_name = $2
        AND value IS NOT NULL AND value > 0
        ORDER BY year
    """
    rows = await db.fetch(query, cdk, variable)
    
    if not rows or len(rows) < 3:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Insufficient historical data (need at least 3 years)")
    
    yearly_values = {row["year"]: float(row["value"]) for row in rows}
    
    analyzer = get_advanced_analyzer()
    result = analyzer.calculate_risk_profile(yearly_values)
    resilience = analyzer.calculate_resilience(yearly_values)
    growth = analyzer.calculate_growth_matrix(yearly_values)
    
    return {
        "cdk": cdk,
        "crop": crop,
        "metric": metric,
        "years_analyzed": len(yearly_values),
        "risk_profile": {
            "risk_category": result.risk_category.value,
            "volatility_score": result.volatility_score,
            "reliability_rating": result.reliability_rating,
            "trend_stability": result.trend_stability,
            "worst_year": result.worst_year,
            "best_year": result.best_year,
        },
        "resilience_index": resilience.__dict__,
        "growth_matrix": growth.__dict__,
    }

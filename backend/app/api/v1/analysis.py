"""
Analysis API: Split impact and advanced analytics endpoints.
"""
import hashlib
from typing import List

from fastapi import APIRouter, Depends, Query, Request
import asyncpg

from app.api.deps import get_db
from app.services.analysis_service import AnalysisService
from app.schemas.analysis import SplitImpactResponse

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
    """
    service = AnalysisService(db)
    return await service.get_state_summary()


@router.get("/split-impact/districts")
async def get_districts_for_state(
    state: str = Query(..., description="State name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get split events for a specific state.
    
    Returns parent-children groupings with metadata.
    """
    service = AnalysisService(db)
    return await service.get_split_events_for_state(state)


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
    
    **Modes:**
    - `before_after`: Longitudinal reconstruction comparing pre/post split
    - `entity_comparison`: Side-by-side comparison of parent and children
    
    **Response includes:**
    - Timeline data for visualization
    - Series metadata for charting
    - Advanced statistics (CAGR, CV, impact) with uncertainty bounds
    - Provenance metadata for reproducibility
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


# -----------------------------------------------------------------------------
# Advanced Analytics Endpoints
# -----------------------------------------------------------------------------

from app.analytics import get_advanced_analyzer


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
        SELECT crop, SUM(area) as total_area
        FROM agri_metrics
        WHERE state_name = $1 AND year = $2 AND area IS NOT NULL AND area > 0
        GROUP BY crop
    """
    rows = await db.fetch(query, state, year)
    
    if not rows:
        return {"error": "No data found for specified state and year"}
    
    crop_areas = {row["crop"]: float(row["total_area"]) for row in rows}
    
    analyzer = get_advanced_analyzer()
    result = analyzer.calculate_diversification(crop_areas)
    
    return {
        "state": state,
        "year": year,
        **result.__dict__,
    }


@router.get("/efficiency")
async def get_yield_efficiency(
    cdk: str = Query(..., description="District CDK"),
    crop: str = Query(..., description="Crop name"),
    year: int = Query(..., description="Year to analyze"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate yield efficiency for a district compared to state potential.
    
    Potential = 95th percentile yield in the state.
    """
    # Get district info
    district_query = """
        SELECT state_name, yield FROM agri_metrics
        WHERE cdk = $1 AND LOWER(crop) = LOWER($2) AND year = $3
    """
    district_row = await db.fetchrow(district_query, cdk, crop, year)
    
    if not district_row:
        return {"error": "No data found for specified district, crop, and year"}
    
    state_name = district_row["state_name"]
    district_yield = float(district_row["yield"]) if district_row["yield"] else 0
    
    # Get all state yields for this crop/year
    state_query = """
        SELECT yield FROM agri_metrics
        WHERE state_name = $1 AND LOWER(crop) = LOWER($2) AND year = $3
        AND yield IS NOT NULL AND yield > 0
    """
    state_rows = await db.fetch(state_query, state_name, crop, year)
    state_yields = [float(r["yield"]) for r in state_rows]
    
    # Get historical yields for this district (last 10 years)
    history_query = """
        SELECT yield FROM agri_metrics
        WHERE cdk = $1 AND LOWER(crop) = LOWER($2) 
        AND year < $3 AND year >= $3 - 10
        AND yield IS NOT NULL AND yield > 0
        ORDER BY year
    """
    history_rows = await db.fetch(history_query, cdk, crop, year)
    historical_yields = [float(r["yield"]) for r in history_rows]

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
        # legacy key for backward compatibility if needed, but we want to enforce the new taxonomy
        # "efficiency_score": relative_result.efficiency_score 
    }


@router.get("/risk-profile")
async def get_risk_profile(
    cdk: str = Query(..., description="District CDK"),
    crop: str = Query(..., description="Crop name"),
    metric: str = Query("yield", description="Metric: yield, area, production"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate risk profile based on historical volatility.
    
    Returns risk category, volatility score, and reliability rating.
    """
    # Security: Validate metric against whitelist to prevent SQL Injection
    ALLOWED_METRICS = {"yield", "area", "production"}
    if metric.lower() not in ALLOWED_METRICS:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid metric. Allowed: {ALLOWED_METRICS}")
    
    query = f"""
        SELECT year, {metric} FROM agri_metrics
        WHERE cdk = $1 AND LOWER(crop) = LOWER($2)
        AND {metric} IS NOT NULL AND {metric} > 0
        ORDER BY year
    """
    rows = await db.fetch(query, cdk, crop)
    
    if not rows or len(rows) < 3:
        return {"error": "Insufficient historical data (need at least 3 years)"}
    
    yearly_values = {row["year"]: float(row[metric]) for row in rows}
    
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

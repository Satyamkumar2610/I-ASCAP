"""
Metrics API: Endpoints for agricultural/domain metrics.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
import asyncpg

from app.api.deps import get_db
from app.repositories.district_repo import DistrictRepository
from app.repositories.metric_repo import MetricRepository
from app.schemas.metric import AggregatedMetric

router = APIRouter()


@router.get("", response_model=List[AggregatedMetric])
async def get_metrics(
    year: int = Query(2020, description="Year to fetch"),
    crop: str = Query("wheat", description="Crop name"),
    metric: str = Query("yield", description="Metric type: yield, area, production"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get metric values for all districts for a given year/crop/metric.
    
    Used for choropleth map visualization.
    """
    repo = MetricRepository(db)
    variable = f"{crop.lower()}_{metric.lower()}"
    return await repo.get_by_year_and_variable(year, variable)


@router.get("/history")
async def get_time_series(
    cdk: Optional[str] = Query(None, description="District CDK"),
    district: Optional[str] = Query(None, description="District name (if CDK not provided)"),
    state: Optional[str] = Query(None, description="State name (helps resolve district name)"),
    crop: str = Query("wheat", description="Crop name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get time series for a single district.
    
    Returns {year, area, production, yield} for the specified crop.
    """
    district_repo = DistrictRepository(db)
    metric_repo = MetricRepository(db)
    
    target_cdk = cdk
    
    # Resolve CDK from name if needed
    if not target_cdk and district:
        # Tring resolving name first
        from app.core.name_matching import resolve_district_name
        resolved_name = resolve_district_name(district)
        
        # 1. Try search with resolved name
        results = await district_repo.search(resolved_name, state)
        if results:
            target_cdk = results[0].cdk
        
        # 2. If valid state provided, try to find by exact match in that state (fallback)
        if not target_cdk and state:
             # Try simple normalization locally if repository search failed (repo uses ILIKE, so fuzzy logic already there)
             pass
    
    if not target_cdk:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"District not found: {district}")
    
    timeline = await metric_repo.get_time_series_pivoted(target_cdk, crop.lower())
    
    return timeline


@router.get("/history/state")
async def get_state_time_series(
    state: str = Query(..., description="State name, e.g. 'Andhra Pradesh'"),
    crop: str = Query("wheat", description="Crop name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get aggregated time series for a whole state.
    
    Uses pre-aggregated Census data if available (inserted as S_STATE_NAME).
    """
    metric_repo = MetricRepository(db)
    
    # Construct State CDK
    # Must match ingestion logic: UPPER, space->_, &->AND
    normalized_state = state.upper().replace(' ', '_').replace('&', 'AND')
    state_cdk = f"S_{normalized_state}"
    
    timeline = await metric_repo.get_time_series_pivoted(state_cdk, crop.lower())
    
    if not timeline:
        # Fallback? Or return empty?
        # Maybe the state name provided doesn't match keys.
        return []
        
    return timeline

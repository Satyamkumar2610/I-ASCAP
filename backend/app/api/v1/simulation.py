"""
Simulation API Endpoints.
Uses Spatial-for-Temporal substitution to estimate rainfall sensitivity.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
import asyncpg

from app.api.deps import get_db
from app.analytics.advanced import get_advanced_analyzer, SimulationResult
from app.services.rainfall_service import get_rainfall_by_district

router = APIRouter()

class SimulationResponse(BaseModel):
    district: str
    state: str
    crop: str
    result: SimulationResult
    note: str

@router.get("/simulation", response_model=SimulationResponse)
async def get_simulation(
    district: str = Query(..., description="District Name"),
    crop: str = Query(..., description="Crop Name"),
    year: int = Query(..., description="Reference Year for Yield"),
    state: str = Query(..., description="State Name"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get simulation model for Rainfall vs Yield.
    
    LIMITATION: Lacking historical rainfall time-series, we use SPATIAL regression.
    We regress Yield vs Rainfall Normals across all districts in the state.
    Slope = Sensitivity of yield to long-term rainfall differences.
    We apply this sensitivity to simulate "Deviation from Normal".
    """
    # Cache Key Generation
    cache_key = f"sim:{state}:{district}:{crop}:{year}"
    
    from app.cache import get_cache, CacheTTL
    cache = get_cache()
    cached_result = await cache.get(cache_key)
    if cached_result:
        return cached_result

    analyzer = get_advanced_analyzer()
    
    # 1. Fetch Yields for ALL districts in the state for the given year
    yield_query = """
        SELECT district_name, yield
        FROM agri_metrics
        WHERE UPPER(state_name) = UPPER($1) 
        AND LOWER(crop) = LOWER($2) 
        AND year = $3
        AND yield IS NOT NULL AND yield > 0
    """
    yield_rows = await db.fetch(yield_query, state, crop, year)
    
    if len(yield_rows) < 5:
        # Fallback: Try average over last 5 years if single year is sparse?
        # For now, strict fail or maybe relax? Let's return empty result.
        raise HTTPException(status_code=404, detail="Insufficient state data for spatial regression")

    # 2. Fetch Rainfall Normals for these districts
    # We can join or loop. Loop is easier given rainfall_service.py structure and likely small N (<50 districts).
    # But efficient approach: Query all rainfall for state.
    rain_query = """
        SELECT district, annual
        FROM rainfall_normals
        WHERE UPPER(state_ut) = UPPER($1)
    """
    rain_rows = await db.fetch(rain_query, state)
    rain_map = {r["district"].upper(): float(r["annual"] or 0) for r in rain_rows}
    
    # 3. Match Data (X=Rain, Y=Yield)
    rainfall_x = []
    yields_y = []
    years = [] # Dummy years (indices really)
    
    idx = 0
    data_points = []
    
    target_district_rain = 0
    
    for row in yield_rows:
        d_name = row["district_name"]
        d_yield = float(row["yield"])
        
        # Fuzzy match or exact? Try Exact Upper first.
        r_val = rain_map.get(d_name.upper())
        
        if r_val and r_val > 0:
            rainfall_x.append(r_val)
            yields_y.append(d_yield)
            years.append(idx)
            idx += 1
            
            if d_name.upper() == district.upper():
                target_district_rain = r_val

    if len(rainfall_x) < 5:
        raise HTTPException(status_code=404, detail="Insufficient matching rainfall/yield data")

    # 4. Run Regression
    # We use the existing 'calculate_impact_simulation' which expects (rain, yield, years).
    # It calculates slope (kg/ha per mm).
    sim_result = analyzer.calculate_impact_simulation(rainfall_x, yields_y, years)
    
    # Override logic: 'calculate_impact_simulation' calculates a baseline based on MEAN rainfall.
    # We want to be able to simulate deviations from *target_district_rain*.
    
    # The slope is generic for the state.
    # Prediction = Intercept + Slope * Rain.
    
    result = SimulationResponse(
        district=district,
        state=state,
        crop=crop,
        result=sim_result,
        note="Spatial Regression Proxy: Sensitivity derived from cross-district comparison within state."
    )
    
    # Cache Result
    await cache.set(cache_key, result, CacheTTL.ANALYSIS)
    return result

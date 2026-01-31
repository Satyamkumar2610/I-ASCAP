"""
Climate API endpoints: Rainfall data and correlation analysis.
"""

from typing import Optional, List, Dict, Any
from dataclasses import asdict

from fastapi import APIRouter, Depends, Query, BackgroundTasks
import asyncpg

from app.api.deps import get_db
from app.services.rainfall_service import get_rainfall_service, RainfallData
from app.analytics import get_analyzer

router = APIRouter()


@router.get("/rainfall/load")
async def load_rainfall_data(
    background_tasks: BackgroundTasks,
    force: bool = Query(False, description="Force reload even if cache is valid"),
):
    """
    Load/refresh rainfall data from IMD API.
    
    This is called automatically on first request, but can be triggered manually.
    """
    service = get_rainfall_service()
    
    # Load in background if not forced
    if force:
        count = await service.load_data(force=True)
        return {"status": "loaded", "record_count": count}
    else:
        background_tasks.add_task(service.load_data)
        return {"status": "loading", "message": "Data loading in background"}


@router.get("/rainfall/stats")
async def get_rainfall_stats():
    """Get cache statistics for rainfall data."""
    service = get_rainfall_service()
    return service.get_cache_stats()


@router.get("/rainfall")
async def get_rainfall(
    state: str = Query(..., description="State name"),
    district: str = Query(..., description="District name"),
):
    """
    Get rainfall normals for a specific district.
    
    Returns monthly, seasonal, and annual rainfall data (1951-2000 normals).
    """
    service = get_rainfall_service()
    
    # Ensure data is loaded
    if not service._cache:
        await service.load_data()
    
    rainfall = service.get_rainfall(state, district)
    
    if not rainfall:
        return {"error": f"No rainfall data found for {district}, {state}"}
    
    return {
        "state": rainfall.state,
        "district": rainfall.district,
        "monthly": {
            "jan": rainfall.jan,
            "feb": rainfall.feb,
            "mar": rainfall.mar,
            "apr": rainfall.apr,
            "may": rainfall.may,
            "jun": rainfall.jun,
            "jul": rainfall.jul,
            "aug": rainfall.aug,
            "sep": rainfall.sep,
            "oct": rainfall.oct,
            "nov": rainfall.nov,
            "dec": rainfall.dec,
        },
        "seasonal": {
            "winter_jf": rainfall.winter_jf,
            "pre_monsoon_mam": rainfall.pre_monsoon_mam,
            "monsoon_jjas": rainfall.monsoon_jjas,
            "post_monsoon_ond": rainfall.post_monsoon_ond,
        },
        "annual": rainfall.annual,
        "source": "IMD 1951-2000 Normals",
    }


@router.get("/rainfall/all")
async def get_all_rainfall(
    state: Optional[str] = Query(None, description="Filter by state"),
):
    """
    Get rainfall data for all districts (or filter by state).
    
    For map visualization.
    """
    service = get_rainfall_service()
    
    if not service._cache:
        await service.load_data()
    
    if state:
        data = service.get_state_rainfall(state)
    else:
        data = service.get_all_rainfall()
    
    # Return simplified format for map
    return [
        {
            "state": r.state,
            "district": r.district,
            "annual": r.annual,
            "monsoon": r.monsoon_jjas,
        }
        for r in data
    ]


@router.get("/correlation")
async def get_rainfall_yield_correlation(
    state: str = Query(..., description="State name"),
    crop: str = Query(..., description="Crop name"),
    year: int = Query(..., description="Year to analyze"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Calculate correlation between rainfall and yield for districts in a state.
    
    Compares annual/monsoon rainfall against district yields.
    """
    service = get_rainfall_service()
    analyzer = get_analyzer()
    
    if not service._cache:
        await service.load_data()
    
    # Get yield data for state
    query = """
        SELECT district_name, yield
        FROM agri_metrics
        WHERE state_name = $1 AND LOWER(crop) = LOWER($2) AND year = $3
        AND yield IS NOT NULL AND yield > 0
    """
    rows = await db.fetch(query, state, crop, year)
    
    if not rows or len(rows) < 5:
        return {"error": "Insufficient yield data (need at least 5 districts)"}
    
    # Match with rainfall data
    matched_data = []
    for row in rows:
        district_name = row["district_name"]
        rainfall = service.get_rainfall(state, district_name)
        
        if rainfall:
            matched_data.append({
                "district": district_name,
                "yield": float(row["yield"]),
                "annual_rainfall": rainfall.annual,
                "monsoon_rainfall": rainfall.monsoon_jjas,
            })
    
    if len(matched_data) < 5:
        return {"error": f"Could not match sufficient districts with rainfall data ({len(matched_data)} found)"}
    
    # Calculate correlations
    yields = [d["yield"] for d in matched_data]
    annual_rain = [d["annual_rainfall"] for d in matched_data]
    monsoon_rain = [d["monsoon_rainfall"] for d in matched_data]
    
    annual_corr = analyzer.pearson_correlation(annual_rain, yields)
    monsoon_corr = analyzer.pearson_correlation(monsoon_rain, yields)
    
    def interpret_correlation(r: float) -> str:
        """Interpret correlation coefficient."""
        if abs(r) < 0.2:
            return "negligible"
        elif abs(r) < 0.4:
            return "weak"
        elif abs(r) < 0.6:
            return "moderate"
        elif abs(r) < 0.8:
            return "strong"
        else:
            return "very strong"
    
    return {
        "state": state,
        "crop": crop,
        "year": year,
        "sample_size": len(matched_data),
        "correlations": {
            "annual_rainfall": {
                "r": round(annual_corr, 4),
                "interpretation": interpret_correlation(annual_corr),
                "direction": "positive" if annual_corr > 0 else "negative",
            },
            "monsoon_rainfall": {
                "r": round(monsoon_corr, 4),
                "interpretation": interpret_correlation(monsoon_corr),
                "direction": "positive" if monsoon_corr > 0 else "negative",
            },
        },
        "data_points": matched_data,
        "note": "Correlation uses IMD 1951-2000 rainfall normals vs actual yields",
    }

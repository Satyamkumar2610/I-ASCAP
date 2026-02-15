"""
Lineage API: Endpoints for lineage graph and split events.
Updated to use lgd_code/district_lgd schema where applicable.
Note: lineage_events uses CDK text keys that cannot join to districts.lgd_code.
"""
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, Query
import asyncpg

from app.api.deps import get_db
from app.repositories.district_repo import DistrictRepository
from app.repositories.lineage_repo import LineageRepository
from app.schemas.lineage import LineageGraph, SplitEventSummary

router = APIRouter()


@router.get("/history")
async def get_district_history(
    state: Optional[str] = Query(None, description="Filter by state name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get comprehensive district split history from detailed records (1951-2024).
    """
    query = """
        SELECT state_name, split_year, parent_district, child_district, parent_cdk, child_cdk, source
        FROM district_splits
        WHERE ($1::text IS NULL OR state_name = $1)
        ORDER BY state_name, split_year
    """
    rows = await db.fetch(query, state)
    return [dict(r) for r in rows]


@router.get("/events")
async def get_lineage_events(
    state: Optional[str] = Query(None, description="Filter by state"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get lineage events (administrative boundary changes).
    
    Returns split/merge/rename events optionally filtered by state.
    """
    district_repo = DistrictRepository(db)
    lineage_repo = LineageRepository(db)
    
    if state:
        cdk_meta = await district_repo.get_cdk_to_meta_map()
        cdk_to_state = {cdk: meta["state"] for cdk, meta in cdk_meta.items()}
        events = await lineage_repo.get_events_by_state(state, cdk_to_state)
    else:
        events = await lineage_repo.get_all_events()
    
    return LineageGraph(total_events=len(events), events=events)


@router.get("/splits", response_model=List[SplitEventSummary])
async def get_split_events(
    state: str = Query(..., description="State name (required)"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Get grouped split events for a state.
    
    Returns parent districts with their children, sorted by year.
    """
    from app.services.analysis_service import AnalysisService
    
    service = AnalysisService(db)
    return await service.get_split_events_for_state(state)


@router.get("/tracking")
async def get_data_tracking(
    cdk: str = Query(..., description="District LGD code (as text)"),
    db: asyncpg.Connection = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get data lineage tracking for a district.
    
    Returns:
    - Data sources used
    - Year coverage
    - Related lineage events (splits/merges)
    - Data provenance chain
    """
    # Get district info
    district = await db.fetchrow("""
        SELECT lgd_code::text as cdk, district_name, state_name, start_year, end_year
        FROM districts WHERE lgd_code::text = $1
    """, cdk)
    
    if not district:
        return {"error": f"District not found: {cdk}"}
    
    # Get data coverage
    coverage = await db.fetchrow("""
        SELECT 
            COUNT(DISTINCT year) as years_with_data,
            MIN(year) as first_year,
            MAX(year) as last_year,
            COUNT(DISTINCT variable_name) as variables,
            COUNT(*) as total_records
        FROM agri_metrics WHERE district_lgd::text = $1
    """, cdk)
    
    # Lineage events use CDK text keys which don't match lgd_code
    # So we skip the lineage JOINs here — they'd return nothing meaningful
    
    return {
        "district": dict(district),
        "data_coverage": {
            "years_with_data": coverage["years_with_data"],
            "first_year": coverage["first_year"],
            "last_year": coverage["last_year"],
            "variables": coverage["variables"],
            "total_records": coverage["total_records"]
        },
        "data_sources": [{"source": "ICRISAT/DES", "record_count": coverage["total_records"], "from_year": coverage["first_year"], "to_year": coverage["last_year"]}],
        "lineage": {
            "split_into": [],
            "created_from": []
        }
    }


@router.get("/coverage")
async def get_state_coverage(
    state: str = Query(..., description="State name"),
    db: asyncpg.Connection = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get data coverage summary for all districts in a state.
    
    Shows years with data, record counts, and lineage status per district.
    """
    coverage = await db.fetch("""
        SELECT 
            d.lgd_code::text as cdk,
            d.district_name,
            d.start_year,
            d.end_year,
            COUNT(DISTINCT am.year) as years_with_data,
            COUNT(am.id) as record_count,
            'original' as lineage_status
        FROM districts d
        LEFT JOIN agri_metrics am ON d.lgd_code = am.district_lgd
        WHERE d.state_name = $1
        GROUP BY d.lgd_code, d.district_name, d.start_year, d.end_year
        ORDER BY d.district_name
    """, state)
    
    return {
        "state": state,
        "districts": len(coverage),
        "coverage": [dict(c) for c in coverage]
    }

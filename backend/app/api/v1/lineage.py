"""
Lineage API: Endpoints for lineage graph and split events.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
import asyncpg

from app.api.deps import get_db
from app.repositories.district_repo import DistrictRepository
from app.repositories.lineage_repo import LineageRepository
from app.schemas.lineage import LineageGraph, SplitEventSummary

router = APIRouter()


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
    lineage_repo = LineageRepository()
    
    if state:
        cdk_meta = await district_repo.get_cdk_to_meta_map()
        cdk_to_state = {cdk: meta["state"] for cdk, meta in cdk_meta.items()}
        events = lineage_repo.get_events_by_state(state, cdk_to_state)
    else:
        events = lineage_repo.get_all_events()
    
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

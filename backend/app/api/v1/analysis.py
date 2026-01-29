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
    
    service = AnalysisService(db)
    return await service.analyze_split_impact(
        parent_cdk=parent,
        children_cdks=children_list,
        split_year=splitYear,
        domain="agriculture",
        variable=variable,
        mode=mode,
        query_hash=query_hash,
    )

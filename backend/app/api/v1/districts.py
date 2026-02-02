"""
Districts API: Endpoints for district data access.
"""
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
import asyncpg

from app.api.deps import get_db
from app.repositories.district_repo import DistrictRepository
from app.schemas.district import District, DistrictList

router = APIRouter()


@router.get("", response_model=DistrictList)
async def list_districts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    search: Optional[str] = Query(None, description="Search by district name"),
    db: asyncpg.Connection = Depends(get_db),
):
    """
    List all districts with optional filtering.
    
    - **state**: Filter to a specific state
    - **search**: Search districts by name (case-insensitive)
    """
    repo = DistrictRepository(db)
    
    if search:
        districts = await repo.search(search, state)
    else:
        districts = await repo.get_all(state)
    
    return DistrictList(total=len(districts), items=districts)


@router.get("/states")
async def list_states(db: asyncpg.Connection = Depends(get_db)):
    """Get list of all unique states."""
    repo = DistrictRepository(db)
    states = await repo.get_states()
    return {"states": states}


@router.get("/{cdk}", response_model=District)
async def get_district(
    cdk: str,
    db: asyncpg.Connection = Depends(get_db),
):
    """Get a single district by CDK."""
    repo = DistrictRepository(db)
    district = await repo.get_by_cdk(cdk)
    
    if not district:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="District not found")
    
    return district

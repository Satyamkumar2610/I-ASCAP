from fastapi import APIRouter, Depends, Query, HTTPException
import asyncpg

from app.api.deps import get_db
from app.services.spatial_service import SpatialService

router = APIRouter(prefix="/spatial", tags=["Spatial Data"])

@router.get("/contagion")
async def get_spatial_contagion(
    cdk: str = Query(..., description="Target district LGD code (as text)"),
    crop: str = Query("wheat", description="Crop name to analyze"),
    start_year: int = Query(2000, description="Start year of analysis window"),
    end_year: int = Query(2020, description="End year of analysis window"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Calculate agricultural growth spillovers using geographic adjacency (PostGIS).
    Compiles a target district's yield CAGR vs the average of its neighbors.
    """
    service = SpatialService(db)
    
    # Validation logic to ensure district exists
    check = await db.fetchval("SELECT lgd_code FROM districts WHERE lgd_code::text = $1", cdk)
    if not check:
        raise HTTPException(status_code=404, detail=f"District {cdk} not found.")
        
    result = await service.get_spatial_contagion(cdk, crop, start_year, end_year)
    return result

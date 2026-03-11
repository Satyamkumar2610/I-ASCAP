from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
import asyncpg
import json

from app.api.deps import get_db
from app.services.spatial_service import SpatialService
from app.services.geometry_service import GeometryService
from app.exceptions import NotFoundError

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
        raise NotFoundError(detail=f"District {cdk} not found.")
        
    result = await service.get_spatial_contagion(cdk, crop, start_year, end_year)
    return result

@router.post("/calculate-split")
async def calculate_split(
    parent_geojson: UploadFile = File(..., description="Parent district GeoJSON"),
    child_geojson: UploadFile = File(..., description="Child district GeoJSON")
):
    """
    Calculate the accurate Transferred Area and Remaining Area in square kilometers
    using Indian Equal Area projection (EPSG:7755) and GeoPandas.
    """
    try:
        parent_content = await parent_geojson.read()
        child_content = await child_geojson.read()
        
        parent_dict = json.loads(parent_content.decode("utf-8"))
        child_dict = json.loads(child_content.decode("utf-8"))
        
        geom_service = GeometryService()
        result = geom_service.calculate_split_areas(parent_dict, child_dict)
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format uploaded.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geo-processing failed: {str(e)}")

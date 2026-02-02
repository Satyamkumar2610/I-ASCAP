"""API v1 Router - aggregates all endpoint routers."""
from fastapi import APIRouter

from app.api.v1 import districts, lineage, metrics, analysis, climate, simulation

api_router = APIRouter()

# Include sub-routers
api_router.include_router(districts.router, prefix="/districts", tags=["Districts"])
api_router.include_router(lineage.router, prefix="/lineage", tags=["Lineage"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(climate.router, prefix="/climate", tags=["Climate"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])


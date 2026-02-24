"""API v1 Router - aggregates all endpoint routers."""
from fastapi import APIRouter

from app.api.v1 import districts, lineage, metrics, analysis, climate, simulation, health, quality, forecast, anomalies, advanced_analytics, states, search, reports

api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router)  # Health checks at /health
api_router.include_router(quality.router)  # Data quality at /quality
api_router.include_router(forecast.router)  # Forecasting at /forecast
api_router.include_router(anomalies.router)  # Anomaly detection at /anomalies
api_router.include_router(districts.router, prefix="/districts", tags=["Districts"])
api_router.include_router(lineage.router, prefix="/lineage", tags=["Lineage"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(climate.router, prefix="/climate", tags=["Climate"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
api_router.include_router(advanced_analytics.router)  # Advanced analytics at /analytics
api_router.include_router(states.router)  # State-level overview at /states
api_router.include_router(search.router)  # Search at /search
api_router.include_router(reports.router)  # Reports at /reports





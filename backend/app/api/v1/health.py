"""
Health Check API Endpoints.
Provides liveness, readiness, and data quality metrics.
"""

from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends
import asyncpg

from app.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
async def liveness() -> Dict[str, Any]:
    """
    Basic liveness check.
    Returns 200 if the service is running.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "i-ascap-backend"
    }


@router.get("/ready")
async def readiness(db: asyncpg.Connection = Depends(get_db)) -> Dict[str, Any]:
    """
    Readiness check - verifies database connectivity.
    Returns 200 if all dependencies are ready.
    """
    try:
        # Test database connection
        db_result = await db.fetchval("SELECT 1")
        db_status = "connected" if db_result == 1 else "error"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    is_ready = db_status == "connected"
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": db_status
        }
    }


@router.get("/metrics")
async def data_metrics(db: asyncpg.Connection = Depends(get_db)) -> Dict[str, Any]:
    """
    Data quality and coverage metrics.
    Returns statistics about loaded data.
    """
    # Get table counts
    districts_count = await db.fetchval("SELECT COUNT(*) FROM districts")
    metrics_count = await db.fetchval("SELECT COUNT(*) FROM agri_metrics")
    lineage_count = await db.fetchval("SELECT COUNT(*) FROM lineage_events")
    
    # Check for rainfall table
    try:
        rainfall_count = await db.fetchval("SELECT COUNT(*) FROM rainfall_normals")
    except:
        rainfall_count = 0
    
    # Get year coverage
    year_stats = await db.fetchrow("""
        SELECT MIN(year) as min_year, MAX(year) as max_year, COUNT(DISTINCT year) as year_count
        FROM agri_metrics
    """)
    
    # Get state coverage
    state_count = await db.fetchval("SELECT COUNT(DISTINCT state_name) FROM districts")
    
    # Data quality: check for missing CDKs in metrics
    orphan_metrics = await db.fetchval("""
        SELECT COUNT(DISTINCT cdk) 
        FROM agri_metrics m 
        WHERE NOT EXISTS (SELECT 1 FROM districts d WHERE d.cdk = m.cdk)
    """)
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "data_coverage": {
            "districts": districts_count,
            "states": state_count,
            "metrics_rows": metrics_count,
            "lineage_events": lineage_count,
            "rainfall_records": rainfall_count,
            "year_range": {
                "min": year_stats["min_year"] if year_stats else None,
                "max": year_stats["max_year"] if year_stats else None,
                "count": year_stats["year_count"] if year_stats else 0
            }
        },
        "data_quality": {
            "orphan_metric_cdks": orphan_metrics,
            "integrity_status": "good" if orphan_metrics == 0 else "issues_detected"
        }
    }

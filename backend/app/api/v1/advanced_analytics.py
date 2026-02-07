"""
Advanced Analytics API Endpoints.

Provides data science-driven insights including:
- Crop Diversification Index
- Yield Trend Analysis
- Split Impact Comparison
- Crop Correlations
- District Rankings
"""

from fastapi import APIRouter, Depends, Query
from typing import List, Optional
import asyncpg

from app.db import get_db
from app.services.advanced_analytics import AdvancedAnalyticsService

router = APIRouter(prefix="/analytics", tags=["Advanced Analytics"])


@router.get("/diversification")
async def get_crop_diversification(
    cdk: str = Query(..., description="Canonical District Key"),
    year: int = Query(2020, description="Year to analyze"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get Crop Diversification Index for a district.
    
    Returns:
    - Herfindahl-Hirschman Index (0-1, lower = more diverse)
    - Simpson's Diversity Index (0-1, higher = more diverse)
    - Number of crops grown
    - Dominant crop and its share
    """
    service = AdvancedAnalyticsService(db)
    result = await service.get_crop_diversification(cdk, year)
    
    if not result:
        return {"error": f"No data found for {cdk} in {year}"}
    
    return {
        "cdk": result.cdk,
        "year": result.year,
        "herfindahl_index": result.herfindahl_index,
        "simpson_diversity_index": result.simpson_index,
        "interpretation": "diverse" if result.simpson_index > 0.7 else "moderately diverse" if result.simpson_index > 0.4 else "concentrated",
        "num_crops": result.num_crops,
        "dominant_crop": result.dominant_crop,
        "dominant_share_percent": result.dominant_share
    }


@router.get("/yield-trend")
async def get_yield_trend(
    cdk: str = Query(..., description="Canonical District Key"),
    crop: str = Query("rice", description="Crop name"),
    start_year: int = Query(1990, description="Start year"),
    end_year: int = Query(2020, description="End year"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get yield trend analysis with CAGR and volatility.
    """
    service = AdvancedAnalyticsService(db)
    result = await service.get_yield_trend(cdk, crop, start_year, end_year)
    
    if not result:
        return {"error": f"Insufficient data for {crop} in {cdk}"}
    
    return {
        "cdk": cdk,
        "crop": result.crop,
        "period": f"{result.start_year}-{result.end_year}",
        "start_yield_kg_ha": result.start_yield,
        "end_yield_kg_ha": result.end_yield,
        "cagr_percent": result.cagr,
        "volatility_percent": result.volatility,
        "trend": result.trend,
        "risk_assessment": "low" if result.volatility < 10 else "medium" if result.volatility < 25 else "high"
    }


@router.get("/split-impact")
async def get_split_impact(
    parent_cdk: str = Query(..., description="Parent district CDK"),
    child_cdks: str = Query(..., description="Comma-separated child CDKs"),
    split_year: int = Query(..., description="Year of split"),
    crop: str = Query("rice", description="Crop to analyze"),
    years_before: int = Query(5, description="Years before split"),
    years_after: int = Query(5, description="Years after split"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Compare agricultural performance before/after district split.
    
    Calculates:
    - Average yield before split (parent district)
    - Average yield after split (children districts)
    - Impact assessment (positive/negative/neutral)
    """
    service = AdvancedAnalyticsService(db)
    children = [c.strip() for c in child_cdks.split(",")]
    
    result = await service.get_split_impact(
        parent_cdk, children, split_year, crop, years_before, years_after
    )
    
    return result


@router.get("/crop-correlations")
async def get_crop_correlations(
    state: str = Query(..., description="State name"),
    year: int = Query(2015, description="Year"),
    crops: Optional[str] = Query(None, description="Comma-separated crop list"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get correlation matrix between crop yields across districts.
    
    Helps identify:
    - Crop substitution patterns (negative correlation)
    - Complementary crops (positive correlation)
    """
    service = AdvancedAnalyticsService(db)
    
    crop_list = None
    if crops:
        crop_list = [c.strip() for c in crops.split(",")]
    
    result = await service.get_crop_correlations(state, year, crop_list)
    
    return result


@router.get("/district-rankings")
async def get_district_rankings(
    state: str = Query(..., description="State name"),
    crop: str = Query("rice", description="Crop to rank"),
    year: int = Query(2020, description="Year"),
    metric: str = Query("yield", description="Metric: yield, area, or production"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get district rankings by crop performance.
    """
    service = AdvancedAnalyticsService(db)
    rankings = await service.get_district_rankings(state, crop, year, metric)
    
    return {
        "state": state,
        "crop": crop,
        "year": year,
        "metric": metric,
        "total_districts": len(rankings),
        "rankings": rankings
    }


@router.get("/yoy-growth")
async def get_yoy_growth(
    cdk: str = Query(..., description="Canonical District Key"),
    crop: str = Query("rice", description="Crop name"),
    start_year: int = Query(2010, description="Start year"),
    end_year: int = Query(2020, description="End year"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get year-over-year yield growth rates.
    """
    service = AdvancedAnalyticsService(db)
    growth_data = await service.get_yoy_growth(cdk, crop, start_year, end_year)
    
    # Calculate summary stats
    yoy_values = [d['yoy_growth'] for d in growth_data if d['yoy_growth'] is not None]
    avg_growth = sum(yoy_values) / len(yoy_values) if yoy_values else 0
    positive_years = sum(1 for y in yoy_values if y > 0)
    
    return {
        "cdk": cdk,
        "crop": crop,
        "period": f"{start_year}-{end_year}",
        "data": growth_data,
        "summary": {
            "average_yoy_growth_percent": round(avg_growth, 2),
            "positive_growth_years": positive_years,
            "negative_growth_years": len(yoy_values) - positive_years
        }
    }


@router.get("/seasonal-comparison")
async def get_seasonal_comparison(
    cdk: str = Query(..., description="Canonical District Key"),
    crop: str = Query("rice", description="Crop name"),
    year: int = Query(2015, description="Year"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Compare Kharif vs Rabi season yields.
    Only available for DES data (1998+).
    """
    service = AdvancedAnalyticsService(db)
    result = await service.get_seasonal_comparison(cdk, crop, year)
    
    return result


@router.get("/summary")
async def get_analytics_summary(
    cdk: str = Query(..., description="Canonical District Key"),
    year: int = Query(2020, description="Year"),
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Get comprehensive analytics summary for a district.
    """
    service = AdvancedAnalyticsService(db)
    
    # Gather multiple analytics
    diversification = await service.get_crop_diversification(cdk, year)
    rice_trend = await service.get_yield_trend(cdk, "rice", year - 10, year)
    wheat_trend = await service.get_yield_trend(cdk, "wheat", year - 10, year)
    
    return {
        "cdk": cdk,
        "year": year,
        "diversification": {
            "index": diversification.simpson_index if diversification else None,
            "num_crops": diversification.num_crops if diversification else 0,
            "dominant_crop": diversification.dominant_crop if diversification else None
        } if diversification else None,
        "trends": {
            "rice": {
                "cagr": rice_trend.cagr if rice_trend else None,
                "trend": rice_trend.trend if rice_trend else None
            } if rice_trend else None,
            "wheat": {
                "cagr": wheat_trend.cagr if wheat_trend else None,
                "trend": wheat_trend.trend if wheat_trend else None
            } if wheat_trend else None
        },
        "data_source": "Hybrid (ICRISAT 1966-1997 + DES 1998-2021)"
    }

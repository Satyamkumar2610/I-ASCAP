"""
Advanced Analytics Service for I-ASCAP.

Provides data science-driven insights:
- Crop Diversification Index (CDI)
- Yield Trend Analysis (CAGR, volatility)
- Rainfall-Yield Correlation
- Split Impact Comparison
- Crop Correlation Matrix
- District Performance Rankings

Updated to use lgd_code/district_lgd schema.
"""

import asyncpg
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import math


@dataclass
class YieldTrend:
    """Yield trend analysis results."""
    crop: str
    start_year: int
    end_year: int
    start_yield: float
    end_yield: float
    cagr: float  # Compound Annual Growth Rate
    volatility: float  # Standard deviation of YoY changes
    trend: str  # "increasing", "decreasing", "stable"


@dataclass
class CropDiversification:
    """Crop diversification index for a district."""
    cdk: str
    year: int
    herfindahl_index: float  # Market concentration (0-1, lower = more diverse)
    simpson_index: float  # Diversity index (0-1, higher = more diverse)
    num_crops: int
    dominant_crop: str
    dominant_share: float


class AdvancedAnalyticsService:
    """Advanced analytics engine for agricultural data."""
    
    def __init__(self, db: asyncpg.Connection):
        self.db = db
    
    # ============================================================
    # CROP DIVERSIFICATION INDEX
    # ============================================================
    
    async def get_crop_diversification(
        self, 
        cdk: str, 
        year: int
    ) -> Optional[CropDiversification]:
        """
        Calculate Crop Diversification Index for a district-year.
        
        Uses Herfindahl-Hirschman Index (HHI) and Simpson's Diversity Index.
        """
        # Get area by crop for this district-year
        rows = await self.db.fetch("""
            SELECT 
                SPLIT_PART(variable_name, '_', 1) as crop,
                value as area
            FROM agri_metrics
            WHERE district_lgd::text = $1 
              AND year = $2 
              AND variable_name LIKE '%_area%'
              AND variable_name NOT LIKE '%_kharif%'
              AND variable_name NOT LIKE '%_rabi%'
              AND value > 0
            ORDER BY value DESC
        """, cdk, year)
        
        if not rows:
            return None
        
        # Calculate total area and shares
        total_area = sum(r['area'] for r in rows)
        if total_area == 0:
            return None
        
        shares = [(r['crop'], r['area'] / total_area) for r in rows]
        
        # Herfindahl-Hirschman Index (sum of squared shares)
        hhi = sum(s ** 2 for _, s in shares)
        
        # Simpson's Diversity Index (1 - HHI)
        simpson = 1 - hhi
        
        dominant_crop, dominant_share = shares[0]
        
        return CropDiversification(
            cdk=cdk,
            year=year,
            herfindahl_index=round(hhi, 4),
            simpson_index=round(simpson, 4),
            num_crops=len(rows),
            dominant_crop=dominant_crop,
            dominant_share=round(dominant_share * 100, 1)
        )
    
    # ============================================================
    # YIELD TREND ANALYSIS
    # ============================================================
    
    async def get_yield_trend(
        self, 
        cdk: str, 
        crop: str,
        start_year: int = 1990,
        end_year: int = 2020
    ) -> Optional[YieldTrend]:
        """
        Calculate yield trend with CAGR and volatility.
        """
        rows = await self.db.fetch("""
            SELECT year, value
            FROM agri_metrics
            WHERE district_lgd::text = $1 
              AND variable_name = $2
              AND year BETWEEN $3 AND $4
              AND value > 0
            ORDER BY year
        """, cdk, f"{crop}_yield", start_year, end_year)
        
        if len(rows) < 3:
            return None
        
        years = [r['year'] for r in rows]
        yields = [r['value'] for r in rows]
        
        # CAGR = (end/start)^(1/n) - 1
        n_years = years[-1] - years[0]
        if n_years > 0 and yields[0] > 0:
            cagr = (yields[-1] / yields[0]) ** (1 / n_years) - 1
        else:
            cagr = 0
        
        # Volatility (std dev of year-over-year percentage changes)
        yoy_changes = []
        for i in range(1, len(yields)):
            if yields[i-1] > 0:
                yoy_changes.append((yields[i] - yields[i-1]) / yields[i-1])
        
        if yoy_changes:
            mean_change = sum(yoy_changes) / len(yoy_changes)
            variance = sum((c - mean_change) ** 2 for c in yoy_changes) / len(yoy_changes)
            volatility = math.sqrt(variance)
        else:
            volatility = 0
        
        # Determine trend
        if cagr > 0.02:
            trend = "increasing"
        elif cagr < -0.02:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return YieldTrend(
            crop=crop,
            start_year=years[0],
            end_year=years[-1],
            start_yield=round(yields[0], 2),
            end_yield=round(yields[-1], 2),
            cagr=round(cagr * 100, 2),  # as percentage
            volatility=round(volatility * 100, 2),  # as percentage
            trend=trend
        )
    
    # ============================================================
    # SPLIT IMPACT ANALYSIS (Before/After Comparison)
    # ============================================================
    
    async def get_split_impact(
        self, 
        parent_cdk: str,
        child_cdks: List[str],
        split_year: int,
        crop: str,
        years_before: int = 5,
        years_after: int = 5
    ) -> Dict[str, Any]:
        """
        Compare agricultural performance before/after district split.
        """
        # Before split: parent district performance
        before_data = await self.db.fetch("""
            SELECT year, value
            FROM agri_metrics
            WHERE district_lgd::text = $1 
              AND variable_name = $2
              AND year BETWEEN $3 AND $4
              AND value > 0
            ORDER BY year
        """, parent_cdk, f"{crop}_yield", split_year - years_before, split_year - 1)
        
        before_yields = [r['value'] for r in before_data]
        before_avg = sum(before_yields) / len(before_yields) if before_yields else 0
        
        # After split: weighted average of children
        after_results = {}
        for child_cdk in child_cdks:
            after_data = await self.db.fetch("""
                SELECT year, value
                FROM agri_metrics
                WHERE district_lgd::text = $1 
                  AND variable_name = $2
                  AND year BETWEEN $3 AND $4
                  AND value > 0
                ORDER BY year
            """, child_cdk, f"{crop}_yield", split_year, split_year + years_after)
            
            after_yields = [r['value'] for r in after_data]
            after_results[child_cdk] = {
                'yields': after_yields,
                'avg': sum(after_yields) / len(after_yields) if after_yields else 0
            }
        
        # Calculate aggregate after-split performance
        all_after_avgs = [v['avg'] for v in after_results.values() if v['avg'] > 0]
        after_avg = sum(all_after_avgs) / len(all_after_avgs) if all_after_avgs else 0
        
        # Impact metrics
        absolute_change = after_avg - before_avg
        percent_change = (absolute_change / before_avg * 100) if before_avg > 0 else 0
        
        return {
            'parent_cdk': parent_cdk,
            'child_cdks': child_cdks,
            'split_year': split_year,
            'crop': crop,
            'before': {
                'years': [r['year'] for r in before_data],
                'yields': before_yields,
                'average': round(before_avg, 2)
            },
            'after': {
                'by_child': after_results,
                'combined_average': round(after_avg, 2)
            },
            'impact': {
                'absolute_change': round(absolute_change, 2),
                'percent_change': round(percent_change, 2),
                'assessment': 'positive' if percent_change > 5 else 'negative' if percent_change < -5 else 'neutral'
            }
        }
    
    # ============================================================
    # CROP CORRELATION MATRIX
    # ============================================================
    
    async def get_crop_correlations(
        self, 
        state: str,
        year: int,
        crops: List[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate correlation between crop areas/yields across districts.
        Helps identify crop substitution patterns.
        """
        if crops is None:
            crops = ['rice', 'wheat', 'maize', 'groundnut', 'cotton', 'sugarcane']
        
        # Get yield data for each crop across districts
        crop_data = {}
        for crop in crops:
            rows = await self.db.fetch("""
                SELECT m.district_lgd::text as cdk, m.value
                FROM agri_metrics m
                JOIN districts d ON m.district_lgd = d.lgd_code
                WHERE d.state_name = $1
                  AND m.year = $2
                  AND m.variable_name = $3
                  AND m.value > 0
            """, state, year, f"{crop}_yield")
            
            crop_data[crop] = {r['cdk']: r['value'] for r in rows}
        
        # Calculate pairwise correlations
        correlations = {}
        for i, crop1 in enumerate(crops):
            correlations[crop1] = {}
            for crop2 in crops:
                if crop1 == crop2:
                    correlations[crop1][crop2] = 1.0
                else:
                    # Find common districts
                    common = set(crop_data[crop1].keys()) & set(crop_data[crop2].keys())
                    if len(common) < 3:
                        correlations[crop1][crop2] = None
                        continue
                    
                    vals1 = [crop_data[crop1][cdk] for cdk in common]
                    vals2 = [crop_data[crop2][cdk] for cdk in common]
                    
                    # Pearson correlation
                    mean1 = sum(vals1) / len(vals1)
                    mean2 = sum(vals2) / len(vals2)
                    
                    cov = sum((v1 - mean1) * (v2 - mean2) for v1, v2 in zip(vals1, vals2))
                    std1 = math.sqrt(sum((v - mean1) ** 2 for v in vals1))
                    std2 = math.sqrt(sum((v - mean2) ** 2 for v in vals2))
                    
                    if std1 > 0 and std2 > 0:
                        corr = cov / (std1 * std2)
                        correlations[crop1][crop2] = round(corr, 3)
                    else:
                        correlations[crop1][crop2] = None
        
        return {
            'state': state,
            'year': year,
            'crops': crops,
            'correlations': correlations
        }
    
    # ============================================================
    # DISTRICT PERFORMANCE RANKINGS
    # ============================================================
    
    async def get_district_rankings(
        self, 
        state: str,
        crop: str,
        year: int,
        metric: str = 'yield'
    ) -> List[Dict[str, Any]]:
        """
        Rank districts by crop performance.
        """
        rows = await self.db.fetch("""
            SELECT 
                m.district_lgd::text as cdk,
                d.district_name,
                m.value
            FROM agri_metrics m
            JOIN districts d ON m.district_lgd = d.lgd_code
            WHERE d.state_name = $1
              AND m.variable_name = $2
              AND m.year = $3
              AND m.value > 0
            ORDER BY m.value DESC
        """, state, f"{crop}_{metric}", year)
        
        rankings = []
        for i, r in enumerate(rows, 1):
            rankings.append({
                'rank': i,
                'cdk': r['cdk'],
                'district': r['district_name'],
                'value': round(r['value'], 2),
            })
        
        return rankings
    
    # ============================================================
    # YEAR-OVER-YEAR GROWTH ANALYSIS
    # ============================================================
    
    async def get_yoy_growth(
        self, 
        cdk: str,
        crop: str,
        start_year: int = 2010,
        end_year: int = 2020
    ) -> List[Dict[str, Any]]:
        """
        Calculate year-over-year growth rates.
        """
        rows = await self.db.fetch("""
            SELECT year, value
            FROM agri_metrics
            WHERE district_lgd::text = $1 
              AND variable_name = $2
              AND year BETWEEN $3 AND $4
              AND value > 0
            ORDER BY year
        """, cdk, f"{crop}_yield", start_year, end_year)
        
        growth_data = []
        prev_value = None
        
        for r in rows:
            yoy = None
            if prev_value and prev_value > 0:
                yoy = round((r['value'] - prev_value) / prev_value * 100, 2)
            
            growth_data.append({
                'year': r['year'],
                'yield': round(r['value'], 2),
                'yoy_growth': yoy
            })
            prev_value = r['value']
        
        return growth_data
    
    # ============================================================
    # SEASONAL COMPARISON (Kharif vs Rabi)
    # ============================================================
    
    async def get_seasonal_comparison(
        self, 
        cdk: str,
        crop: str,
        year: int
    ) -> Dict[str, Any]:
        """
        Compare Kharif vs Rabi season performance.
        Only works for DES data which has seasonal breakdown.
        """
        kharif = await self.db.fetchrow("""
            SELECT value FROM agri_metrics
            WHERE district_lgd::text = $1 AND year = $2 
              AND variable_name LIKE $3
        """, cdk, year, f"{crop}_yield_kharif")
        
        rabi = await self.db.fetchrow("""
            SELECT value FROM agri_metrics
            WHERE district_lgd::text = $1 AND year = $2 
              AND variable_name LIKE $3
        """, cdk, year, f"{crop}_yield_rabi")
        
        kharif_val = kharif['value'] if kharif else None
        rabi_val = rabi['value'] if rabi else None
        
        return {
            'cdk': cdk,
            'crop': crop,
            'year': year,
            'kharif_yield': round(kharif_val, 2) if kharif_val else None,
            'rabi_yield': round(rabi_val, 2) if rabi_val else None,
            'dominant_season': 'kharif' if (kharif_val or 0) > (rabi_val or 0) else 'rabi'
        }

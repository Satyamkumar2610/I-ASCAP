"""
Advanced Analytics Module for I-ASCAP.
Provides Crop Diversification Index, Yield Efficiency, and Risk Profiling.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

from app.analytics.statistics import get_analyzer


class RiskCategory(str, Enum):
    """Risk classification based on volatility."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class DiversificationResult:
    """Result of crop diversification analysis."""
    cdi: float  # Crop Diversification Index (0-1)
    interpretation: str  # Human-readable interpretation
    dominant_crop: Optional[str]  # Most grown crop
    dominant_share: float  # Share of dominant crop (0-1)
    crop_count: int  # Number of crops grown
    breakdown: Dict[str, float]  # Crop -> share mapping


@dataclass
class EfficiencyResult:
    """Result of yield efficiency analysis."""
    efficiency_score: float  # 0-1, how close to potential
    district_yield: float
    potential_yield: float  # 95th percentile in state
    yield_gap: float  # Absolute difference
    yield_gap_pct: float  # Percentage gap
    percentile_rank: float  # District's rank within state


@dataclass
class RiskProfile:
    """Risk profile for a district."""
    risk_category: RiskCategory
    volatility_score: float  # CV percentage
    reliability_rating: str  # A/B/C/D/F
    trend_stability: str  # Stable/Unstable
    worst_year: Optional[int]
    best_year: Optional[int]


class AdvancedAnalyzer:
    """
    Advanced analytics for agricultural data.
    
    Provides:
    - Crop Diversification Index (CDI)
    - Yield Efficiency/Gap Analysis
    - Volatility and Risk Profiling
    """
    
    def __init__(self):
        self.stats = get_analyzer()
    
    # -------------------------------------------------------------------------
    # Crop Diversification Index (CDI)
    # -------------------------------------------------------------------------
    
    def calculate_diversification(
        self,
        crop_areas: Dict[str, float],
    ) -> DiversificationResult:
        """
        Calculate Crop Diversification Index using Simpson's Diversity Index.
        
        Formula: CDI = 1 - Σ(pi²) where pi = proportion of crop i
        
        Args:
            crop_areas: Dictionary of crop name -> area in hectares
        
        Returns:
            DiversificationResult with CDI and interpretation
        """
        if not crop_areas:
            return DiversificationResult(
                cdi=0,
                interpretation="No crop data available",
                dominant_crop=None,
                dominant_share=0,
                crop_count=0,
                breakdown={},
            )
        
        total_area = sum(crop_areas.values())
        if total_area == 0:
            return DiversificationResult(
                cdi=0,
                interpretation="Zero total area",
                dominant_crop=None,
                dominant_share=0,
                crop_count=0,
                breakdown={},
            )
        
        # Calculate proportions and sum of squares
        proportions = {crop: area / total_area for crop, area in crop_areas.items()}
        sum_of_squares = sum(p ** 2 for p in proportions.values())
        
        # Simpson's Diversity Index
        cdi = 1 - sum_of_squares
        
        # Find dominant crop
        dominant_crop = max(crop_areas, key=crop_areas.get)
        dominant_share = proportions[dominant_crop]
        
        # Interpretation
        if cdi < 0.2:
            interpretation = "Monoculture risk - highly concentrated in single crop"
        elif cdi < 0.4:
            interpretation = "Low diversification - 1-2 major crops dominate"
        elif cdi < 0.6:
            interpretation = "Moderate diversification - reasonable crop mix"
        elif cdi < 0.8:
            interpretation = "Good diversification - well balanced portfolio"
        else:
            interpretation = "Excellent diversification - highly resilient crop mix"
        
        return DiversificationResult(
            cdi=round(cdi, 4),
            interpretation=interpretation,
            dominant_crop=dominant_crop,
            dominant_share=round(dominant_share, 4),
            crop_count=len(crop_areas),
            breakdown={k: round(v, 4) for k, v in proportions.items()},
        )
    
    # -------------------------------------------------------------------------
    # Yield Efficiency / Gap Analysis
    # -------------------------------------------------------------------------
    
    def calculate_efficiency(
        self,
        district_yield: float,
        state_yields: List[float],
    ) -> EfficiencyResult:
        """
        Calculate yield efficiency compared to state potential.
        
        Potential yield = 95th percentile of state yields.
        
        Args:
            district_yield: Yield for the district
            state_yields: List of yields for all districts in state
        
        Returns:
            EfficiencyResult with efficiency score and gap
        """
        if not state_yields or district_yield <= 0:
            return EfficiencyResult(
                efficiency_score=0,
                district_yield=district_yield,
                potential_yield=0,
                yield_gap=0,
                yield_gap_pct=0,
                percentile_rank=0,
            )
        
        # Calculate potential (95th percentile)
        potential_yield = self.stats.percentile(state_yields, 95)
        
        # Calculate efficiency
        efficiency = min(district_yield / potential_yield, 1.0) if potential_yield > 0 else 0
        
        # Calculate gap
        yield_gap = potential_yield - district_yield
        yield_gap_pct = (yield_gap / potential_yield * 100) if potential_yield > 0 else 0
        
        # Percentile rank within state
        percentile_rank = self.stats.percentile_rank(district_yield, state_yields)
        
        return EfficiencyResult(
            efficiency_score=round(efficiency, 4),
            district_yield=round(district_yield, 2),
            potential_yield=round(potential_yield, 2),
            yield_gap=round(max(0, yield_gap), 2),
            yield_gap_pct=round(max(0, yield_gap_pct), 2),
            percentile_rank=round(percentile_rank, 2),
        )
    
    # -------------------------------------------------------------------------
    # Risk Profiling
    # -------------------------------------------------------------------------
    
    def calculate_risk_profile(
        self,
        yearly_values: Dict[int, float],
    ) -> RiskProfile:
        """
        Calculate risk profile based on historical volatility.
        
        Args:
            yearly_values: Dictionary of year -> metric value
        
        Returns:
            RiskProfile with category and detailed metrics
        """
        if not yearly_values or len(yearly_values) < 3:
            return RiskProfile(
                risk_category=RiskCategory.MEDIUM,
                volatility_score=0,
                reliability_rating="N/A",
                trend_stability="Insufficient data",
                worst_year=None,
                best_year=None,
            )
        
        years = sorted(yearly_values.keys())
        values = [yearly_values[y] for y in years]
        
        # Calculate volatility (CV)
        cv = self.stats.coefficient_of_variation(values)
        
        # Categorize risk
        if cv < 10:
            risk_category = RiskCategory.LOW
            reliability_rating = "A"
        elif cv < 20:
            risk_category = RiskCategory.MEDIUM
            reliability_rating = "B"
        elif cv < 35:
            risk_category = RiskCategory.HIGH
            reliability_rating = "C"
        else:
            risk_category = RiskCategory.CRITICAL
            reliability_rating = "D"
        
        # Trend stability
        trend = self.stats.linear_trend(values)
        if trend.r_squared > 0.7 and trend.significant:
            trend_stability = "Stable trend"
        elif trend.r_squared > 0.4:
            trend_stability = "Moderate stability"
        else:
            trend_stability = "Unstable/volatile"
        
        # Best and worst years
        worst_year = years[values.index(min(values))]
        best_year = years[values.index(max(values))]
        
        return RiskProfile(
            risk_category=risk_category,
            volatility_score=round(cv, 2),
            reliability_rating=reliability_rating,
            trend_stability=trend_stability,
            worst_year=worst_year,
            best_year=best_year,
        )
    
    # -------------------------------------------------------------------------
    # Batch Analysis Helpers
    # -------------------------------------------------------------------------
    
    def analyze_district_complete(
        self,
        crop_areas: Dict[str, float],
        district_yield: float,
        state_yields: List[float],
        yearly_values: Dict[int, float],
    ) -> Dict[str, Any]:
        """
        Perform complete advanced analysis for a district.
        
        Returns combined results for diversification, efficiency, and risk.
        """
        diversification = self.calculate_diversification(crop_areas)
        efficiency = self.calculate_efficiency(district_yield, state_yields)
        risk = self.calculate_risk_profile(yearly_values)
        
        return {
            "diversification": asdict(diversification),
            "efficiency": asdict(efficiency),
            "risk": {
                **asdict(risk),
                "risk_category": risk.risk_category.value,
            },
        }


def get_advanced_analyzer() -> AdvancedAnalyzer:
    """Get an advanced analyzer instance."""
    return AdvancedAnalyzer()

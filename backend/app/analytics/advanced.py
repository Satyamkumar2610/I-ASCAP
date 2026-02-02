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


@dataclass
class HistoricalEfficiencyResult:
    """Result of historical efficiency analysis."""
    efficiency_ratio: float  # current / historical_mean
    current_yield: float
    historical_mean: float  # 10-year mean
    yield_diff: float  # current - mean
    is_above_trend: bool


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

    def calculate_historical_efficiency(
        self,
        current_yield: float,
        historical_yields: List[float],
    ) -> HistoricalEfficiencyResult:
        """
        Calculate efficiency compared to district's own history (10-year mean).
        
        Args:
            current_yield: Yield for the current year
            historical_yields: List of yields for previous years (up to 10)
        
        Returns:
            HistoricalEfficiencyResult
        """
        if not historical_yields:
            return HistoricalEfficiencyResult(
                efficiency_ratio=0,
                current_yield=current_yield,
                historical_mean=0,
                yield_diff=0,
                is_above_trend=False,
            )
        
        # Calculate 10-year mean (or available)
        mean_yield = sum(historical_yields) / len(historical_yields)
        
        if mean_yield == 0:
             return HistoricalEfficiencyResult(
                efficiency_ratio=0,
                current_yield=current_yield,
                historical_mean=0,
                yield_diff=0,
                is_above_trend=False,
            )
            
        ratio = current_yield / mean_yield
        diff = current_yield - mean_yield
        
        return HistoricalEfficiencyResult(
            efficiency_ratio=round(ratio, 4),
            current_yield=round(current_yield, 2),
            historical_mean=round(mean_yield, 2),
            yield_diff=round(diff, 2),
            is_above_trend=diff > 0
        )
    
    # -------------------------------------------------------------------------
    # Risk Profiling
    # -------------------------------------------------------------------------
    
@dataclass
class ResilienceResult:
    """Result of resilience analysis."""
    resilience_score: float  # 0-1 composite score
    volatility_component: float  # normalized (1-CV)
    retention_component: float  # P10/Median ratio
    drought_risk: str  # Low/Med/High based on retention
    reliability_rating: str  # A-F

@dataclass
class GrowthResult:
    """Result of growth matrix analysis."""
    cagr_5y: float
    mean_yield_5y: float
    matrix_quadrant: str  # Star, Cash Cow, Emerging, Lagging
    trend_direction: str


class AdvancedAnalyzer:
# ... (existing init) ...
    # -------------------------------------------------------------------------
    # Resilience & Growth
    # -------------------------------------------------------------------------

    def calculate_resilience(self, yearly_values: Dict[int, float]) -> ResilienceResult:
        """
        Calculate resilience score.
        Score = 0.6 * (1 - CV_norm) + 0.4 * Retention_Ratio
        Retention_Ratio = 10th Percentile Yield / Median Yield (Proxy for drought resistance)
        """
        if not yearly_values or len(yearly_values) < 5:
             return ResilienceResult(0, 0, 0, "N/A", "N/A")

        values = list(yearly_values.values())
        
        # 1. Volatility Component
        cv = self.stats.coefficient_of_variation(values)
        # Normalize CV: Assume CV > 40% is 0 score, CV < 5% is 1 score.
        cv_norm = max(0, min(1, (40 - cv) / 35))
        
        # 2. Retention Component (Drought Proxy)
        median = self.stats.percentile(values, 50)
        p10 = self.stats.percentile(values, 10)
        retention = (p10 / median) if median > 0 else 0
        retention = min(retention, 1.0)
        
        # Composite Score
        score = (0.6 * cv_norm) + (0.4 * retention)
        
        # Categorization
        if retention < 0.6: drought_risk = "High"
        elif retention < 0.8: drought_risk = "Medium"
        else: drought_risk = "Low"
        
        rating = "A" if score > 0.8 else "B" if score > 0.6 else "C" if score > 0.4 else "D"
        
        return ResilienceResult(
            resilience_score=round(score, 2),
            volatility_component=round(cv_norm, 2),
            retention_component=round(retention, 2),
            drought_risk=drought_risk,
            reliability_rating=rating
        )

    def calculate_growth_matrix(self, yearly_values: Dict[int, float]) -> GrowthResult:
        """
        Calculate Compound Annual Growth Rate (CAGR) and classify matrix quadrant.
        """
        if not yearly_values or len(yearly_values) < 5:
            return GrowthResult(0, 0, "Insufficient Data", "Flat")
            
        sorted_years = sorted(yearly_values.keys())
        recent_years = sorted_years[-5:] # Last 5 years
        
        start_val = yearly_values[recent_years[0]]
        end_val = yearly_values[recent_years[-1]]
        years = len(recent_years) - 1
        
        # CAGR Formula: (End/Start)^(1/n) - 1
        if start_val > 0 and years > 0:
            cagr = (end_val / start_val) ** (1/years) - 1
        else:
            cagr = 0
            
        mean_yield = sum(yearly_values[y] for y in recent_years) / len(recent_years)
        
        # Determine Quadrant (Thresholds need state context, but using generic for now)
        # Assuming "High Growth" > 2%, "High Yield" > ??? (Relative to what? Self-history?)
        # Ideally this needs State Mean context. For now, we return raw values.
        # We'll use a placeholder classification based on CAGR.
        
        if cagr > 0.02:
             quadrant = "Growth Leader"
        elif cagr > 0:
             quadrant = "Stable"
        else:
             quadrant = "Declining"
             
        return GrowthResult(
            cagr_5y=round(cagr * 100, 2),
            mean_yield_5y=round(mean_yield, 2),
            matrix_quadrant=quadrant,
            trend_direction="Positive" if cagr > 0 else "Negative"
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

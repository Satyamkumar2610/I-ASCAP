"""
Impact Analyzer: Compare pre/post split periods with statistical rigor.
"""
from typing import List, Optional
from dataclasses import dataclass

from app.analytics.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_cv,
    calculate_cagr_from_series,
)
from app.analytics.harmonizer import HarmonizedPoint
from app.schemas.common import PeriodStats, ImpactStats, UncertaintyBounds


@dataclass
class ImpactResult:
    """Complete impact analysis result."""
    pre_stats: PeriodStats
    post_stats: PeriodStats
    impact: ImpactStats
    split_year: int
    warnings: List[str]


class ImpactAnalyzer:
    """
    Analyzes the impact of administrative boundary changes on metrics.
    
    Compares pre-split and post-split periods to quantify:
    - Changes in mean performance
    - Changes in stability (CV)
    - Growth dynamics (CAGR)
    - Divergence with uncertainty bounds
    """
    
    def __init__(self, min_observations: int = 3):
        """
        Args:
            min_observations: Minimum data points required per period
        """
        self.min_observations = min_observations
    
    def analyze(
        self,
        timeline: List[HarmonizedPoint],
        split_year: int,
        uncertainty: Optional[UncertaintyBounds] = None,
    ) -> ImpactResult:
        """
        Perform impact analysis on a harmonized timeline.
        
        Args:
            timeline: Merged pre/post timeline with values
            split_year: Year of administrative change
            uncertainty: Optional pre-computed uncertainty bounds
            
        Returns:
            ImpactResult with statistics and warnings
        """
        warnings = []
        
        # Split into pre and post periods
        pre_values = [p.value for p in timeline if p.year < split_year]
        post_values = [p.value for p in timeline if p.year >= split_year]
        
        # Check data sufficiency
        if len(pre_values) < self.min_observations:
            warnings.append(
                f"Pre-split period has only {len(pre_values)} observations "
                f"(minimum recommended: {self.min_observations})"
            )
        
        if len(post_values) < self.min_observations:
            warnings.append(
                f"Post-split period has only {len(post_values)} observations "
                f"(minimum recommended: {self.min_observations})"
            )
        
        # Calculate period statistics
        pre_stats = self._calculate_period_stats(pre_values)
        post_stats = self._calculate_period_stats(post_values)
        
        # Calculate impact
        impact = self._calculate_impact(pre_stats, post_stats, uncertainty)
        
        # Check for method mixing
        pre_methods = set(p.method for p in timeline if p.year < split_year)
        post_methods = set(p.method for p in timeline if p.year >= split_year)
        
        if "raw" in post_methods and len(post_methods) > 1:
            warnings.append(
                "Post-split data mixed raw and harmonized values"
            )
        
        return ImpactResult(
            pre_stats=pre_stats,
            post_stats=post_stats,
            impact=impact,
            split_year=split_year,
            warnings=warnings,
        )
    
    def _calculate_period_stats(self, values: List[float]) -> PeriodStats:
        """Calculate statistics for a single period."""
        if not values:
            return PeriodStats(
                mean=0,
                variance=0,
                cv=0,
                cagr=0,
                n_observations=0,
            )
        
        return PeriodStats(
            mean=calculate_mean(values),
            variance=calculate_variance(values),
            cv=calculate_cv(values),
            cagr=calculate_cagr_from_series(values),
            n_observations=len(values),
        )
    
    def _calculate_impact(
        self,
        pre: PeriodStats,
        post: PeriodStats,
        uncertainty: Optional[UncertaintyBounds] = None,
    ) -> ImpactStats:
        """Calculate comparative impact between periods."""
        absolute_change = post.mean - pre.mean
        
        if pre.mean != 0:
            pct_change = (absolute_change / pre.mean) * 100
        else:
            pct_change = 0 if post.mean == 0 else 100
        
        return ImpactStats(
            absolute_change=absolute_change,
            pct_change=pct_change,
            uncertainty=uncertainty,
        )
    
    def analyze_from_values(
        self,
        pre_values: List[float],
        post_values: List[float],
        split_year: int,
    ) -> ImpactResult:
        """
        Convenience method to analyze from raw value lists.
        
        Args:
            pre_values: Pre-split period values
            post_values: Post-split period values
            split_year: Year of split
            
        Returns:
            ImpactResult
        """
        warnings = []
        
        if len(pre_values) < self.min_observations:
            warnings.append(
                f"Pre-split period has only {len(pre_values)} observations"
            )
        
        if len(post_values) < self.min_observations:
            warnings.append(
                f"Post-split period has only {len(post_values)} observations"
            )
        
        pre_stats = self._calculate_period_stats(pre_values)
        post_stats = self._calculate_period_stats(post_values)
        impact = self._calculate_impact(pre_stats, post_stats)
        
        return ImpactResult(
            pre_stats=pre_stats,
            post_stats=post_stats,
            impact=impact,
            split_year=split_year,
            warnings=warnings,
        )

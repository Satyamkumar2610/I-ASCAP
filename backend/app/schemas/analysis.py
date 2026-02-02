"""
Analysis Schemas: Split impact and advanced analytics responses.
"""
from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

from app.schemas.common import ProvenanceMetadata, PeriodStats, ImpactStats


class AnalysisMode(str, Enum):
    """Analysis comparison modes."""
    BEFORE_AFTER = "before_after"
    ENTITY_COMPARISON = "entity_comparison"


class SeriesMeta(BaseModel):
    """Metadata for a chart series."""
    id: str
    label: str
    style: str = Field(default="solid", description="Line style: solid, dashed, dotted")


class TimelinePoint(BaseModel):
    """Single point in a timeline series."""
    year: int
    value: Optional[float] = None
    # Additional series values stored as dict for multi-series
    series_values: Optional[Dict[str, float]] = None


class AdvancedStats(BaseModel):
    """Complete advanced statistics for split impact analysis."""
    pre: PeriodStats = Field(..., description="Pre-split period statistics")
    post: PeriodStats = Field(..., description="Post-split period statistics")
    impact: ImpactStats = Field(..., description="Comparative impact metrics")


class AnalysisMeta(BaseModel):
    """Metadata about the analysis performed."""
    split_year: int
    mode: AnalysisMode
    metric: str
    variable: str
    parent_cdk: str
    children_cdks: List[str]


class SplitImpactRequest(BaseModel):
    """Request parameters for split impact analysis."""
    parent_cdk: str = Field(
        ..., 
        description="Parent district CDK",
        min_length=5,
        max_length=64,
        pattern=r"^[A-Za-z0-9_]+$"
    )
    children_cdks: List[str] = Field(
        ..., 
        description="Children district CDKs",
        min_length=1,
        max_length=20
    )
    split_year: int = Field(
        ..., 
        description="Year of split event",
        ge=1947,
        le=2025
    )
    domain: str = Field(
        default="agriculture", 
        description="Metric domain",
        max_length=30
    )
    variable: str = Field(
        default="wheat_yield", 
        description="Variable to analyze",
        max_length=50
    )
    mode: AnalysisMode = Field(default=AnalysisMode.BEFORE_AFTER)


class SplitImpactResponse(BaseModel):
    """
    Complete response for split impact analysis.
    Includes timeline data, series metadata, advanced statistics,
    and reproducibility provenance.
    """
    data: List[Dict[str, Any]] = Field(
        default_factory=list, 
        description="Timeline data points"
    )
    series: List[SeriesMeta] = Field(
        default_factory=list, 
        description="Series metadata for charting"
    )
    advanced_stats: Optional[AdvancedStats] = Field(
        None, 
        description="Statistical analysis (only for before_after mode)"
    )
    meta: AnalysisMeta = Field(..., description="Analysis metadata")
    provenance: ProvenanceMetadata = Field(..., description="Reproducibility metadata")


class StateSummary(BaseModel):
    """Summary statistics for a state."""
    state: str
    total_districts: int
    boundary_changes: int
    data_coverage: str = Field(default="High")


class SummaryResponse(BaseModel):
    """Response for summary endpoint."""
    states: List[str]
    stats: Dict[str, StateSummary]

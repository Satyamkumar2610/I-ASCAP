"""
Metric Schemas: Domain-agnostic observation data.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MetricDomain(str, Enum):
    """Supported metric domains."""
    AGRICULTURE = "agriculture"
    CLIMATE = "climate"
    HEALTH = "health"
    SOCIOECONOMIC = "socioeconomic"


class MetricPoint(BaseModel):
    """Single observation point."""
    cdk: str = Field(..., description="District CDK")
    year: int = Field(..., description="Observation year")
    variable: str = Field(..., description="Variable name (e.g., wheat_yield)")
    value: float = Field(..., description="Observed value")
    unit: Optional[str] = Field(None, description="Measurement unit")
    source: Optional[str] = Field(None, description="Dataset source")
    method: Optional[str] = Field(None, description="Harmonization method if derived")


class MetricTimeSeries(BaseModel):
    """Time series for a single district and variable."""
    cdk: str
    district_name: Optional[str] = None
    variable: str
    unit: Optional[str] = None
    data: List[dict] = Field(default_factory=list, description="List of {year, value} points")


class MetricQueryResult(BaseModel):
    """Result of a metrics query."""
    total: int
    items: List[MetricPoint] = Field(default_factory=list)


class AggregatedMetric(BaseModel):
    """Metric value with district metadata for choropleth display."""
    cdk: str
    state: str
    district: str
    value: float
    metric: str
    method: Optional[str] = Field(None, description="Backcast or Raw")
    geo_key: Optional[str] = Field(None, description="Pre-computed GeoJSON key (DISTRICT|STATE) for map visualization")

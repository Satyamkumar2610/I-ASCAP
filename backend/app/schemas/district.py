"""
District Schemas: Temporal entities with validity periods.
"""
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class District(BaseModel):
    """
    District as a temporal entity in the lineage graph.
    Tracks validity period for historical boundary awareness.
    """
    cdk: str = Field(..., description="Canonical District Key (immutable identifier)")
    name: str = Field(..., description="District display name")
    state: str = Field(..., description="Parent state name")
    valid_from: Optional[int] = Field(None, description="Year boundary became effective")
    valid_to: Optional[int] = Field(None, description="Year boundary ceased (null = current)")
    geometry: Optional[Any] = Field(None, description="GeoJSON geometry (when requested)")
    
    class Config:
        from_attributes = True


class DistrictList(BaseModel):
    """List of districts with count."""
    total: int = Field(..., description="Total number of districts")
    items: List[District] = Field(default_factory=list)


class DistrictGeoJSON(BaseModel):
    """GeoJSON FeatureCollection for districts."""
    type: str = Field(default="FeatureCollection")
    features: List[Any] = Field(default_factory=list)

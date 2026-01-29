"""
Analysis Service: Orchestrates split impact analysis.
Coordinates between repositories and analytics engine.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

import asyncpg

from app.repositories.district_repo import DistrictRepository
from app.repositories.metric_repo import MetricRepository
from app.repositories.lineage_repo import LineageRepository
from app.analytics.harmonizer import BoundaryHarmonizer
from app.analytics.impact_analyzer import ImpactAnalyzer
from app.analytics.uncertainty import calculate_impact_uncertainty
from app.schemas.common import ProvenanceMetadata, PeriodStats, ImpactStats
from app.schemas.analysis import (
    SplitImpactResponse, 
    AdvancedStats, 
    SeriesMeta, 
    AnalysisMeta,
    AnalysisMode,
)
from app.schemas.lineage import SplitEventSummary
from app.config import get_settings

settings = get_settings()


class AnalysisService:
    """
    Service for split impact analysis.
    Orchestrates data fetching, harmonization, and statistical analysis.
    """
    
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn
        self.district_repo = DistrictRepository(conn)
        self.metric_repo = MetricRepository(conn)
        self.lineage_repo = LineageRepository()
        self.harmonizer = BoundaryHarmonizer()
        self.impact_analyzer = ImpactAnalyzer()
    
    async def get_state_summary(self) -> Dict[str, Any]:
        """Get summary statistics for all states."""
        states = await self.district_repo.get_states()
        counts = await self.district_repo.count_by_state()
        cdk_to_state = {
            cdk: meta["state"] 
            for cdk, meta in (await self.district_repo.get_cdk_to_meta_map()).items()
        }
        
        # Count boundary changes per state from lineage
        events = self.lineage_repo.get_all_events()
        state_changes: Dict[str, set] = {}
        
        for e in events:
            state = cdk_to_state.get(e.parent_cdk)
            if state:
                if state not in state_changes:
                    state_changes[state] = set()
                state_changes[state].add(e.parent_cdk)
        
        stats = {}
        for state in states:
            stats[state] = {
                "state": state,
                "total_districts": counts.get(state, 0),
                "boundary_changes": len(state_changes.get(state, set())),
                "data_coverage": "High",
            }
        
        return {"states": states, "stats": stats}
    
    async def get_split_events_for_state(self, state: str) -> List[SplitEventSummary]:
        """Get all split events for a state."""
        cdk_meta = await self.district_repo.get_cdk_to_meta_map()
        cdk_to_state = {cdk: meta["state"] for cdk, meta in cdk_meta.items()}
        
        events = self.lineage_repo.get_events_by_state(state, cdk_to_state)
        groups = self.lineage_repo.group_by_parent_year(events)
        
        results = []
        for key, group in groups.items():
            parent_name = cdk_meta.get(group["parent_cdk"], {}).get("name", group["parent_cdk"])
            children_list = list(group["children"])
            children_names = [cdk_meta.get(c, {}).get("name", c) for c in children_list]
            
            results.append(SplitEventSummary(
                id=f"{group['parent_cdk']}_{group['event_year']}",
                parent_cdk=group["parent_cdk"],
                parent_name=parent_name,
                split_year=group["event_year"],
                children_cdks=children_list,
                children_names=children_names,
                children_count=len(children_list),
                coverage="High",
            ))
        
        # Sort by year descending
        results.sort(key=lambda x: x.split_year, reverse=True)
        return results
    
    async def analyze_split_impact(
        self,
        parent_cdk: str,
        children_cdks: List[str],
        split_year: int,
        domain: str,
        variable: str,
        mode: str,
        query_hash: str,
    ) -> SplitImpactResponse:
        """
        Perform complete split impact analysis.
        
        Args:
            parent_cdk: Parent district CDK
            children_cdks: List of child CDKs
            split_year: Year of split
            domain: Metric domain (agriculture, climate, etc.)
            variable: Variable to analyze (e.g., wheat_yield)
            mode: Analysis mode (before_after or entity_comparison)
            query_hash: Hash of query params for provenance
            
        Returns:
            SplitImpactResponse with timeline, stats, and provenance
        """
        # Determine metric type from variable name
        metric_type = variable.split("_")[-1] if "_" in variable else "yield"
        
        # Build variable list for query
        base = variable.rsplit("_", 1)[0] if "_" in variable else variable
        variables = [f"{base}_area", f"{base}_production", f"{base}_yield"]
        
        # Fetch data
        all_cdks = [parent_cdk] + children_cdks
        data_map = await self.metric_repo.build_data_map(all_cdks, variables)
        
        timeline = []
        series_meta = []
        advanced_stats = None
        warnings = []
        
        if mode == "before_after":
            # Longitudinal reconstruction
            series_meta.append(SeriesMeta(
                id="value",
                label="Boundary Adjusted District",
                style="solid",
            ))
            
            years = sorted(data_map.keys())
            
            for year in years:
                year_data = data_map[year]
                value = None
                
                if year < split_year:
                    # Use parent data
                    if parent_cdk in year_data:
                        d = year_data[parent_cdk]
                        if metric_type == "area":
                            value = d.get("area")
                        elif metric_type == "production":
                            value = d.get("prod")
                        else:
                            value = d.get("yld")
                else:
                    # Reconstruct from children
                    sum_area = 0
                    sum_prod = 0
                    weighted_yld = 0
                    
                    for cdk in children_cdks:
                        if cdk in year_data:
                            d = year_data[cdk]
                            area = d.get("area", 0)
                            if area > 0:
                                sum_area += area
                                sum_prod += d.get("prod", 0)
                                weighted_yld += d.get("yld", 0) * area
                    
                    if sum_area > 0:
                        if metric_type == "area":
                            value = sum_area
                        elif metric_type == "production":
                            value = sum_prod
                        else:
                            value = weighted_yld / sum_area
                
                if value is not None and value > 0:
                    timeline.append({"year": year, "value": round(value, 2)})
            
            # Calculate advanced statistics
            if timeline:
                pre_values = [p["value"] for p in timeline if p["year"] < split_year]
                post_values = [p["value"] for p in timeline if p["year"] >= split_year]
                
                if pre_values and post_values:
                    result = self.impact_analyzer.analyze_from_values(
                        pre_values, post_values, split_year
                    )
                    
                    # Calculate uncertainty
                    uncertainty = calculate_impact_uncertainty(pre_values, post_values)
                    result.impact.uncertainty = uncertainty
                    
                    advanced_stats = AdvancedStats(
                        pre=result.pre_stats,
                        post=result.post_stats,
                        impact=result.impact,
                    )
                    
                    warnings.extend(result.warnings)
        
        else:
            # Entity comparison mode
            series_meta.append(SeriesMeta(id="parent", label=f"Parent ({parent_cdk})", style="solid"))
            for cdk in children_cdks:
                series_meta.append(SeriesMeta(id=cdk, label=f"Child ({cdk})", style="dashed"))
            
            years = sorted(data_map.keys())
            
            for year in years:
                year_data = data_map[year]
                row = {"year": year}
                
                # Parent value - show for all years (parent existed before split)
                if parent_cdk in year_data:
                    d = year_data[parent_cdk]
                    val = d.get("yld") if metric_type == "yield" else d.get(metric_type[:4], 0)
                    if val:
                        row["parent"] = round(val, 2)
                
                # Children values - ONLY show for years >= split_year
                # Children did not exist before the split, any pre-split data is invalid backcast
                if year >= split_year:
                    for cdk in children_cdks:
                        if cdk in year_data:
                            d = year_data[cdk]
                            val = d.get("yld") if metric_type == "yield" else d.get(metric_type[:4], 0)
                            if val:
                                row[cdk] = round(val, 2)
                
                if len(row) > 1:
                    timeline.append(row)
        
        # Build response
        meta = AnalysisMeta(
            split_year=split_year,
            mode=AnalysisMode(mode),
            metric=metric_type,
            variable=variable,
            parent_cdk=parent_cdk,
            children_cdks=children_cdks,
        )
        
        provenance = ProvenanceMetadata(
            dataset_version=settings.dataset_version,
            boundary_version=settings.boundary_version,
            query_hash=query_hash,
            generated_at=datetime.now(timezone.utc),
            harmonization_method="area_weighted" if mode == "before_after" else None,
            warnings=warnings,
        )
        
        return SplitImpactResponse(
            data=timeline,
            series=series_meta,
            advanced_stats=advanced_stats,
            meta=meta,
            provenance=provenance,
        )

"""
Metric Repository: Data access for agricultural/domain metrics.
"""
from typing import List, Dict, Optional, Tuple

import asyncpg

from app.repositories.base import BaseRepository
from app.schemas.metric import MetricPoint, AggregatedMetric
from app.cache import cached, CacheTTL


class MetricRepository(BaseRepository):
    """Repository for metric data access."""
    
    async def get_by_cdk_and_variables(
        self, 
        cdk: str, 
        variables: List[str]
    ) -> List[MetricPoint]:
        """Get time series for a district and set of variables."""
        query = """
            SELECT cdk, year, variable_name, value, source
            FROM agri_metrics
            WHERE cdk = $1 AND variable_name = ANY($2)
            ORDER BY year ASC
        """
        rows = await self.fetch_all(query, cdk, variables)
        
        return [
            MetricPoint(
                cdk=r["cdk"],
                year=r["year"],
                variable=r["variable_name"],
                value=float(r["value"]) if r["value"] else 0,
                source=r["source"],
            )
            for r in rows
        ]
    
    async def get_by_cdks_and_variables(
        self, 
        cdks: List[str], 
        variables: List[str]
    ) -> List[MetricPoint]:
        """Get metrics for multiple districts and variables."""
        query = """
            SELECT cdk, year, variable_name, value, source
            FROM agri_metrics
            WHERE cdk = ANY($1) AND variable_name = ANY($2)
            ORDER BY year ASC
        """
        rows = await self.fetch_all(query, cdks, variables)
        
        return [
            MetricPoint(
                cdk=r["cdk"],
                year=r["year"],
                variable=r["variable_name"],
                value=float(r["value"]) if r["value"] else 0,
                source=r["source"],
            )
            for r in rows
        ]
    
    @cached(ttl=CacheTTL.METRICS, prefix="metrics:year")
    async def get_by_year_and_variable(
        self, 
        year: int, 
        variable: str
    ) -> List[AggregatedMetric]:
        """Get all district values for a given year and variable."""
        query = """
            SELECT m.cdk, d.state_name, d.district_name, m.value, m.source
            FROM agri_metrics m
            JOIN districts d ON m.cdk = d.cdk
            WHERE m.year = $1 AND m.variable_name = $2
        """
        rows = await self.fetch_all(query, year, variable)
        
        return [
            AggregatedMetric(
                cdk=r["cdk"],
                state=r["state_name"] or "",
                district=r["district_name"] or "",
                value=float(r["value"]) if r["value"] else 0,
                metric=variable.split("_")[-1],  # Extract metric type
                method="Backcast" if r["source"] == "V1.5_Harmonized" else "Raw",
            )
            for r in rows
        ]
    
    @cached(ttl=CacheTTL.METRICS, prefix="metrics:ts")
    async def get_time_series_pivoted(
        self, 
        cdk: str, 
        crop: str
    ) -> List[Dict]:
        """Get pivoted time series {year, area, production, yield} for a crop."""
        variables = [f"{crop}_area", f"{crop}_production", f"{crop}_yield"]
        query = """
            SELECT year, variable_name, value
            FROM agri_metrics
            WHERE cdk = $1 AND variable_name = ANY($2)
            ORDER BY year ASC
        """
        rows = await self.fetch_all(query, cdk, variables)
        
        # Pivot data
        timeline: Dict[int, Dict] = {}
        for r in rows:
            year = r["year"]
            if year not in timeline:
                timeline[year] = {"year": year}
            
            var_name = r["variable_name"]
            if var_name.endswith("_area"):
                timeline[year]["area"] = float(r["value"]) if r["value"] else None
            elif var_name.endswith("_production"):
                timeline[year]["production"] = float(r["value"]) if r["value"] else None
            elif var_name.endswith("_yield"):
                timeline[year]["yield"] = float(r["value"]) if r["value"] else None
        
        return list(timeline.values())
    
    @cached(ttl=CacheTTL.SUMMARY, prefix="metrics:map")
    async def build_data_map(
        self, 
        cdks: List[str], 
        variables: List[str]
    ) -> Dict[int, Dict[str, Dict[str, float]]]:
        """
        Build nested map: year -> cdk -> {area, prod, yld}
        Used for boundary reconstruction calculations.
        """
        metrics = await self.get_by_cdks_and_variables(cdks, variables)
        
        data_map: Dict[int, Dict[str, Dict[str, float]]] = {}
        
        for m in metrics:
            year = m.year
            cdk = m.cdk
            
            if year not in data_map:
                data_map[year] = {}
            if cdk not in data_map[year]:
                data_map[year][cdk] = {"area": 0, "prod": 0, "yld": 0}
            
            if m.variable.endswith("_area"):
                data_map[year][cdk]["area"] = m.value
            elif m.variable.endswith("_production"):
                data_map[year][cdk]["prod"] = m.value
            elif m.variable.endswith("_yield"):
                data_map[year][cdk]["yld"] = m.value
        
        return data_map

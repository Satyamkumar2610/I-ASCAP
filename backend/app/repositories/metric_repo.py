"""
Metric Repository: Data access for agricultural/domain metrics.
"""
from typing import List, Dict


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
            SELECT cdk, year, variable_name, value
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
                source="Raw",
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
            SELECT cdk, year, variable_name, value
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
                source="Raw",
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
            SELECT m.cdk, d.state_name, d.district_name, m.value
            FROM agri_metrics m
            JOIN districts d ON m.cdk = d.cdk
            WHERE m.year = $1 AND m.variable_name = $2
            AND d.district_name != 'State Average'
        """
        rows = await self.fetch_all(query, year, variable)
        
        # Fallback: If no data found, try seasonal crop
        if not rows:
            season_map = {
                "rice": "kharif", "wheat": "rabi", "maize": "kharif", 
                "soyabean": "kharif", "groundnut": "kharif", "cotton": "kharif",
                "pearl_millet": "kharif", "sorghum": "kharif", "chickpea": "rabi"
            }
            # Variable format: crop_metric (e.g. rice_yield)
            base_parts = variable.split("_")
            if len(base_parts) >= 2:
                crop_name = base_parts[0]
                season = season_map.get(crop_name)
                
                if season:
                    seasonal_variable = f"{variable}_{season}"
                    rows = await self.fetch_all(query, year, seasonal_variable)
        
        if crop_name == "rice":
             # Additive Fallback: Fetch other seasons and merge
             # Prioritize: Base > Winter > Autumn > Summer
             existing_cdks = set(r["cdk"] for r in rows)
             
             additional_seasons = ["winter", "autumn", "summer"]
             for s in additional_seasons:
                 s_var = f"{variable}_{s}"
                 s_rows = await self.fetch_all(query, year, s_var)
                 
                 for sr in s_rows:
                     if sr["cdk"] not in existing_cdks:
                         # Add missing district from seasonal data
                         rows.append(sr)
                         existing_cdks.add(sr["cdk"])
        
        return [
            AggregatedMetric(
                cdk=r["cdk"],
                state=r["state_name"] or "",
                district=r["district_name"] or "",
                value=float(r["value"]) if r["value"] is not None else 0.0,
                metric=variable.split("_")[-1],
                method="Raw",
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
        
        # Fallback: If no data found, try seasonal crop
        if not rows:
            season_map = {
                "rice": "kharif",
                "wheat": "rabi",
                "maize": "kharif",
                "soyabean": "kharif",
                "groundnut": "kharif",
                "cotton": "kharif",
                "pearl_millet": "kharif",
                "sorghum": "kharif",
            }
            season = season_map.get(crop.lower())
            if season:
                variables = [f"{crop}_area_{season}", f"{crop}_production_{season}", f"{crop}_yield_{season}"]
                rows = await self.fetch_all(query, cdk, variables)
            
            # Extended Fallback for Rice Time Series
            if not rows and crop.lower() == "rice":
                for s in ["winter", "autumn", "summer"]:
                    if not rows:
                         s_vars = [f"{crop}_area_{s}", f"{crop}_production_{s}", f"{crop}_yield_{s}"]
                         rows = await self.fetch_all(query, cdk, s_vars)
                    else:
                        break
        
        # Pivot data
        timeline: Dict[int, Dict] = {}
        for r in rows:
            year = r["year"]
            if year not in timeline:
                timeline[year] = {"year": year}
            
            var_name = r["variable_name"]
            if var_name.endswith("_area"):
                timeline[year]["area"] = float(r["value"]) if r["value"] else 0
            elif var_name.endswith("_production"):
                timeline[year]["production"] = float(r["value"]) if r["value"] else 0
            elif var_name.endswith("_yield"):
                timeline[year]["yield"] = float(r["value"]) if r["value"] else 0
        
        # Post-process: Calculate yield if missing
        for year, data in timeline.items():
            if "yield" not in data or data["yield"] == 0:
                area = data.get("area", 0) or 0
                prod = data.get("production", 0) or 0
                if area > 0:
                     # Production is in Tonnes (from script we did *1000), Area in Ha (from script *1000)
                     # Yield = kg/ha = (Tonnes * 1000) / Ha
                     # Wait, script multiplied by 1000.
                     # Original: '000 Tonnes, '000 Ha.
                     # Stored: Tonnes, Ha.
                     # Yield = Tonnes/Ha = t/ha. Default expected is kg/ha?
                     # Let's check district data units. Usually kg/ha ~ 2000-4000.
                     # t/ha ~ 2-4.
                     # If I want kg/ha: (prod / area) * 1000
                     data["yield"] = round((prod / area) * 1000, 2)
            
            # Ensure none is 0 instead of None for chart safety
            if "yield" not in data:
                data["yield"] = 0
            if "area" not in data:
                data["area"] = 0
            if "production" not in data:
                data["production"] = 0
        
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

"""
IMD Rainfall Data Service.
Fetches and caches district-level rainfall normals from data.gov.in API.
"""

import httpx
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# IMD API Configuration
IMD_API_BASE = "https://api.data.gov.in/resource/d0419b03-b41b-4226-b48b-0bc92bf139f8"
IMD_API_KEY = "579b464db66ec23bdd0000011d0179460bed4f26443f90cf4bee20d0"
CACHE_TTL_HOURS = 24


@dataclass
class RainfallData:
    """District rainfall normals."""
    state: str
    district: str
    jan: float
    feb: float
    mar: float
    apr: float
    may: float
    jun: float
    jul: float
    aug: float
    sep: float
    oct: float
    nov: float
    dec: float
    annual: float
    monsoon_jjas: float  # Jun-Sep monsoon
    winter_jf: float  # Jan-Feb
    pre_monsoon_mam: float  # Mar-May
    post_monsoon_ond: float  # Oct-Dec


class RainfallService:
    """Service to fetch and cache IMD rainfall data."""
    
    def __init__(self):
        self._cache: Dict[str, RainfallData] = {}
        self._cache_time: Optional[datetime] = None
        self._loading = False
    
    def _normalize_name(self, name: str) -> str:
        """Normalize district/state names for matching."""
        return name.strip().upper().replace("&", "AND")
    
    def _make_key(self, state: str, district: str) -> str:
        """Create cache key from state and district."""
        return f"{self._normalize_name(district)}|{self._normalize_name(state)}"
    
    async def _fetch_all_records(self) -> List[Dict[str, Any]]:
        """Fetch all records from IMD API (paginated)."""
        all_records = []
        offset = 0
        limit = 100  # API appears to support this
        total = 641  # Known total from API
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while offset < total:
                url = f"{IMD_API_BASE}?api-key={IMD_API_KEY}&format=json&limit={limit}&offset={offset}"
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    data = response.json()
                    
                    records = data.get("records", [])
                    all_records.extend(records)
                    
                    # Update total if API provides it
                    if "total" in data:
                        total = int(data["total"])
                    
                    offset += limit
                    logger.info(f"Fetched {len(all_records)}/{total} rainfall records")
                    
                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch rainfall data: {e}")
                    break
        
        return all_records
    
    def _parse_float(self, value: Any) -> float:
        """Safely parse float from API response."""
        try:
            return float(value) if value else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    async def load_data(self, force: bool = False) -> int:
        """
        Load rainfall data from API and populate cache.
        
        Args:
            force: If True, reload even if cache is valid
        
        Returns:
            Number of records loaded
        """
        # Check if cache is still valid
        if not force and self._cache_time:
            age = datetime.now() - self._cache_time
            if age < timedelta(hours=CACHE_TTL_HOURS) and self._cache:
                return len(self._cache)
        
        # Prevent concurrent loading
        if self._loading:
            return len(self._cache)
        
        self._loading = True
        try:
            records = await self._fetch_all_records()
            
            new_cache = {}
            for record in records:
                state = record.get("state_ut", "")
                district = record.get("district", "")
                
                if not state or not district:
                    continue
                
                rainfall = RainfallData(
                    state=state,
                    district=district,
                    jan=self._parse_float(record.get("jan")),
                    feb=self._parse_float(record.get("feb")),
                    mar=self._parse_float(record.get("mar")),
                    apr=self._parse_float(record.get("apr")),
                    may=self._parse_float(record.get("may")),
                    jun=self._parse_float(record.get("jun")),
                    jul=self._parse_float(record.get("jul")),
                    aug=self._parse_float(record.get("aug")),
                    sep=self._parse_float(record.get("sep")),
                    oct=self._parse_float(record.get("oct")),
                    nov=self._parse_float(record.get("nov")),
                    dec=self._parse_float(record.get("dec")),
                    annual=self._parse_float(record.get("annual")),
                    monsoon_jjas=self._parse_float(record.get("jjas")),
                    winter_jf=self._parse_float(record.get("jan_feb")),
                    pre_monsoon_mam=self._parse_float(record.get("mam")),
                    post_monsoon_ond=self._parse_float(record.get("ond")),
                )
                
                key = self._make_key(state, district)
                new_cache[key] = rainfall
            
            self._cache = new_cache
            self._cache_time = datetime.now()
            logger.info(f"Loaded {len(self._cache)} rainfall records")
            
            return len(self._cache)
        finally:
            self._loading = False
    
    def get_rainfall(self, state: str, district: str) -> Optional[RainfallData]:
        """
        Get rainfall data for a specific district.
        
        Args:
            state: State name
            district: District name
        
        Returns:
            RainfallData if found, None otherwise
        """
        key = self._make_key(state, district)
        return self._cache.get(key)
    
    def get_all_rainfall(self) -> List[RainfallData]:
        """Get all cached rainfall data."""
        return list(self._cache.values())
    
    def get_state_rainfall(self, state: str) -> List[RainfallData]:
        """Get all districts' rainfall for a state."""
        state_norm = self._normalize_name(state)
        return [
            r for r in self._cache.values()
            if self._normalize_name(r.state) == state_norm
        ]
    
    def search_district(self, query: str) -> List[RainfallData]:
        """Search for districts by partial name match."""
        query_norm = self._normalize_name(query)
        return [
            r for r in self._cache.values()
            if query_norm in self._normalize_name(r.district)
        ][:20]  # Limit results
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "record_count": len(self._cache),
            "cache_time": self._cache_time.isoformat() if self._cache_time else None,
            "is_loading": self._loading,
            "ttl_hours": CACHE_TTL_HOURS,
        }


# Singleton instance
_rainfall_service: Optional[RainfallService] = None


def get_rainfall_service() -> RainfallService:
    """Get singleton rainfall service instance."""
    global _rainfall_service
    if _rainfall_service is None:
        _rainfall_service = RainfallService()
    return _rainfall_service

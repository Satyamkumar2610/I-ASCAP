"""
District Repository: Data access for district entities.
"""
from typing import List, Optional, Dict

import asyncpg

from app.repositories.base import BaseRepository
from app.schemas.district import District
from app.cache import cached, CacheTTL


class DistrictRepository(BaseRepository):
    """Repository for district data access."""
    
    @cached(ttl=CacheTTL.DISTRICTS, prefix="districts:all")
    async def get_all(self, state: Optional[str] = None) -> List[District]:
        """Get all districts, optionally filtered by state."""
        if state:
            query = """
                SELECT cdk, district_name as name, state_name as state
                FROM districts
                WHERE state_name = $1
                ORDER BY district_name
            """
            rows = await self.fetch_all(query, state)
        else:
            query = """
                SELECT cdk, district_name as name, state_name as state
                FROM districts
                ORDER BY state_name, district_name
            """
            rows = await self.fetch_all(query)
        
        return [District(cdk=r["cdk"], name=r["name"], state=r["state"]) for r in rows]
    
    async def get_by_cdk(self, cdk: str) -> Optional[District]:
        """Get single district by CDK."""
        query = """
            SELECT cdk, district_name as name, state_name as state
            FROM districts
            WHERE cdk = $1
        """
        row = await self.fetch_one(query, cdk)
        if row:
            return District(cdk=row["cdk"], name=row["name"], state=row["state"])
        return None
    
    async def search(self, query_text: str, state: Optional[str] = None) -> List[District]:
        """Search districts by name."""
        if state:
            query = """
                SELECT cdk, district_name as name, state_name as state
                FROM districts
                WHERE district_name ILIKE $1 AND state_name = $2
                ORDER BY district_name
                LIMIT 50
            """
            rows = await self.fetch_all(query, f"%{query_text}%", state)
        else:
            query = """
                SELECT cdk, district_name as name, state_name as state
                FROM districts
                WHERE district_name ILIKE $1
                ORDER BY district_name
                LIMIT 50
            """
            rows = await self.fetch_all(query, f"%{query_text}%")
        
        return [District(cdk=r["cdk"], name=r["name"], state=r["state"]) for r in rows]
    
    async def get_cdk_to_meta_map(self) -> Dict[str, Dict[str, str]]:
        """Get mapping of CDK to {name, state} for all districts."""
        query = "SELECT cdk, district_name, state_name FROM districts"
        rows = await self.fetch_all(query)
        return {r["cdk"]: {"name": r["district_name"], "state": r["state_name"]} for r in rows}
    
    @cached(ttl=CacheTTL.STATES, prefix="states:all")
    async def get_states(self) -> List[str]:
        """Get list of all unique states."""
        query = "SELECT DISTINCT state_name FROM districts ORDER BY state_name"
        rows = await self.fetch_all(query)
        return [r["state_name"] for r in rows if r["state_name"]]
    
    async def count_by_state(self) -> Dict[str, int]:
        """Get district count per state."""
        query = """
            SELECT state_name, COUNT(*) as count 
            FROM districts 
            WHERE state_name IS NOT NULL
            GROUP BY state_name
        """
        rows = await self.fetch_all(query)
        return {r["state_name"]: r["count"] for r in rows}

"""
IMD Rainfall Data Service.
Reads district-level rainfall normals from database (populated via ETL).
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import asyncpg


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


async def get_rainfall_by_district(
    db: asyncpg.Connection,
    state: str,
    district: str
) -> Optional[RainfallData]:
    """
    Get rainfall data for a specific district from database.
    """
    row = await db.fetchrow("""
        SELECT state_ut, district, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec_month,
               annual, jjas, mam, ond, jan_feb
        FROM rainfall_normals
        WHERE UPPER(state_ut) = UPPER($1) AND UPPER(district) = UPPER($2)
    """, state, district)
    
    if not row:
        return None
    
    return RainfallData(
        state=row["state_ut"],
        district=row["district"],
        jan=float(row["jan"] or 0),
        feb=float(row["feb"] or 0),
        mar=float(row["mar"] or 0),
        apr=float(row["apr"] or 0),
        may=float(row["may"] or 0),
        jun=float(row["jun"] or 0),
        jul=float(row["jul"] or 0),
        aug=float(row["aug"] or 0),
        sep=float(row["sep"] or 0),
        oct=float(row["oct"] or 0),
        nov=float(row["nov"] or 0),
        dec=float(row["dec_month"] or 0),
        annual=float(row["annual"] or 0),
        monsoon_jjas=float(row["jjas"] or 0),
        winter_jf=float(row["jan_feb"] or 0),
        pre_monsoon_mam=float(row["mam"] or 0),
        post_monsoon_ond=float(row["ond"] or 0),
    )


async def get_all_rainfall(
    db: asyncpg.Connection,
    state: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get all rainfall data (optionally filtered by state) from database.
    Returns simplified format for map visualization.
    """
    if state:
        rows = await db.fetch("""
            SELECT state_ut, district, annual, jjas as monsoon
            FROM rainfall_normals
            WHERE UPPER(state_ut) = UPPER($1)
            ORDER BY district
        """, state)
    else:
        rows = await db.fetch("""
            SELECT state_ut, district, annual, jjas as monsoon
            FROM rainfall_normals
            ORDER BY state_ut, district
        """)
    
    return [
        {
            "state": row["state_ut"],
            "district": row["district"],
            "annual": float(row["annual"] or 0),
            "monsoon": float(row["monsoon"] or 0),
        }
        for row in rows
    ]


async def get_state_rainfall_stats(
    db: asyncpg.Connection,
    state: str
) -> Dict[str, Any]:
    """
    Get aggregated rainfall statistics for a state.
    """
    row = await db.fetchrow("""
        SELECT 
            COUNT(*) as district_count,
            AVG(annual) as avg_annual,
            MIN(annual) as min_annual,
            MAX(annual) as max_annual,
            AVG(jjas) as avg_monsoon
        FROM rainfall_normals
        WHERE UPPER(state_ut) = UPPER($1)
    """, state)
    
    if not row or row["district_count"] == 0:
        return {"error": f"No data for state: {state}"}
    
    return {
        "state": state,
        "district_count": row["district_count"],
        "avg_annual_mm": round(float(row["avg_annual"] or 0), 2),
        "min_annual_mm": round(float(row["min_annual"] or 0), 2),
        "max_annual_mm": round(float(row["max_annual"] or 0), 2),
        "avg_monsoon_mm": round(float(row["avg_monsoon"] or 0), 2),
    }


async def get_rainfall_count(db: asyncpg.Connection) -> int:
    """Get total number of rainfall records in database."""
    return await db.fetchval("SELECT COUNT(*) FROM rainfall_normals")

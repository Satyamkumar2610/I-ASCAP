import asyncio
from app.database import get_connection

async def count_rows():
    async with get_connection() as db:
        count = await db.fetchval("SELECT count(*) FROM agri_metrics")
        print(f"Total rows: {count}")
        
        duplicates = await db.fetchval("""
            SELECT count(*) FROM (
                SELECT district_lgd, year, variable_name
                FROM agri_metrics
                GROUP BY district_lgd, year, variable_name
                HAVING count(*) > 1
            ) as sub
        """)
        print(f"Duplicate groups: {duplicates}")

if __name__ == "__main__":
    asyncio.run(count_rows())

import asyncio
from app.database import get_connection

async def search_districts():
    async with get_connection() as db:
        queries = [
            ("ANDHRA PRADESH", "%"),
        ]
        
        for state, pattern in queries:
            rows = await db.fetch("SELECT district_name FROM districts WHERE state_name = $1 AND district_name LIKE $2", state, pattern)
            print(f"{state} - {pattern}: {[r['district_name'] for r in rows]}")

if __name__ == "__main__":
    asyncio.run(search_districts())

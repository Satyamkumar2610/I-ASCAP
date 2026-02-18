import asyncio
from app.database import get_connection

async def verify_import():
    async with get_connection() as db:
        # Check years
        years = await db.fetch("SELECT min(year), max(year) FROM agri_metrics")
        print(f"Year range: {years[0]['min']} - {years[0]['max']}")

        # Check count for 1966
        count_1966 = await db.fetchval("SELECT count(*) FROM agri_metrics WHERE year = 1966")
        print(f"Rows in 1966: {count_1966}")

        # Check distinct variables count
        vars_count = await db.fetchval("SELECT count(DISTINCT variable_name) FROM agri_metrics")
        print(f"Distinct variables: {vars_count}")

        # Sample variables
        rows = await db.fetch("SELECT DISTINCT variable_name FROM agri_metrics LIMIT 10")
        print("Sample variables:", [r['variable_name'] for r in rows])

if __name__ == "__main__":
    asyncio.run(verify_import())

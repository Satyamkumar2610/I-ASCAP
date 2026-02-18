import asyncio
from app.database import get_connection

async def describe_table():
    async with get_connection() as db:
        rows = await db.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'agri_metrics'")
        print("Columns in agri_metrics:")
        for r in rows:
            print(r['column_name'])

if __name__ == "__main__":
    asyncio.run(describe_table())

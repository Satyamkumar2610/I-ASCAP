import asyncio
from app.database import get_connection

async def list_states():
    async with get_connection() as db:
        rows = await db.fetch("SELECT DISTINCT state_name FROM districts ORDER BY state_name")
        print("States in DB:")
        for r in rows:
            print(f"'{r['state_name']}'")

if __name__ == "__main__":
    asyncio.run(list_states())

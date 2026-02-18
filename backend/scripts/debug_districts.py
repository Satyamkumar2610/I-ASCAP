import asyncio
import sys
from app.database import get_connection

async def list_districts(states):
    async with get_connection() as db:
        for state in states:
            print(f"--- {state} ---")
            rows = await db.fetch("SELECT district_name FROM districts WHERE state_name = $1 ORDER BY district_name", state)
            for r in rows:
                print(r['district_name'])

if __name__ == "__main__":
    states = ["WEST BENGAL", "GUJARAT", "ANDHRA PRADESH", "MADHYA PRADESH", "UTTAR PRADESH"]
    asyncio.run(list_districts(states))

import asyncio
import os
import asyncpg
import json
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def list_available_data():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Get all distinct CDKs from agri_metrics
        # This is the "Data Universe"
        rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics")
        cdks = sorted([r['cdk'] for r in rows])
        
        with open("available_cdks.json", "w") as f:
            json.dump(cdks, f, indent=2)
            
        print(f"Saved {len(cdks)} available CDKs to available_cdks.json")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(list_available_data())

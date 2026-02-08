import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_dantewada():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking Lineage for Dantewada Split (2011?)...")
        query = """
            SELECT * FROM lineage_events 
            WHERE parent_cdk ILIKE '%dante%' 
            OR parent_cdk ILIKE '%dakshi%'
            OR child_cdk ILIKE '%dante%'
            OR child_cdk ILIKE '%dakshi%'
        """
        rows = await conn.fetch(query)
        for r in rows:
            print(dict(r))
            
        print("\nChecking Metrics for Dantewada (Dakshi) and Bijapur...")
        query2 = """
            SELECT DISTINCT cdk FROM agri_metrics 
            WHERE cdk ILIKE '%dakshi%' 
            OR cdk ILIKE '%bijapu%'
        """
        rows2 = await conn.fetch(query2)
        for r in rows2:
            print(r['cdk'])
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_dantewada())

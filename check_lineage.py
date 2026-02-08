import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_lineage():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking Lineage Events for Bilaspur context...")
        # Check parents or children named Bilaspur
        # Note: Bilaspur (CH/CG) split into Bilaspur + Korba + Janjgir-Champa
        
        query = """
            SELECT * FROM lineage_events 
            WHERE parent_cdk ILIKE '%bilasp%' 
            OR child_cdk ILIKE '%bilasp%'
        """
        rows = await conn.fetch(query)
        if not rows:
            print("No lineage events found for Bilaspur.")
        else:
            for r in rows:
                print(dict(r))
                
        # Also check Latur split if any? (Latur was formed from Osmanabad in 1982, maybe?)
        print("\nChecking Lineage for Latur context...")
        query2 = """
            SELECT * FROM lineage_events 
            WHERE parent_cdk ILIKE '%latur%' 
            OR child_cdk ILIKE '%latur%'
        """
        rows2 = await conn.fetch(query2)
        if not rows2:
            print("No lineage events found for Latur.")
        else:
            for r in rows2:
                print(dict(r))

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_lineage())

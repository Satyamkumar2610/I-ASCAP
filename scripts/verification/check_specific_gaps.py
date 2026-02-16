import asyncio
import os
import asyncpg
import json
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_latur_maize():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Check Latur Maize Data
        # Latur is in Maharashtra. CDK should be MH_latur or MA_latur?
        # My map bridge analysis mapped Latur to MH_latur_year?
        # Wait, if I bulk updated MP from MH->MA, actual MH stayed MH.
        
        print("Checking Latur Maize Data...")
        query = """
            SELECT cdk, year, variable_name, value 
            FROM agri_metrics 
            WHERE (cdk LIKE 'MH_lat%' OR cdk LIKE 'MA_lat%')
            AND variable_name LIKE '%maize%'
            ORDER BY year
            LIMIT 10
        """
        rows = await conn.fetch(query)
        if not rows:
            print("No Maize data found for Latur.")
        else:
            for r in rows:
                print(dict(r))
                
        # Also check Bilaspur Rice (from screenshot 1)
        print("\nChecking Bilaspur Rice Data...")
        # Bilaspur is in Chhattisgarh (CH). Was CG.
        # Prefix might be CH_ or CG_ or MH_ (old mp).
        query2 = """
            SELECT cdk, year, variable_name, value 
            FROM agri_metrics 
            WHERE (cdk ILIKE '%bilasp%')
            AND variable_name LIKE '%rice%'
            ORDER BY year DESC
            LIMIT 10
        """
        rows2 = await conn.fetch(query2)
        if not rows2:
            print("No Rice data found for Bilaspur.")
        else:
            for r in rows2:
                print(dict(r))

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_latur_maize())

import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def diagnose():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking districts with MA_ prefix in agri_metrics:")
        query = """
            SELECT DISTINCT split_part(cdk, '_', 2) as dist_name 
            FROM agri_metrics 
            WHERE cdk LIKE 'MA_%'
            ORDER BY dist_name
        """
        rows = await conn.fetch(query)
        names = [r['dist_name'] for r in rows]
        print(names)
        
        print(f"\nTotal MA_ districts: {len(names)}")
        
        # Check if 'latur' is in there
        if 'latur' in names:
            print("Latur IS in MA_ list.")
        else:
            print("Latur IS NOT in MA_ list.")
            
        # Check if 'indore' (MP) is in there
        if 'indore' in names:
            print("Indore IS in MA_ list.")
            
        # Check MH_ prefix
        print("\nChecking districts with MH_ prefix in agri_metrics:")
        query2 = """
            SELECT DISTINCT split_part(cdk, '_', 2) as dist_name 
            FROM agri_metrics 
            WHERE cdk LIKE 'MH_%'
        """
        rows2 = await conn.fetch(query2)
        mh_names = [r['dist_name'] for r in rows2]
        print(mh_names)

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(diagnose())

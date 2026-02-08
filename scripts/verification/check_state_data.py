import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_state_keys():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking for STATE_ keys in agri_metrics...")
        query = """
            SELECT DISTINCT cdk FROM agri_metrics 
            WHERE cdk LIKE 'STATE_%'
            LIMIT 20
        """
        rows = await conn.fetch(query)
        if not rows:
            print("No STATE_ keys found.")
        else:
            for r in rows:
                print(r['cdk'])
                
        # Also check coverage for a 'gray' district from screenshot?
        # Hard to tell exact district from screenshot, looks like parts of MP/Gujarat.
        # Let's check 'MA_bhopal_1951' for 'rice_yield' in 2001.
        
        print("\nChecking Data for MA_bhopal_1951 (Rice 2001)...")
        query2 = """
            SELECT * FROM agri_metrics 
            WHERE cdk = 'MA_bhopal_1951' 
            AND year = 2001
            AND variable_name LIKE 'rice%'
        """
        rows2 = await conn.fetch(query2)
        if not rows2:
            print("No Rice data for Bhopal in 2001.")
        else:
            for r in rows2:
                print(dict(r))

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_state_keys())

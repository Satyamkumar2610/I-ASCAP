import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_specific_states():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking West Bengal (WE_)...")
        rows = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics WHERE cdk LIKE 'WE_%' AND variable_name LIKE '%rice%'")
        print("WE Variables:", [r['variable_name'] for r in rows])
        
        print("\nChecking Jharkhand (JH_)...")
        rows = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics WHERE cdk LIKE 'JH_%' AND variable_name LIKE '%rice%'")
        print("JH Variables:", [r['variable_name'] for r in rows])
        
        print("\nChecking Kerala (KE_ / KL_)...")
        rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics WHERE cdk LIKE 'KE_%' LIMIT 5")
        print("KE CDKs:", [r['cdk'] for r in rows])
        rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics WHERE cdk LIKE 'KL_%' LIMIT 5")
        print("KL CDKs:", [r['cdk'] for r in rows])
        
        if rows:
             print("Using KL_ prefix.")
             rows = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics WHERE cdk LIKE 'KL_%' AND variable_name LIKE '%rice%'")
             print("KL Variables:", [r['variable_name'] for r in rows])
        else:
             print("Using KE_ prefix.")
             rows = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics WHERE cdk LIKE 'KE_%' AND variable_name LIKE '%rice%'")
             print("KE Variables:", [r['variable_name'] for r in rows])

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_specific_states())

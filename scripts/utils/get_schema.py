import asyncio
import asyncpg
import os
import sys

# Load env variables
from dotenv import load_dotenv
load_dotenv('backend/.env')

async def main():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("NO DATABASE_URL FOUND")
        return
        
    try:
        conn = await asyncpg.connect(db_url)
        
        print("--- TABLES ---")
        tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        for t in tables:
            print(f"\nTable: {t['table_name']}")
            cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1", t['table_name'])
            for c in cols:
                print(f"  - {c['column_name']} ({c['data_type']})")
                
        print("\n--- DISTINCT VARIABLES IN AGRI_METRICS ---")
        vars = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics ORDER BY variable_name")
        for v in vars:
            print(f"  * {v['variable_name']}")
            
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())

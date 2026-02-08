import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_cdk_versions():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Checking Bilaspur CDK versions in agri_metrics...")
        query = """
            SELECT DISTINCT cdk FROM agri_metrics 
            WHERE cdk ILIKE '%bilasp%'
        """
        rows = await conn.fetch(query)
        for r in rows:
            print(f"Metrics CDK: {r['cdk']}")
            
        print("\nChecking Latur CDK versions in agri_metrics...")
        query2 = """
            SELECT DISTINCT cdk FROM agri_metrics 
            WHERE cdk ILIKE '%latur%'
        """
        rows2 = await conn.fetch(query2)
        for r in rows2:
            print(f"Metrics CDK: {r['cdk']}")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_cdk_versions())

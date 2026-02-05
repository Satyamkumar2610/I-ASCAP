
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

async def check_data():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # 1. Select a few known split parents (from history)
        # We know CG_basta_1961 -> CG_naray_2001 split in 2012 (from previous logs)
        
        parent_cdk = "CG_basta_1961"
        child_cdk = "CG_naray_2001"
        split_year = 2012
        
        print(f"Checking data for Split: {parent_cdk} -> {child_cdk} (Split Year: {split_year})")
        
        # Check Parent Data (Pre-Split)
        parent_rows = await conn.fetch("""
            SELECT year, variable_name, value 
            FROM agri_metrics 
            WHERE cdk = $1 AND variable_name IN ('wheat_yield', 'rice_yield')
            ORDER BY year
        """, parent_cdk)
        
        print(f"\nParent ({parent_cdk}) Data Points: {len(parent_rows)}")
        for r in parent_rows:
            print(f"  Year: {r['year']}, Var: {r['variable_name']}, Val: {r['value']}")

        # Check Child Data (Post-Split)
        child_rows = await conn.fetch("""
            SELECT year, variable_name, value 
            FROM agri_metrics 
            WHERE cdk = $1 AND variable_name IN ('wheat_yield', 'rice_yield')
            ORDER BY year
        """, child_cdk)
        
        print(f"\nChild ({child_cdk}) Data Points: {len(child_rows)}")
        for r in child_rows:
            print(f"  Year: {r['year']}, Var: {r['variable_name']}, Val: {r['value']}")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_data())

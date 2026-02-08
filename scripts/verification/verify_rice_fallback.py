import sys
import os
import asyncio
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

import asyncpg
from app.repositories.metric_repo import MetricRepository
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def verify_rice():
    print("Connecting to DB...")
    conn = await asyncpg.connect(DATABASE_URL)
    repo = MetricRepository(conn)
    
    try:
        # Test West Bengal (WE_dakshi_1951 is South 24 Parganas?)
        # Let's just ask for ALL districts in 2001 for Rice Yield
        print("Fetching Rice Yield 2001...")
        data = await repo.get_by_year_and_variable(2001, "rice_yield")
        
        wb_data = [d for d in data if d.cdk.startswith("WE_")]
        ke_data = [d for d in data if d.cdk.startswith("KE_")]
        jh_data = [d for d in data if d.cdk.startswith("JH_")]
        
        print(f"Total Records: {len(data)}")
        print(f"West Bengal Records: {len(wb_data)}")
        print(f"Kerala Records: {len(ke_data)}")
        print(f"Jharkhand Records: {len(jh_data)}")
        
        if wb_data:
            print(f"Sample WB: {wb_data[0]}")
            
        print("\nChecking available years for KE/JH (Early 2000s)...")
        ke_early = await conn.fetch("SELECT year, variable_name, COUNT(*) FROM agri_metrics WHERE cdk LIKE 'KE_%' AND variable_name LIKE '%rice%' AND year BETWEEN 2000 AND 2005 GROUP BY year, variable_name ORDER BY year")
        for r in ke_early:
            print(f"KE: {r['year']} - {r['variable_name']} ({r['count']})")
            
        jh_early = await conn.fetch("SELECT year, variable_name, COUNT(*) FROM agri_metrics WHERE cdk LIKE 'JH_%' AND variable_name LIKE '%rice%' AND year BETWEEN 2000 AND 2005 GROUP BY year, variable_name ORDER BY year")
        for r in jh_early:
            print(f"JH: {r['year']} - {r['variable_name']} ({r['count']})")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(verify_rice())

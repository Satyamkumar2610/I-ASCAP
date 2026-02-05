
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

async def inspect_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("--- Sample Rows from agri_metrics ---")
        rows = await conn.fetch("SELECT * FROM agri_metrics LIMIT 10")
        for r in rows:
            print(dict(r))

        print("\n--- Distinct Variable Names ---")
        vars = await conn.fetch("SELECT DISTINCT variable_name FROM agri_metrics LIMIT 20")
        for v in vars:
            print(v['variable_name'])

        print("\n--- Check Specific District ---")
        # Check if Jodhpur exists (we know it worked)
        jodhpur = await conn.fetch("SELECT count(*) FROM agri_metrics WHERE cdk = 'RA_jodhpu_1951'")
        print(f"Jodhpur Row Count: {jodhpur[0]['count']}")
        
        # Check Bastar (Parent)
        bastar = await conn.fetch("SELECT count(*) FROM agri_metrics WHERE cdk = 'CG_basta_1961'")
        print(f"Bastar Row Count: {bastar[0]['count']}")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(inspect_db())

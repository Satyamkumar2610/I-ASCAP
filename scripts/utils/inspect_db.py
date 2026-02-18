
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/.env')))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
     print("DATABASE_URL not found, using default locally")
     DATABASE_URL = "postgresql://user:password@localhost/dbname"

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

        print("\n--- Check Specific District (Jodhpur) ---")
        # Check Jodhpur via join
        jodhpur = await conn.fetch("""
            SELECT count(*) 
            FROM agri_metrics m
            JOIN districts d ON m.district_lgd = d.lgd_code
            WHERE d.district_name = 'Jodhpur'
        """)
        print(f"Jodhpur Row Count: {jodhpur[0]['count']}")
        
        # Check Bastar (Parent)
        bastar = await conn.fetch("""
            SELECT count(*) 
            FROM agri_metrics m
            JOIN districts d ON m.district_lgd = d.lgd_code
            WHERE d.district_name = 'Bastar'
        """)
        print(f"Bastar Row Count: {bastar[0]['count']}")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(inspect_db())

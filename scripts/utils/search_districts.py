
import asyncio
import os
import sys
import asyncpg
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')))

DATABASE_URL = os.getenv("DATABASE_URL")

SEARCH_TERMS = [
    "lahaul", "spiti", 
    "alleppey", "alappuzha",
    "mahasu", 
    "malabar", 
    "balipara",
    "subansiri",
    "kameng"
]

async def search():
    conn = await asyncpg.connect(DATABASE_URL)
    print("Searching districts table...\n")
    
    for term in SEARCH_TERMS:
        rows = await conn.fetch("SELECT * FROM districts WHERE district_name ILIKE $1", f"%{term}%")
        print(f"Term: '{term}'")
        if rows:
            for r in rows:
                print(f"  Found: {r['district_name']} ({r['state_name']}) - LGD: {r['lgd_code']}")
        else:
            print(f"  No match found.")
        print("")
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(search())

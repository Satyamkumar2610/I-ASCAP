import asyncio
import os
import asyncpg
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")

async def sync_years():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Check current state
        total_lineage = await conn.fetchval("SELECT COUNT(*) FROM lineage_events")
        print(f"Total lineage events: {total_lineage}")
        
        # 1. Update existing events with precise years
        print("Updating existing lineage events with precise years from district_splits...")
        query = """
            WITH updates AS (
                SELECT ds.parent_cdk, ds.child_cdk, ds.split_year
                FROM district_splits ds
                WHERE ds.parent_cdk IS NOT NULL 
                  AND ds.child_cdk IS NOT NULL
            )
            UPDATE lineage_events le
            SET event_year = u.split_year
            FROM updates u
            WHERE le.parent_cdk = u.parent_cdk 
              AND le.child_cdk = u.child_cdk
              AND le.event_year != u.split_year
            RETURNING le.parent_cdk, le.child_cdk, le.event_year;
        """
        updated = await conn.fetch(query)
        print(f"Updated {len(updated)} events with precise years.")
        
        # 2. Identify missing events (present in splits but not in lineage)
        print("\nChecking for missing events...")
        missing_query = """
            SELECT ds.state_name, ds.split_year, ds.parent_cdk, ds.child_cdk
            FROM district_splits ds
            LEFT JOIN lineage_events le 
                ON ds.parent_cdk = le.parent_cdk AND ds.child_cdk = le.child_cdk
            WHERE ds.parent_cdk IS NOT NULL 
              AND ds.child_cdk IS NOT NULL
              AND le.parent_cdk IS NULL
        """
        missing = await conn.fetch(missing_query)
        print(f"Found {len(missing)} split records missing from lineage_events (potential inserts).")
        
        if missing:
            print("Sample missing events:")
            for row in missing[:5]:
                print(f"  {row['state_name']} {row['split_year']}: {row['parent_cdk']} -> {row['child_cdk']}")
                
            # Insert missing events
            print(f"Inserting {len(missing)} missing events into lineage_events...")
            insert_query = """
                INSERT INTO lineage_events (parent_cdk, child_cdk, event_year, event_type)
                SELECT ds.parent_cdk, ds.child_cdk, ds.split_year, 'SPLIT'
                FROM district_splits ds
                LEFT JOIN lineage_events le 
                    ON ds.parent_cdk = le.parent_cdk AND ds.child_cdk = le.child_cdk
                WHERE ds.parent_cdk IS NOT NULL 
                  AND ds.child_cdk IS NOT NULL
                  AND le.parent_cdk IS NULL
                ON CONFLICT (parent_cdk, child_cdk, event_year) DO NOTHING
            """
            result = await conn.execute(insert_query)
            print(f"Insert result: {result}")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    if not DATABASE_URL:
        print("DATABASE_URL not set")
        exit(1)
    asyncio.run(sync_years())

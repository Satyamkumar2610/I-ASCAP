import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_child_alignments():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        print("Starting Lineage Child Alignment...")
        
        # 1. Fetch all unique parents and children from lineage
        parents = await conn.fetch("SELECT DISTINCT parent_cdk FROM lineage_events")
        children = await conn.fetch("SELECT DISTINCT child_cdk FROM lineage_events")
        
        lineage_keys = set([r['parent_cdk'] for r in parents] + [r['child_cdk'] for r in children])
        
        # 2. Fetch all available metrics keys
        metrics_rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics")
        metrics_keys = set([r['cdk'] for r in metrics_rows])
        
        # Map: Metric Key Stub -> Best Metric Key (prefer 1951)
        # Stub = PREFIX_NAME (e.g. CH_dantew)
        stub_map = {}
        for m in metrics_keys:
            parts = m.split('_')
            if len(parts) >= 2:
                stub = f"{parts[0]}_{parts[1]}"
                # Logic: prefer 1951, else first seen
                if stub not in stub_map:
                    stub_map[stub] = m
                else:
                    if '1951' in m:
                        stub_map[stub] = m
                        
        # Special Overlay mappings (e.g. Dantewada -> Dakshin)
        # We know CH_dantew should map to CH_dakshi IF CH_dantew doesn't exist
        # But automating this is risky fuzzy matching.
        # Let's handle specific known cases manually, and suffix alignment automatically.
        manual_map = {
            "CH_dantew": "CH_dakshi", 
            # Add others if discovered?
        }

        updates = 0
        
        # Iterate all lineage keys
        for key in lineage_keys:
            if key in metrics_keys:
                continue # Already valid
                
            # Try to find a fix
            parts = key.split('_')
            if len(parts) < 2: continue
            
            prefix = parts[0]
            name = parts[1]
            stub = f"{prefix}_{name}"
            
            # Check manual override
            if stub in manual_map:
                target_stub = manual_map[stub]
                # Find best valid key for target stub
                if target_stub in stub_map:
                    target_key = stub_map[target_stub]
                    print(f"Manual Override: {key} -> {target_key}")
                    # Update DB
                    await conn.execute("UPDATE lineage_events SET parent_cdk = $1 WHERE parent_cdk = $2", target_key, key)
                    await conn.execute("UPDATE lineage_events SET child_cdk = $1 WHERE child_cdk = $2", target_key, key)
                    updates += 1
                    continue
                    
            # Check Suffix Alignment (Same Stub exists in metrics)
            if stub in stub_map:
                target_key = stub_map[stub]
                print(f"Aligning Suffix: {key} -> {target_key}")
                await conn.execute("UPDATE lineage_events SET parent_cdk = $1 WHERE parent_cdk = $2", target_key, key)
                await conn.execute("UPDATE lineage_events SET child_cdk = $1 WHERE child_cdk = $2", target_key, key)
                updates += 1
            else:
                # Still Unmapped
                # maybe fuzzy match?
                pass
                
        print(f"Fixed {updates} lineage keys.")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_child_alignments())

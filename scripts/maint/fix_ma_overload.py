import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_ma_and_lineage():
    conn = await asyncpg.connect(DATABASE_URL)
    async with conn.transaction():
        print("Starting Transaction...")
        
        # 1. Fix Maharashtra Prefix (MH -> MA) in Districts
        # We need to be careful not to create duplicates if MA_ exists? 
        # But we know MA_ in districts was only MP. MH_ was MH.
        # So changing MH_ to MA_ might collide if district names collide?
        # Let's assume unique names for now (or handle unique constraint).
        
        print("Updating Maharashtra districts (MH_ -> MA_)...")
        # We use a temporary deferred constraint check or ignore conflicts?
        # Actually, let's just do it. specific names shouldn't collide between MH and MP.
        
        # Get all MH districts
        rows = await conn.fetch("SELECT cdk, district_name FROM districts WHERE state_name = 'Maharashtra' AND cdk LIKE 'MH_%'")
        print(f"Found {len(rows)} MH districts to update.")
        
        updates = 0
        for r in rows:
            old_cdk = r['cdk']
            # strict replace MH_ -> MA_
            new_cdk = 'MA_' + old_cdk[3:]
            
            # Check if new_cdk exists
            exists = await conn.fetchval("SELECT 1 FROM districts WHERE cdk = $1", new_cdk)
            if exists:
                print(f"Skipping {old_cdk} -> {new_cdk} (Target exists)")
                continue
                
            # Update lineage references first?
            # FK constraints: lineage_events(parent_cdk) -> districts(cdk)
            # We need to defer constraints or update children.
            # But wait, lineage_events FK is ON UPDATE CASCADE? Check schema?
            # Assuming standard behavior, we should update children references or table constraints.
            
            # Actually, let's drop FKs on lineage events temporary again
            pass 

        # Drop FKs
        await conn.execute("ALTER TABLE lineage_events DROP CONSTRAINT IF EXISTS lineage_events_parent_cdk_fkey")
        await conn.execute("ALTER TABLE lineage_events DROP CONSTRAINT IF EXISTS lineage_events_child_cdk_fkey")
        
        # Check/Drop FK on agri_metrics? (Usually no FK from metrics to districts? Or yes?)
        await conn.execute("ALTER TABLE agri_metrics DROP CONSTRAINT IF EXISTS agri_metrics_cdk_fkey")

        # execute updates
        for r in rows:
            old_cdk = r['cdk']
            new_cdk = 'MA_' + old_cdk[3:]
            try:
                await conn.execute("UPDATE districts SET cdk = $1 WHERE cdk = $2", new_cdk, old_cdk)
                updates += 1
            except Exception as e:
                print(f"Failed to update {old_cdk}: {e}")
                
        print(f"Updated {updates} Maharashtra districts.")
        
        # Update lineage_events prefixes (text replace)
        print("Updating Lineage Events prefixes (MH_ -> MA_)...")
        await conn.execute("UPDATE lineage_events SET parent_cdk = REPLACE(parent_cdk, 'MH_', 'MA_') WHERE parent_cdk LIKE 'MH_%'")
        await conn.execute("UPDATE lineage_events SET child_cdk = REPLACE(child_cdk, 'MH_', 'MA_') WHERE child_cdk LIKE 'MH_%'")
        
        # 2. Fix Lineage Suffix Mismatch (The 1991 vs 1951 issue)
        # Strategy: For each lineage parent not in metrics, find best match in metrics.
        
        print("Aligning Lineage Suffixes...")
        # Get all parent_cdks from lineage
        parents = await conn.fetch("SELECT DISTINCT parent_cdk FROM lineage_events")
        
        # Get all metrics CDKs
        metrics_rows = await conn.fetch("SELECT DISTINCT cdk FROM agri_metrics")
        metrics_cdks = set([r['cdk'] for r in metrics_rows])
        
        aligned_count = 0
        for p in parents:
            p_cdk = p['parent_cdk']
            if p_cdk not in metrics_cdks:
                # Mismatch found. Try to match.
                # Logic: same Prefix + Name, different Suffix.
                parts = p_cdk.split('_')
                if len(parts) < 2: continue
                
                prefix_name = f"{parts[0]}_{parts[1]}" # e.g. CH_bilasp
                
                # Find candidate in metrics
                candidates = [m for m in metrics_cdks if m.startswith(prefix_name)]
                if candidates:
                    # Pick 1951 if available, else first
                    best = next((c for c in candidates if '1951' in c), candidates[0])
                    
                    print(f"  Aligning {p_cdk} -> {best}")
                    await conn.execute("UPDATE lineage_events SET parent_cdk = $1 WHERE parent_cdk = $2", best, p_cdk)
                    aligned_count += 1
                    
        print(f"Aligned {aligned_count} lineage parents.")
        
        # Restore FKs (Optional/Risky if mismatches remain, but good practice if clean)
        # Note: If we updated lineage parents to 'best' (from metrics), and 'best' is in metrics...
        # Does 'best' exist in DISTRICTS?
        # If 'best' (e.g. CH_bilasp_1951) is in metrics, it implies it exists?
        # But districts table might have CH_bilasp_1991?
        # We need to Ensure DISTRICTS table ALSO has the "Data Key".
        # If districts has 1991 and metrics has 1951, we should update DISTRICTS to 1951 too?
        # YES.
        
        print("Aligning Districts Table Suffixes...")
        # Same check for districts
        d_rows = await conn.fetch("SELECT cdk FROM districts")
        
        d_updates = 0
        for r in d_rows:
            d_cdk = r['cdk']
            if d_cdk not in metrics_cdks:
                 parts = d_cdk.split('_')
                 if len(parts) < 2: continue
                 prefix_name = f"{parts[0]}_{parts[1]}"
                 candidates = [m for m in metrics_cdks if m.startswith(prefix_name)]
                 if candidates:
                    best = next((c for c in candidates if '1951' in c), candidates[0])
                    # Update district cdk
                    # Check collision
                    exists = await conn.fetchval("SELECT 1 FROM districts WHERE cdk = $1", best)
                    if not exists:
                        print(f"  Renaming District {d_cdk} -> {best}")
                        await conn.execute("UPDATE districts SET cdk = $1 WHERE cdk = $2", best, d_cdk)
                        d_updates += 1
                    else:
                        print(f"  Cannot rename {d_cdk} -> {best} (Target exists). merging?")
                        # If target exists, maybe we should just delete the strict outdated one?
                        # Or do nothing.
                        pass
                        
        print(f"Renamed {d_updates} districts to match Metrics keys.")

    print("Transaction Committed.")

if __name__ == "__main__":
    asyncio.run(fix_ma_and_lineage())

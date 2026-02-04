
import os
import pandas as pd
from sqlalchemy import create_engine, text

def main():
    print("--- VALIDATION START ---")
    
    # 1. Check Files
    files = {
        'Lineage': 'data/v1/district_lineage.csv',
        'Snapshot': 'data/v1/district_snapshot.csv',
        'Panel': 'data/v1_5/district_year_panel_v1_5.csv'
    }
    
    for name, path in files.items():
        if os.path.exists(path):
            print(f"[OK] {name} found at {path}")
        else:
            # Try find
            print(f"[WARN] {name} missing at {path}. Searching...")
            found = False
            for root, _, fs in os.walk('data'):
                if os.path.basename(path) in fs:
                    print(f"  -> Found at {os.path.join(root, os.path.basename(path))}")
                    found = True
                    break
            if not found:
                print(f"  -> [FAIL] {name} NOT FOUND.")

    # 2. Check DB Content
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        db_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/i_ascap")
        engine = create_engine(db_url)
        with engine.connect() as conn:
            cnt = conn.execute(text("SELECT count(*) FROM agri_metrics")).scalar()
            print(f"[OK] DB Agri Metrics: {cnt} rows.")
            
            # Check if Lineage parents exist in DB
            if os.path.exists(files['Lineage']):
                lin = pd.read_csv(files['Lineage'])
                parents = lin['parent_cdk'].unique()
                
                # Check 5 random parents
                sample = list(parents)[:5]
                print(f"Checking sample parents in DB: {sample}")
                
                res = conn.execute(text("SELECT cdk FROM districts WHERE cdk = ANY(:cdks)"), {'cdks': sample}).fetchall()
                found_cdks = [r[0] for r in res]
                print(f"Found in DB: {found_cdks}")
                
                if len(found_cdks) == 0:
                     print("[CRITICAL] Lineage CDKs do NOT match DB CDKs!")
                else:
                     print("[OK] CDKs match (at least partially).")
                     
    except Exception as e:
        print(f"[FAIL] DB Connection: {e}")

    print("--- VALIDATION END ---")

if __name__ == '__main__':
    main()

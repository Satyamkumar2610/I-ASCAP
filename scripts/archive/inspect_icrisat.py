
import pandas as pd
import sys

FILE_PATH = "data/raw/ICRISAT_correct.csv"

def inspect_icrisat():
    print(f"Reading {FILE_PATH}...")
    try:
        # Check first few rows
        df = pd.read_csv(FILE_PATH, nrows=100)
        print("Columns:", df.columns.tolist())
        
        # Check for Bastar in this sample
        # Assuming there is a 'Dist Name' or similar column
        dist_col = next((c for c in df.columns if 'dist' in c.lower()), None)
        if dist_col:
             print(f"District Column: {dist_col}")
             print("Sample Districts:", df[dist_col].unique())
        
        # Now try to grep for "Bastar" in the whole file if possible (or read more rows)
        # Using a chunked read to valid 'Bastar' existence without loading 300MB if it was huge (it's 5MB so ok)
        
        full_df = pd.read_csv(FILE_PATH)
        if dist_col:
             has_bastar = full_df[full_df[dist_col].str.contains('Bastar', case=False, na=False)].any().any()
             print(f"Has Bastar? {has_bastar}")
             if has_bastar:
                 print(full_df[full_df[dist_col].str.contains('Bastar', case=False, na=False)].head(2))
        
        print(f"Total Rows: {len(full_df)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_icrisat()

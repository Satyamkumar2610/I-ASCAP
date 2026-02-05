
import pandas as pd
import sys

FILE_PATH = "data/raw/crop-area-and-production (1).xlsx"

def inspect_excel():
    print(f"Reading {FILE_PATH}...")
    try:
        # Read header=4 as per ingest_state_data.py
        df = pd.read_excel(FILE_PATH, header=4)
        print("Columns:", df.columns.tolist()[:10])
        print(f"Total Rows: {len(df)}")
        
        # Check rows where State is NaN but maybe District is present?
        # Or verify if 'State' column actually contains District names?
        print("\nSample Rows:")
        print(df.head(10)[['State', 'Dist Name', 'YEAR'] if 'Dist Name' in df.columns else df.columns[:5]])
        
        # Check distinct values in 'Dist Name' if it exists
        if 'Dist Name' in df.columns:
             dists = df['Dist Name'].dropna().unique()
             print(f"\nUnique Districts found: {len(dists)}")
             print(dists[:10])
             
             # Check for Bastar or Jodhpur
             print(f"Has Bastar? {'BASTAR' in dists or 'Bastar' in dists}")
             print(f"Has Jodhpur? {'JODHPUR' in dists or 'Jodhpur' in dists}")
        else:
             print("'Dist Name' column not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_excel()

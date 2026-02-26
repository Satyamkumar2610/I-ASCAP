
import pandas as pd
import os
import re

INPUT_FILE = 'data/raw/satyam.xlsx'
OUTPUT_FILE = 'data/raw/ICRISAT_correct.csv'

def clean_col(col):
    # 'RICE AREA (1000 ha)' -> 'rice_area'
    # Remove units in parens
    c = re.sub(r'\s*\(.*?\)', '', col)
    c = c.lower().strip().replace(' ', '_')
    return c

def extract():
    print(f"Reading {INPUT_FILE}...")
    df = pd.read_excel(INPUT_FILE, sheet_name='Sheet2')
    
    # Rename columns
    new_cols = {c: clean_col(c) for c in df.columns}
    df.rename(columns=new_cols, inplace=True)
    
    # Standardize District Names?
    # No, let the Harmonizer do that using Fuzzy Matching. 
    # Just save raw dump with clean headers.
    
    print(f"Saving to {OUTPUT_FILE}...")
    df.to_csv(OUTPUT_FILE, index=False)
    print("Done.")

if __name__ == "__main__":
    extract()

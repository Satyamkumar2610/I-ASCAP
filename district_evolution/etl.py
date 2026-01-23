import pandas as pd
import json
import os
from .config import RAW_DATA_PATH, PROCESSED_DF_PATH, APP_DATA_JSON

def run_etl():
    """
    Reads raw Excel data, filters for district changes, saves processed CSV,
    and generates the data.json file for the frontend app.
    """
    print(f"Reading {RAW_DATA_PATH}...")
    if not os.path.exists(RAW_DATA_PATH):
        print(f"Error: {RAW_DATA_PATH} not found.")
        return False

    try:
        df = pd.read_excel(RAW_DATA_PATH)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return False

    # Clean columns
    df.columns = df.columns.str.strip()
    str_cols = ['source_district', 'dest_district', 'filter_state']
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
            
    # Filter for change events
    df_changes = df[df['source_district'] != df['dest_district']].copy()
    
    # --- RESEARCH COLUMNS (Placeholder Logic) ---
    # In a real scenario, these would come from the raw Excel or a separate mapping file.
    if 'census_code_2011' not in df_changes.columns:
        df_changes['census_code_2011'] = "Pending"
    if 'notification_date' not in df_changes.columns:
        df_changes['notification_date'] = df_changes['dest_year'].astype(str) # Default to year
    if 'split_type' not in df_changes.columns:
        # Simple heuristic: if mult source -> mult dest logic existed we could guess,
        # but here we just mark as Bifurcation Default
        df_changes['split_type'] = "Bifurcation"
    if 'geojson_id' not in df_changes.columns:
        df_changes['geojson_id'] = df_changes['dest_district'].apply(lambda x: str(x).lower().replace(" ", "_"))

    # Save CSV for other tools
    os.makedirs(os.path.dirname(PROCESSED_DF_PATH), exist_ok=True)
    df_changes.to_csv(PROCESSED_DF_PATH, index=False)
    print(f"Saved processed data to {PROCESSED_DF_PATH}")

    # Generate data.json for the App
    generate_app_json(df_changes)
    
    return True

def generate_app_json(df):
    """
    Converts the DataFrame into the JSON format expected by app.js.
    Structure:
    {
        "states": ["State A", "State B"],
        "records": [
            {"state": "...", "source": "...", "dest": "...", "sourceYear": 1950, "destYear": 2000}
        ]
    }
    """
    print("Generating app data.json...")
    
    states = sorted(df['filter_state'].unique().tolist())
    records = []
    
    for _, row in df.iterrows():
        # Handle years, default to 0 or similar if missing, though 1951/2024 range is expected
        try:
            # Assuming 'year' column exists or using logic from original files
            # The original files had 'dest_year' and implied source year logic.
            # Let's check columns normally present.
            # Based on previous file views, we have 'dest_year'.
            # We often treat source year as base (e.g. 1951) if not specified or different logic.
            # For simplicity and matching app.js expectations (sourceYear, destYear):
            
            dest_year = int(float(row['dest_year'])) if pd.notna(row['dest_year']) else 2024
            # Source year logic is tricky without a specific column, but typically
            # the parent exists from start (1951) or was created earlier.
            # For this visualization, we might just need valid integers.
            source_year = 1951 # Default
            
        except ValueError:
            dest_year = 0
            source_year = 0

        records.append({
            "state": row['filter_state'],
            "source": row['source_district'],
            "dest": row['dest_district'],
            "sourceYear": source_year,
            "destYear": dest_year
        })
        
    data = {
        "states": states,
        "records": records
    }
    
    with open(APP_DATA_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Saved app data to {APP_DATA_JSON}")

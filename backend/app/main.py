
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List, Optional
import pandas as pd
import logging
from .core.harmonizer import DistrictHarmonizer
from .core.climate import ClimateEngine

app = FastAPI(title="I-ASCAP Data API", description="Indian Agri-Spatial Comparative Analytics Platform")

# In-memory storage for demonstration purposes 
# In production, this would be a Postgres database
HARMONIZER = None
CLIMATE_ENGINE = None

@app.on_event("startup")
async def startup_event():
    global HARMONIZER
    # Load the District Harmonizer with the CSV data
    import os
    # Check possible locations for the data file
    possible_paths = [
        "data/processed/district_changes.csv",          # Docker / Repo Root
        "../data/processed/district_changes.csv",       # Local from backend/
        "../../data/processed/district_changes.csv"     # Local from backend/app/
    ]
    
    csv_path = None
    for path in possible_paths:
        if os.path.exists(path):
            csv_path = path
            break
            
    if csv_path:
        try:
            HARMONIZER = DistrictHarmonizer(csv_path)
            logging.info(f"DistrictHarmonizer loaded successfully from {csv_path}.")
        except Exception as e:
            logging.error(f"Failed to load DistrictHarmonizer: {e}")
    else:
        logging.error("Could not find district_changes.csv in any expected location.")

@app.get("/")
async def read_root():
    return {"message": "Welcome to I-ASCAP API"}

@app.get("/api/districts")
async def get_districts(year: int = 2024):
    """
    Returns a list of districts valid for the given year.
    If year is historical, returns the parent districts valid then.
    """
    # Placeholder logic
    return {"year": year, "districts": ["Adilabad", "Nirmal", "Mancherial"]}

@app.get("/api/data/agricultural")
async def get_ag_data(district_id: str, year: int, variable: str):
    """
    Returns agricultural data (Area, Production, Yield) for a district-year.
    If the district did not exist in that year, it attempts to apportion data from its parent.
    """
    # Logic to fetch from DB or Harmonizer
    if not HARMONIZER:
        raise HTTPException(status_code=500, detail="Harmonizer not initialized")
    
    # Check if district existed
    # If not, find parent -> get value -> apply weight -> return
    return {
        "district": district_id,
        "year": year,
        "variable": variable,
        "value": 1234.56,  # Mock value
        "is_imputed": True,
        "source": "Calculated from Parent District"
    }

@app.get("/api/lineage/{district_id}")
async def get_district_lineage(district_id: str):
    """
    Returns the lineage (ancestry) of a district.
    """
    if not HARMONIZER:
        return {"district": district_id, "parents": []}
    
    lineage = HARMONIZER.get_lineage(district_id)
    return {"district": district_id, "parents": lineage}

@app.post("/api/upload/data")
async def upload_data(file: UploadFile = File(...)):
    """
    Upload a CSV to ingest new agricultural data.
    """
    return {"filename": file.filename}

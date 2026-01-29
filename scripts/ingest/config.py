"""
Configuration for Data Ingestion Pipeline.
Environment-based settings with secure API key handling.
"""
import os
from pathlib import Path
from dataclasses import dataclass
from datetime import datetime

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"
QUARANTINE_DIR = DATA_DIR / "quarantine"

# Reference data
CDK_MASTER_PATH = DATA_DIR / "v1" / "district_master.csv"
LINEAGE_PATH = DATA_DIR / "v1" / "district_lineage.csv"

# API Configuration
API_KEY = os.environ.get(
    "DATA_GOV_API_KEY",
    "579b464db66ec23bdd0000011d0179460bed4f26443f90cf4bee20d0"
)
BASE_URL = "https://api.data.gov.in/resource/35be999b-0208-4354-b557-f6ca9a5355de"

# Ingestion parameters
BATCH_SIZE = 1000
MIN_YEAR = 1997
VALID_SEASONS = {"Kharif", "Rabi", "Whole Year", "Summer", "Winter", "Autumn"}

# State aliases (data.gov.in → canonical)
STATE_ALIASES = {
    "Orissa": "Odisha",
    "Uttaranchal": "Uttarakhand",
    "Pondicherry": "Puducherry",
    "Chattisgarh": "Chhattisgarh",
    "Andaman And Nicobar Islands": "Andaman and Nicobar Islands",
    "Dadra And Nagar Haveli": "Dadara & Nagar Havelli",
    "Jammu And Kashmir": "Jammu & Kashmir",
    "Delhi": "NCT of Delhi",
}

# District name aliases (data.gov.in → canonical CDK registry name)
# These handle renamed districts and alternate spellings
DISTRICT_ALIASES = {
    # Andhra Pradesh / Telangana
    "KADAPA": "Cuddapah",
    "YSR": "Cuddapah",
    
    # Assam - map to parent (Kamrup) since Metro is split
    "KAMRUP METRO": "Kamrup",
    "KAMRUP METROPOLITAN": "Kamrup",
    
    # Chhattisgarh
    "KABIRDHAM": "Kawardha",
    "KABEERDHAM": "Kawardha",
    "KOREA": "Koriya",
    
    # Jammu & Kashmir
    "BANDIPORA": "Baramula",  # Split from Baramula
    "SHOPIAN": "Pulwama",  # Split from Pulwama
    
    # Karnataka - Bangalore is the registry name
    "BANGALORE RURAL": "Bangalore",
    "BANGALORE URBAN": "Bangalore",
    "BENGALURU URBAN": "Bangalore",
    "BENGALURU RURAL": "Bangalore",
    "CHIKBALLAPUR": "Kolar",  # Split from Kolar
    
    # Madhya Pradesh
    "KHANDWA": "East Nimar",
    "EAST NIMAR (KHANDWA)": "East Nimar",
    "NARSINGHPUR": "Narsimhapur",
    
    # Maharashtra
    "RAIGAD": "Kolaba",
    "SATARA": "Satara",
    
    # Manipur - map to parent Manipur district
    "IMPHAL EAST": "Manipur Central",
    "IMPHAL WEST": "Manipur Central",
    
    # Punjab - Sahibzada Ajit Singh Nagar is the registry name
    "S.A.S NAGAR": "Sahibzada Ajit Singh Nagar",
    "S.A.S. NAGAR": "Sahibzada Ajit Singh Nagar",
    "MOHALI": "Sahibzada Ajit Singh Nagar",
    
    # Rajasthan
    "DHOLPUR": "Dhaulpur",
    
    # Tamil Nadu
    "DINDIGUL": "Dindigul Anna",
    "TUTICORIN": "Tirunelveli",  # Historical parent
    "THOOTHUKUDI": "Tirunelveli",
    
    # Uttar Pradesh
    "AMROHA": "Jyotiba Phule Nagar",
    "HAPUR": "Ghaziabad",  # Split from Ghaziabad
    "KANPUR DEHAT": "Kanpur",
    "KANPUR NAGAR": "Kanpur",
    "SAMBHAL": "Moradabad",  # Split from Moradabad
    "SHAMLI": "Muzaffarnagar",  # Split from Muzaffarnagar
    
    # Uttarakhand
    "PAURI GARHWAL": "Garhwal",
    
    # West Bengal - Medinipur is the registry name
    "DINAJPUR DAKSHIN": "West Dinajpur",
    "DINAJPUR UTTAR": "Uttar Dinajpur",
    "MEDINIPUR EAST": "Medinipur",
    "MEDINIPUR WEST": "Medinipur",
    "PURBA MEDINIPUR": "Purba Medinipur",  # Also exists as new district
    "PASCHIM MEDINIPUR": "Medinipur",
}




@dataclass
class IngestionConfig:
    """Runtime configuration for a single ingestion run."""
    run_id: str
    timestamp: datetime
    raw_output_dir: Path
    
    @classmethod
    def create(cls) -> "IngestionConfig":
        """Create new ingestion run configuration."""
        ts = datetime.now()
        run_id = f"ingest_{ts.strftime('%Y%m%d_%H%M%S')}"
        raw_output = RAW_DIR / run_id
        raw_output.mkdir(parents=True, exist_ok=True)
        
        return cls(
            run_id=run_id,
            timestamp=ts,
            raw_output_dir=raw_output,
        )


# Database
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/i_ascap"
)

# Logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

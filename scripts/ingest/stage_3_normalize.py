"""
Stage 3: Structural Normalization
Normalize raw records to consistent internal format.
"""
from typing import Dict, Any, List, Tuple
from .config import get_logger

logger = get_logger(__name__)

# Field mapping: API field -> canonical field
FIELD_MAP = {
    "state_name": "state_name",
    "district_name": "district_name",
    "crop_year": "year",
    "season": "season",
    "crop": "crop",
    "area_": "area",
    "production_": "production",
}


def normalize_record(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Normalize a single raw record.
    Returns (normalized_record, warnings).
    """
    warnings = []
    normalized = {"_original": raw.copy()}
    
    # Rename fields
    for api_field, canonical_field in FIELD_MAP.items():
        value = raw.get(api_field)
        normalized[canonical_field] = value
    
    # Type conversions
    # Year
    try:
        year_val = normalized.get("year")
        if year_val is not None:
            normalized["year"] = int(float(year_val))
    except (ValueError, TypeError):
        warnings.append(f"invalid_year:{normalized.get('year')}")
        normalized["year"] = None
    
    # Area
    try:
        area_val = normalized.get("area")
        if area_val is not None and area_val != "":
            normalized["area"] = float(area_val)
        else:
            normalized["area"] = None
    except (ValueError, TypeError):
        warnings.append(f"invalid_area:{normalized.get('area')}")
        normalized["area"] = None
    
    # Production
    try:
        prod_val = normalized.get("production")
        if prod_val is not None and prod_val != "":
            normalized["production"] = float(prod_val)
        else:
            normalized["production"] = None
    except (ValueError, TypeError):
        warnings.append(f"invalid_production:{normalized.get('production')}")
        normalized["production"] = None
    
    # Text normalization
    if normalized.get("state_name"):
        normalized["state_name"] = str(normalized["state_name"]).strip()
    
    if normalized.get("district_name"):
        normalized["district_name"] = str(normalized["district_name"]).strip().upper()
    
    if normalized.get("crop"):
        normalized["crop"] = str(normalized["crop"]).strip().lower()
    
    if normalized.get("season"):
        normalized["season"] = str(normalized["season"]).strip()
    
    return normalized, warnings


def normalize_batch(records: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict]]:
    """
    Normalize a batch of records.
    Returns (normalized_records, warning_records).
    """
    normalized = []
    with_warnings = []
    
    for raw in records:
        norm, warnings = normalize_record(raw)
        normalized.append(norm)
        
        if warnings:
            norm["_warnings"] = warnings
            with_warnings.append(norm)
    
    return normalized, with_warnings


def run_normalization(records: List[Dict[str, Any]]) -> List[Dict]:
    """Execute normalization stage."""
    logger.info("=" * 60)
    logger.info("STAGE 3: STRUCTURAL NORMALIZATION")
    logger.info("=" * 60)
    
    normalized, with_warnings = normalize_batch(records)
    
    logger.info(f"✓ Normalized: {len(normalized):,} records")
    logger.info(f"⚠ With warnings: {len(with_warnings):,} records")
    
    return normalized

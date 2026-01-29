"""
Stage 1: API Discovery
Determine pagination and validate API connection.
"""
import requests
from typing import Dict, Any, Tuple

from .config import API_KEY, BASE_URL, BATCH_SIZE, get_logger

logger = get_logger(__name__)


def discover_api() -> Dict[str, Any]:
    """
    Discover API metadata and plan pagination.
    Returns discovery info including total records and page count.
    """
    logger.info("=" * 60)
    logger.info("STAGE 1: API DISCOVERY")
    logger.info("=" * 60)
    
    # Test API call
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1,
        "offset": 0,
    }
    
    logger.info(f"Testing API: {BASE_URL}")
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"API test failed: {e}")
        raise RuntimeError(f"API connection failed: {e}")
    
    data = response.json()
    
    # Extract metadata
    total_records = data.get("total", 0)
    fields = data.get("field", [])
    field_names = [f["id"] for f in fields]
    
    # Calculate pagination
    total_pages = (total_records + BATCH_SIZE - 1) // BATCH_SIZE
    
    discovery = {
        "total_records": total_records,
        "batch_size": BATCH_SIZE,
        "total_pages": total_pages,
        "fields": field_names,
        "api_version": data.get("version", "unknown"),
        "status": data.get("status", "unknown"),
    }
    
    logger.info(f"✓ API Status: {discovery['status']}")
    logger.info(f"✓ Total Records: {total_records:,}")
    logger.info(f"✓ Batch Size: {BATCH_SIZE}")
    logger.info(f"✓ Total Pages: {total_pages}")
    logger.info(f"✓ Fields: {field_names}")
    
    # Sample record
    if data.get("records"):
        logger.info(f"✓ Sample Record: {data['records'][0]}")
    
    return discovery


def validate_discovery(discovery: Dict[str, Any]) -> bool:
    """Validate discovery results."""
    if discovery["total_records"] == 0:
        logger.error("No records found in API")
        return False
    
    required_fields = {"state_name", "district_name", "crop_year", "crop", "area_", "production_"}
    available_fields = set(discovery["fields"])
    
    missing = required_fields - available_fields
    if missing:
        logger.error(f"Missing required fields: {missing}")
        return False
    
    logger.info("✓ Discovery validation passed")
    return True


if __name__ == "__main__":
    discovery = discover_api()
    validate_discovery(discovery)

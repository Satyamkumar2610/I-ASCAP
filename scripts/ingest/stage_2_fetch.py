"""
Stage 2: Raw Data Ingestion
Fetch all records from API without transformation.
"""
import json
import time
import requests
from pathlib import Path
from typing import Dict, Any, List, Generator

from .config import API_KEY, BASE_URL, BATCH_SIZE, IngestionConfig, get_logger

logger = get_logger(__name__)


def fetch_page(offset: int, limit: int = BATCH_SIZE) -> Dict[str, Any]:
    """Fetch a single page of data from the API."""
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }
    
    response = requests.get(BASE_URL, params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def fetch_all_pages(
    total_records: int,
    config: IngestionConfig,
    save_intermediate: bool = True,
) -> Generator[List[Dict], None, None]:
    """
    Fetch all pages from API with progress tracking.
    Yields batches of records.
    """
    logger.info("=" * 60)
    logger.info("STAGE 2: RAW DATA INGESTION")
    logger.info("=" * 60)
    
    total_pages = (total_records + BATCH_SIZE - 1) // BATCH_SIZE
    all_records = []
    failed_pages = []
    
    for page in range(total_pages):
        offset = page * BATCH_SIZE
        
        try:
            data = fetch_page(offset)
            records = data.get("records", [])
            count = len(records)
            
            logger.info(f"Page {page + 1}/{total_pages}: offset={offset}, records={count}")
            
            if save_intermediate and records:
                # Save raw page
                page_file = config.raw_output_dir / f"page_{page:04d}.json"
                with open(page_file, "w") as f:
                    json.dump(records, f)
            
            all_records.extend(records)
            yield records
            
            # Rate limiting
            time.sleep(0.2)
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch page {page}: {e}")
            failed_pages.append({"page": page, "offset": offset, "error": str(e)})
            continue
    
    # Save combined raw data
    combined_file = config.raw_output_dir / "raw_combined.json"
    with open(combined_file, "w") as f:
        json.dump(all_records, f)
    
    logger.info(f"✓ Total records fetched: {len(all_records):,}")
    logger.info(f"✓ Raw data saved to: {config.raw_output_dir}")
    
    if failed_pages:
        logger.warning(f"⚠ Failed pages: {len(failed_pages)}")
        failed_file = config.raw_output_dir / "failed_pages.json"
        with open(failed_file, "w") as f:
            json.dump(failed_pages, f)


def run_ingestion(total_records: int, config: IngestionConfig) -> List[Dict]:
    """Execute full ingestion and return all records."""
    all_records = []
    for batch in fetch_all_pages(total_records, config):
        all_records.extend(batch)
    return all_records


if __name__ == "__main__":
    from .stage_1_discovery import discover_api
    
    discovery = discover_api()
    config = IngestionConfig.create()
    records = run_ingestion(discovery["total_records"], config)
    print(f"Fetched {len(records)} records")

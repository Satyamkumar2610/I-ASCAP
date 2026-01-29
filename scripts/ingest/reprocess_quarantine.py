#!/usr/bin/env python3
"""
Re-process quarantined records with updated aliases.
"""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import json

from scripts.ingest.config import IngestionConfig, QUARANTINE_DIR, get_logger
from scripts.ingest.stage_0_preflight import run_preflight
from scripts.ingest.stage_3_normalize import run_normalization
from scripts.ingest.stage_5_resolve import resolve_records
from scripts.ingest.stage_6_lineage import align_lineage
from scripts.ingest.stage_7_canonicalize import run_canonicalization
from scripts.ingest.stage_8_store import store_metrics, quarantine_records

logger = get_logger("reprocess")


def reprocess_quarantine(quarantine_file: str):
    """Re-process quarantined records with updated aliases."""
    logger.info("=" * 60)
    logger.info("RE-PROCESSING QUARANTINED RECORDS")
    logger.info("=" * 60)
    
    # Load quarantined records
    with open(quarantine_file) as f:
        records = json.load(f)
    
    logger.info(f"Loaded {len(records)} quarantined records")
    
    # Initialize
    config = IngestionConfig.create()
    ref_data = run_preflight()
    
    # Skip normalization - already done, just re-resolve
    # But we need to reformat first
    normalized = []
    for rec in records:
        normalized.append({
            "state_name": rec.get("state_name"),
            "district_name": rec.get("district_name"),
            "year": rec.get("year"),
            "season": rec.get("season"),
            "crop": rec.get("crop"),
            "area": rec.get("area"),
            "production": rec.get("production"),
        })
    
    # Re-run CDK resolution with updated aliases
    resolved, still_unresolved = resolve_records(normalized, ref_data)
    
    if still_unresolved:
        logger.warning(f"Still unresolved: {len(still_unresolved)}")
        quarantine_records(still_unresolved, "still_unresolved", config)
    
    if not resolved:
        logger.info("No records resolved this time")
        return
    
    # Continue pipeline
    aligned, misaligned = align_lineage(resolved, ref_data)
    metrics = run_canonicalization(aligned, config)
    
    if metrics:
        store_stats = store_metrics(metrics, config)
        logger.info(f"Stored {store_stats.get('inserted', 0)} new metrics")
    
    logger.info("Re-processing complete")


if __name__ == "__main__":
    import sys
    
    # Find latest quarantine file
    quarantine_files = list(QUARANTINE_DIR.glob("*_cdk_unresolved.json"))
    if not quarantine_files:
        print("No quarantine files found")
        sys.exit(1)
    
    latest = max(quarantine_files, key=lambda p: p.stat().st_mtime)
    print(f"Processing: {latest}")
    
    reprocess_quarantine(str(latest))

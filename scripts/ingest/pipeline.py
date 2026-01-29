#!/usr/bin/env python3
"""
Main Ingestion Pipeline Orchestrator
Executes all 10 stages sequentially.
"""
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.ingest.config import IngestionConfig, get_logger
from scripts.ingest.stage_0_preflight import run_preflight
from scripts.ingest.stage_1_discovery import discover_api, validate_discovery
from scripts.ingest.stage_2_fetch import run_ingestion
from scripts.ingest.stage_3_normalize import run_normalization
from scripts.ingest.stage_4_validate import run_validation
from scripts.ingest.stage_5_resolve import resolve_records
from scripts.ingest.stage_6_lineage import align_lineage
from scripts.ingest.stage_7_canonicalize import run_canonicalization
from scripts.ingest.stage_8_store import store_metrics, quarantine_records
from scripts.ingest.stage_9_audit import generate_report, hard_stop

logger = get_logger("pipeline")


def run_pipeline(skip_fetch: bool = False, raw_file: str = None):
    """
    Execute full ingestion pipeline.
    
    Args:
        skip_fetch: If True, load from existing raw file instead of API
        raw_file: Path to existing raw JSON file
    """
    logger.info("=" * 70)
    logger.info("AGRICULTURAL DATA INGESTION PIPELINE")
    logger.info("=" * 70)
    
    # Initialize
    config = IngestionConfig.create()
    logger.info(f"Run ID: {config.run_id}")
    
    stats = {
        "records_fetched": 0,
        "records_normalized": 0,
        "records_valid": 0,
        "records_resolved": 0,
        "records_aligned": 0,
        "metrics_generated": 0,
        "metrics_stored": 0,
        "records_quarantined": 0,
    }
    
    try:
        # Stage 0: Pre-flight
        ref_data = run_preflight()
        
        # Stage 1: Discovery
        discovery = discover_api()
        if not validate_discovery(discovery):
            raise RuntimeError("API discovery validation failed")
        
        # Stage 2: Fetch
        if skip_fetch and raw_file:
            import json
            logger.info(f"Loading from file: {raw_file}")
            with open(raw_file) as f:
                raw_records = json.load(f)
        else:
            raw_records = run_ingestion(discovery["total_records"], config)
        
        stats["records_fetched"] = len(raw_records)
        
        # Stage 3: Normalize
        normalized = run_normalization(raw_records)
        stats["records_normalized"] = len(normalized)
        
        # Stage 4: Validate
        valid_records, invalid_records = run_validation(normalized)
        stats["records_valid"] = len(valid_records)
        
        if invalid_records:
            quarantine_records(invalid_records, "validation_failed", config)
            stats["records_quarantined"] += len(invalid_records)
        
        # Stage 5: CDK Resolution
        resolved, unresolved = resolve_records(valid_records, ref_data)
        stats["records_resolved"] = len(resolved)
        
        if unresolved:
            quarantine_records(unresolved, "cdk_unresolved", config)
            stats["records_quarantined"] += len(unresolved)
        
        # Stage 6: Lineage Alignment
        aligned, misaligned = align_lineage(resolved, ref_data)
        stats["records_aligned"] = len(aligned)
        
        # Note: We don't quarantine misaligned - they're still valid data
        # just potentially requiring attention
        
        # Stage 7: Canonicalize
        metrics = run_canonicalization(aligned, config)
        stats["metrics_generated"] = len(metrics)
        
        # Stage 8: Store
        store_stats = store_metrics(metrics, config)
        stats["metrics_stored"] = store_stats.get("inserted", 0)
        
        # Stage 9: Report
        generate_report(config, stats)
        
        # Stage 10: STOP
        hard_stop()
        
        return stats
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run ingestion pipeline")
    parser.add_argument("--skip-fetch", action="store_true", help="Skip API fetch")
    parser.add_argument("--raw-file", type=str, help="Load from existing raw JSON")
    
    args = parser.parse_args()
    
    stats = run_pipeline(skip_fetch=args.skip_fetch, raw_file=args.raw_file)
    
    print("\n✅ PIPELINE COMPLETE")
    print(f"   Records fetched: {stats['records_fetched']:,}")
    print(f"   Metrics stored: {stats['metrics_stored']:,}")

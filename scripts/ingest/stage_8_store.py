"""
Stage 8: Cleaned Data Storage
Persist metrics to database with idempotency.
"""
import json
import psycopg2
from pathlib import Path
from typing import Dict, Any, List

from .config import DATABASE_URL, QUARANTINE_DIR, get_logger, IngestionConfig

logger = get_logger(__name__)


def store_metrics(
    metrics: List[Dict[str, Any]],
    config: IngestionConfig,
    batch_size: int = 1000,
) -> Dict[str, int]:
    """
    Store metrics to database.
    Returns counts of inserted/skipped/failed.
    """
    logger.info("=" * 60)
    logger.info("STAGE 8: CLEANED DATA STORAGE")
    logger.info("=" * 60)
    
    stats = {"inserted": 0, "skipped": 0, "failed": 0}
    
    # Connect
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Ensure table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agri_metrics_new (
            id SERIAL PRIMARY KEY,
            cdk VARCHAR(50) NOT NULL,
            year INTEGER NOT NULL,
            variable_name VARCHAR(100) NOT NULL,
            value DOUBLE PRECISION,
            unit VARCHAR(50),
            season VARCHAR(50),
            source VARCHAR(100),
            ingested_at TIMESTAMP,
            UNIQUE(cdk, year, variable_name, season, source)
        )
    """)
    conn.commit()
    
    # Insert in batches
    insert_sql = """
        INSERT INTO agri_metrics_new (cdk, year, variable_name, value, unit, season, source, ingested_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (cdk, year, variable_name, season, source) DO NOTHING
    """
    
    batch = []
    for metric in metrics:
        row = (
            metric.get("cdk"),
            metric.get("year"),
            metric.get("variable_name"),
            metric.get("value"),
            metric.get("unit"),
            metric.get("season"),
            metric.get("source"),
            metric.get("ingested_at"),
        )
        batch.append(row)
        
        if len(batch) >= batch_size:
            try:
                cursor.executemany(insert_sql, batch)
                stats["inserted"] += cursor.rowcount
                conn.commit()
            except Exception as e:
                logger.error(f"Batch insert failed: {e}")
                stats["failed"] += len(batch)
                conn.rollback()
            batch = []
    
    # Final batch
    if batch:
        try:
            cursor.executemany(insert_sql, batch)
            stats["inserted"] += cursor.rowcount
            conn.commit()
        except Exception as e:
            logger.error(f"Final batch insert failed: {e}")
            stats["failed"] += len(batch)
            conn.rollback()
    
    cursor.close()
    conn.close()
    
    logger.info(f"✓ Inserted: {stats['inserted']:,}")
    logger.info(f"⊘ Skipped (duplicates): {stats['skipped']:,}")
    logger.info(f"✗ Failed: {stats['failed']:,}")
    
    return stats


def quarantine_records(
    records: List[Dict[str, Any]],
    reason: str,
    config: IngestionConfig,
):
    """Save failed/invalid records to quarantine."""
    if not records:
        return
    
    QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)
    
    filename = f"{config.run_id}_{reason}.json"
    filepath = QUARANTINE_DIR / filename
    
    # Clean records for JSON serialization
    clean_records = []
    for r in records:
        clean = {k: v for k, v in r.items() if not k.startswith("_")}
        clean["_reason"] = reason
        clean_records.append(clean)
    
    with open(filepath, "w") as f:
        json.dump(clean_records, f, indent=2, default=str)
    
    logger.info(f"⚠ Quarantined {len(records)} records → {filepath}")

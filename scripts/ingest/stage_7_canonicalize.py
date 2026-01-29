"""
Stage 7: Metric Canonicalization
Convert to analytics-ready format.
"""
from typing import Dict, Any, List
from datetime import datetime

from .config import get_logger, IngestionConfig

logger = get_logger(__name__)


def canonicalize_record(record: Dict[str, Any], config: IngestionConfig) -> List[Dict[str, Any]]:
    """
    Convert a single record to canonical metrics.
    Returns list of metric rows (area, production, yield).
    """
    metrics = []
    
    cdk = record.get("cdk")
    year = record.get("year")
    crop = record.get("crop", "unknown")
    season = record.get("season", "unknown")
    area = record.get("area")
    production = record.get("production")
    
    base = {
        "cdk": cdk,
        "year": year,
        "season": season,
        "metric_type": "agri",
        "source": f"data.gov.in_{config.run_id}",
        "ingested_at": config.timestamp.isoformat(),
    }
    
    # Area metric
    if area is not None and area > 0:
        metrics.append({
            **base,
            "variable_name": f"{crop}_area",
            "value": area,
            "unit": "hectares",
        })
    
    # Production metric
    if production is not None and production > 0:
        metrics.append({
            **base,
            "variable_name": f"{crop}_production",
            "value": production,
            "unit": "tonnes",
        })
    
    # Calculated Yield
    if area is not None and area > 0 and production is not None:
        yield_val = production / area
        metrics.append({
            **base,
            "variable_name": f"{crop}_yield",
            "value": round(yield_val, 4),
            "unit": "tonnes/hectare",
            "_derived": True,
        })
    
    return metrics


def run_canonicalization(
    records: List[Dict[str, Any]],
    config: IngestionConfig,
) -> List[Dict[str, Any]]:
    """
    Execute canonicalization stage.
    Returns list of canonical metric rows.
    """
    logger.info("=" * 60)
    logger.info("STAGE 7: METRIC CANONICALIZATION")
    logger.info("=" * 60)
    
    metrics = []
    crops = set()
    
    for record in records:
        record_metrics = canonicalize_record(record, config)
        metrics.extend(record_metrics)
        
        crop = record.get("crop")
        if crop:
            crops.add(crop)
    
    # Count by variable type
    var_counts = {}
    for m in metrics:
        var = m.get("variable_name", "").split("_")[-1]
        var_counts[var] = var_counts.get(var, 0) + 1
    
    logger.info(f"✓ Total metrics generated: {len(metrics):,}")
    logger.info(f"✓ Unique crops: {len(crops)}")
    logger.info("Metrics by type:")
    for var, count in sorted(var_counts.items()):
        logger.info(f"  - {var}: {count:,}")
    
    return metrics

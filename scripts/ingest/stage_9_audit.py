"""
Stage 9: Audit & Reporting
Generate reproducibility metadata.
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from .config import get_logger, IngestionConfig

logger = get_logger(__name__)


def generate_report(
    config: IngestionConfig,
    stats: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate ingestion audit report.
    """
    logger.info("=" * 60)
    logger.info("STAGE 9: AUDIT & REPORTING")
    logger.info("=" * 60)
    
    report = {
        "run_id": config.run_id,
        "dataset": "district_crop_production_1997",
        "source": "data.gov.in",
        "api_resource": "35be999b-0208-4354-b557-f6ca9a5355de",
        "timestamp": config.timestamp.isoformat(),
        "completed_at": datetime.now().isoformat(),
        "stats": stats,
    }
    
    # Save report
    report_path = config.raw_output_dir / "ingestion_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    logger.info(f"✓ Report saved: {report_path}")
    
    # Print summary
    logger.info("=" * 60)
    logger.info("INGESTION SUMMARY")
    logger.info("=" * 60)
    
    for key, value in stats.items():
        if isinstance(value, (int, float)):
            logger.info(f"  {key}: {value:,}")
        else:
            logger.info(f"  {key}: {value}")
    
    return report


def hard_stop():
    """
    Stage 10: HARD STOP
    Explicitly prevent any analytics or harmonization.
    """
    logger.info("=" * 60)
    logger.info("STAGE 10: HARD STOP")
    logger.info("=" * 60)
    logger.info("❌ DO NOT proceed with:")
    logger.info("   - Boundary harmonization")
    logger.info("   - District aggregation")
    logger.info("   - Trend computation")
    logger.info("   - Impact analysis")
    logger.info("")
    logger.info("✓ Ingestion pipeline complete")
    logger.info("✓ Data ready for analytics agents")
    logger.info("=" * 60)

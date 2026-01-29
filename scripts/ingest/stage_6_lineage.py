"""
Stage 6: Lineage Alignment
Verify temporal validity against district lineage.
"""
from typing import Dict, Any, List, Tuple

from .config import get_logger
from .stage_0_preflight import ReferenceData

logger = get_logger(__name__)


def align_lineage(
    records: List[Dict[str, Any]],
    ref_data: ReferenceData,
) -> Tuple[List[Dict], List[Dict]]:
    """
    Check lineage validity for all records.
    Returns (aligned_records, misaligned_records).
    """
    logger.info("=" * 60)
    logger.info("STAGE 6: LINEAGE ALIGNMENT")
    logger.info("=" * 60)
    
    aligned = []
    misaligned = []
    
    for record in records:
        cdk = record.get("cdk")
        year = record.get("year")
        
        if not cdk or not year:
            # Should not happen at this stage
            record["_lineage_issue"] = "missing_cdk_or_year"
            misaligned.append(record)
            continue
        
        is_valid, reason = ref_data.check_lineage_validity(cdk, year)
        
        if is_valid:
            record["_lineage_status"] = "valid"
            aligned.append(record)
        else:
            record["_lineage_issue"] = reason
            misaligned.append(record)
    
    logger.info(f"✓ Aligned: {len(aligned):,} records")
    logger.info(f"⚠ Misaligned: {len(misaligned):,} records")
    
    # Note: We preserve misaligned records - they may indicate
    # data for districts before they officially existed, but
    # this is a DATA issue, not a pipeline failure
    
    if misaligned:
        logger.warning("Note: Misaligned records preserved for analysis")
        logger.warning("These may indicate data quality issues in source")
    
    return aligned, misaligned

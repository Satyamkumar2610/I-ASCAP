"""
Stage 5: CDK Resolution
Map district names to authoritative CDKs.
"""
from typing import Dict, Any, List, Tuple

from .config import get_logger
from .stage_0_preflight import ReferenceData

logger = get_logger(__name__)


def resolve_records(
    records: List[Dict[str, Any]],
    ref_data: ReferenceData,
) -> Tuple[List[Dict], List[Dict]]:
    """
    Resolve CDKs for all records.
    Returns (resolved_records, unresolved_records).
    """
    logger.info("=" * 60)
    logger.info("STAGE 5: CDK RESOLUTION")
    logger.info("=" * 60)
    
    resolved = []
    unresolved = []
    method_counts = {}
    
    for record in records:
        state = record.get("state_name", "")
        district = record.get("district_name", "")
        
        cdk, method = ref_data.resolve_cdk(state, district)
        
        if cdk:
            record["cdk"] = cdk
            record["_resolution_method"] = method
            resolved.append(record)
            
            method_counts[method] = method_counts.get(method, 0) + 1
        else:
            record["cdk"] = None
            record["_resolution_failure"] = method
            unresolved.append(record)
    
    logger.info(f"✓ Resolved: {len(resolved):,} records")
    logger.info(f"✗ Unresolved: {len(unresolved):,} records")
    
    if method_counts:
        logger.info("Resolution methods:")
        for method, count in sorted(method_counts.items(), key=lambda x: -x[1]):
            logger.info(f"  - {method}: {count:,}")
    
    # Log sample unresolved
    if unresolved:
        logger.warning("Sample unresolved districts:")
        seen = set()
        for rec in unresolved[:20]:
            key = (rec.get("state_name"), rec.get("district_name"))
            if key not in seen:
                logger.warning(f"  - {key}")
                seen.add(key)
    
    return resolved, unresolved

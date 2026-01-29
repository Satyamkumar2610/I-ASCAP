"""
Stage 4: Temporal Validation
Validate time dimension of records.
"""
from typing import Dict, Any, List, Tuple

from .config import MIN_YEAR, VALID_SEASONS, get_logger

logger = get_logger(__name__)


def validate_record(record: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate temporal aspects of a record.
    Returns (is_valid, issues).
    """
    issues = []
    
    # Year validation
    year = record.get("year")
    if year is None:
        issues.append("missing_year")
    elif not isinstance(year, int):
        issues.append(f"non_integer_year:{year}")
    elif year < MIN_YEAR:
        issues.append(f"year_before_min:{year}<{MIN_YEAR}")
    elif year > 2025:
        issues.append(f"future_year:{year}")
    
    # Season validation
    season = record.get("season")
    if not season:
        issues.append("missing_season")
    elif season not in VALID_SEASONS:
        # Allow some flexibility
        if season.title() in VALID_SEASONS:
            record["season"] = season.title()
        else:
            issues.append(f"unknown_season:{season}")
    
    # Crop validation
    crop = record.get("crop")
    if not crop or str(crop).strip() == "":
        issues.append("missing_crop")
    
    # Basic value sanity
    area = record.get("area")
    production = record.get("production")
    
    if area is not None and area < 0:
        issues.append(f"negative_area:{area}")
    
    if production is not None and production < 0:
        issues.append(f"negative_production:{production}")
    
    return len(issues) == 0, issues


def run_validation(records: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict]]:
    """
    Execute validation stage.
    Returns (valid_records, invalid_records).
    """
    logger.info("=" * 60)
    logger.info("STAGE 4: TEMPORAL VALIDATION")
    logger.info("=" * 60)
    
    valid = []
    invalid = []
    issue_counts = {}
    
    for record in records:
        is_valid, issues = validate_record(record)
        
        if is_valid:
            valid.append(record)
        else:
            record["_validation_issues"] = issues
            invalid.append(record)
            
            for issue in issues:
                issue_type = issue.split(":")[0]
                issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
    
    logger.info(f"✓ Valid records: {len(valid):,}")
    logger.info(f"✗ Invalid records: {len(invalid):,}")
    
    if issue_counts:
        logger.info("Issue breakdown:")
        for issue, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
            logger.info(f"  - {issue}: {count:,}")
    
    return valid, invalid

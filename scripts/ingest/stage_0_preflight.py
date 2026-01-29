"""
Stage 0: Pre-flight Initialization
Load configuration and reference data before ingestion.
"""
import pandas as pd
from pathlib import Path
from typing import Dict, Set, Tuple
from difflib import get_close_matches

from .config import (
    CDK_MASTER_PATH, LINEAGE_PATH, get_logger, STATE_ALIASES, DISTRICT_ALIASES
)

logger = get_logger(__name__)


def simple_normalize(name: str) -> str:
    """Normalize district name for matching."""
    return "".join(c for c in str(name).lower().strip() if c.isalnum())


class ReferenceData:
    """Container for all reference data needed during ingestion."""
    
    def __init__(self):
        self.cdk_registry: Dict[Tuple[str, str], str] = {}  # (state, norm_name) -> CDK
        self.cdk_to_meta: Dict[str, dict] = {}  # CDK -> {state, name, valid_from, valid_to}
        self.lineage_df: pd.DataFrame = None
        self.all_states: Set[str] = set()
        self.all_norm_names: Set[str] = set()
    
    def load(self) -> "ReferenceData":
        """Load all reference data."""
        logger.info("Loading reference data...")
        
        # Load CDK Master
        if not Path(CDK_MASTER_PATH).exists():
            raise FileNotFoundError(f"CDK Master not found: {CDK_MASTER_PATH}")
        
        master_df = pd.read_csv(CDK_MASTER_PATH)
        logger.info(f"Loaded {len(master_df)} districts from CDK Master")
        
        for _, row in master_df.iterrows():
            cdk = row["cdk"]
            state = row["state_name"]
            name = row["district_name"]
            norm_name = simple_normalize(name)
            
            self.cdk_registry[(state, norm_name)] = cdk
            self.cdk_to_meta[cdk] = {
                "state": state,
                "name": name,
                "valid_from": row.get("valid_from", 1951),
                "valid_to": row.get("valid_to", 2024),
            }
            self.all_states.add(state)
            self.all_norm_names.add(norm_name)
        
        # Load Lineage
        if Path(LINEAGE_PATH).exists():
            self.lineage_df = pd.read_csv(LINEAGE_PATH)
            logger.info(f"Loaded {len(self.lineage_df)} lineage events")
        else:
            logger.warning(f"Lineage file not found: {LINEAGE_PATH}")
            self.lineage_df = pd.DataFrame()
        
        return self
    
    def resolve_state(self, raw_state: str) -> str:
        """Resolve state name using aliases."""
        # Try exact match first
        if raw_state in self.all_states:
            return raw_state
        
        # Try alias
        canonical = STATE_ALIASES.get(raw_state)
        if canonical and canonical in self.all_states:
            return canonical
        
        # Try case-insensitive
        for state in self.all_states:
            if state.lower() == raw_state.lower():
                return state
        
        return raw_state  # Return original if no match
    
    def resolve_cdk(self, state: str, district: str) -> Tuple[str, str]:
        """
        Resolve (state, district) to CDK.
        Returns (CDK, resolution_method) or (None, failure_reason).
        """
        resolved_state = self.resolve_state(state)
        
        # Apply district alias if available
        district_upper = district.strip().upper()
        aliased_district = DISTRICT_ALIASES.get(district_upper, district)
        
        norm_name = simple_normalize(aliased_district)
        
        # Exact match
        key = (resolved_state, norm_name)
        if key in self.cdk_registry:
            method = "alias" if district_upper in DISTRICT_ALIASES else "exact"
            return self.cdk_registry[key], method
        
        # Try matching just by normalized name (ambiguous but useful)
        candidates = [
            (s, n) for (s, n) in self.cdk_registry.keys()
            if n == norm_name
        ]
        
        if len(candidates) == 1:
            return self.cdk_registry[candidates[0]], "name_only"
        elif len(candidates) > 1:
            # Multiple matches - try to disambiguate by state similarity
            for s, n in candidates:
                if resolved_state.lower() in s.lower() or s.lower() in resolved_state.lower():
                    return self.cdk_registry[(s, n)], "state_fuzzy"
        
        # Fuzzy name match
        matches = get_close_matches(norm_name, list(self.all_norm_names), n=1, cutoff=0.85)
        if matches:
            fuzzy_name = matches[0]
            for (s, n), cdk in self.cdk_registry.items():
                if n == fuzzy_name and (s == resolved_state or resolved_state.lower() in s.lower()):
                    return cdk, "fuzzy"
        
        return None, f"unresolved:{resolved_state}:{district}"
    
    def check_lineage_validity(self, cdk: str, year: int) -> Tuple[bool, str]:
        """Check if CDK was valid in the given year."""
        meta = self.cdk_to_meta.get(cdk)
        if not meta:
            return False, "cdk_not_found"
        
        valid_from = meta.get("valid_from", 1951)
        valid_to = meta.get("valid_to", 2024)
        
        if valid_from <= year <= valid_to:
            return True, "valid"
        else:
            return False, f"out_of_range:{valid_from}-{valid_to}"


def run_preflight() -> ReferenceData:
    """Execute pre-flight checks and return reference data."""
    logger.info("=" * 60)
    logger.info("STAGE 0: PRE-FLIGHT INITIALIZATION")
    logger.info("=" * 60)
    
    ref_data = ReferenceData().load()
    
    logger.info(f"✓ Loaded {len(ref_data.cdk_registry)} CDK mappings")
    logger.info(f"✓ Loaded {len(ref_data.all_states)} unique states")
    logger.info(f"✓ Lineage events: {len(ref_data.lineage_df)}")
    logger.info("✓ Pre-flight complete")
    
    return ref_data


if __name__ == "__main__":
    run_preflight()

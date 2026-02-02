"""
Lineage Repository: Data access for lineage events (CSV-based).
"""
import csv
from pathlib import Path
from typing import List, Dict, Optional, Set
from functools import lru_cache

from app.config import get_settings
from app.schemas.lineage import LineageEvent, EventType

settings = get_settings()


class LineageRepository:
    """
    Repository for lineage event data.
    Currently reads from CSV; designed for future DB migration.
    """
    
    def __init__(self, lineage_path: Optional[str] = None):
        self.lineage_path = Path(lineage_path or settings.lineage_csv_path)
        self._cache: Optional[List[LineageEvent]] = None
    
    def _load_events(self) -> List[LineageEvent]:
        """Load and parse lineage CSV."""
        if self._cache is not None:
            return self._cache
        
        events = []
        
        # Try multiple possible paths
        possible_paths = [
            self.lineage_path,
            Path("/app/data/v1/district_lineage.csv"),
            Path("../data/v1/district_lineage.csv"),
            Path("data/v1/district_lineage.csv"),
            Path("backend/data/v1/district_lineage.csv"),
        ]
        
        csv_path = None
        for p in possible_paths:
            if p.exists():
                csv_path = p
                break
        
        if not csv_path:
            return []
        
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # CSV columns: parent_cdk, child_cdk, event_year, event_type, confidence_score, weight_type
                    parent = row.get("parent_cdk", "")
                    child = row.get("child_cdk", "")
                    year = int(row.get("event_year", 0))
                    
                    if not parent or not child or year == 0:
                        continue
                    
                    event = LineageEvent(
                        id=f"{parent}_{year}",
                        parent_cdk=parent,
                        children_cdks=[child],
                        children_names=[],
                        children_count=1,
                        event_year=year,
                        event_type=EventType.SPLIT,
                        confidence=float(row.get("confidence_score", 1.0)),
                    )
                    events.append(event)
                except (ValueError, KeyError):
                    continue
        
        self._cache = events
        return events
    
    def get_all_events(self) -> List[LineageEvent]:
        """Get all lineage events."""
        return self._load_events()
    
    def get_events_by_state(
        self, 
        state: str, 
        cdk_to_state: Dict[str, str]
    ) -> List[LineageEvent]:
        """Filter events where parent or child belongs to given state."""
        events = self._load_events()
        filtered = []
        
        for e in events:
            parent_state = cdk_to_state.get(e.parent_cdk)
            child_states = [cdk_to_state.get(c) for c in e.children_cdks]
            
            if parent_state == state or state in child_states:
                filtered.append(e)
        
        return filtered
    
    def group_by_parent_year(
        self, 
        events: List[LineageEvent]
    ) -> Dict[str, Dict]:
        """
        Group events by parent_cdk|year to consolidate multi-child splits.
        Returns dict with grouped event info.
        """
        groups: Dict[str, Dict] = {}
        
        for e in events:
            key = f"{e.parent_cdk}|{e.event_year}"
            if key not in groups:
                groups[key] = {
                    "parent_cdk": e.parent_cdk,
                    "event_year": e.event_year,
                    "children": set(),
                    "confidence": e.confidence,
                }
            groups[key]["children"].update(e.children_cdks)
        
        return groups
    
    def get_parent_cdks(self) -> Set[str]:
        """Get all unique parent CDKs."""
        events = self._load_events()
        return {e.parent_cdk for e in events}
    
    def get_children_for_parent(self, parent_cdk: str) -> List[str]:
        """Get all child CDKs for a given parent."""
        events = self._load_events()
        children = set()
        for e in events:
            if e.parent_cdk == parent_cdk:
                children.update(e.children_cdks)
        return list(children)

"""
Lineage Repository: Data access for lineage events (DB-based).
"""
from typing import List, Dict, Optional, Set
from app.repositories.base import BaseRepository
from app.schemas.lineage import LineageEvent, EventType

class LineageRepository(BaseRepository):
    """
    Repository for lineage event data (DB implementation).
    """
    
    async def get_all_events(self) -> List[LineageEvent]:
        """Get all lineage events from DB."""
        query = """
            SELECT parent_cdk, child_cdk, event_year, confidence_score
            FROM lineage_events
        """
        rows = await self.fetch_all(query)
        
        events = []
        for r in rows:
            events.append(LineageEvent(
                id=f"{r['parent_cdk']}_{r['event_year']}",
                parent_cdk=r['parent_cdk'],
                children_cdks=[r['child_cdk']],
                children_names=[],
                children_count=1,
                event_year=r['event_year'],
                event_type=EventType.SPLIT,
                confidence=float(r['confidence_score']),
            ))
        return events
    
    async def get_events_by_state(
        self, 
        state: str, 
        cdk_to_state: Dict[str, str]
    ) -> List[LineageEvent]:
        """Filter events where parent or child belongs to given state."""
        # For now, fetch all and filter in memory to utilize the passed cdk schema
        # Optimization: Could join with districts table in SQL if we drop cdk_to_state dependency
        events = await self.get_all_events()
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

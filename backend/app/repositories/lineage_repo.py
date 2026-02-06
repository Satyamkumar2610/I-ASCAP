"""
Lineage Repository: Data access for lineage events (DB-based).
"""
from typing import List, Dict
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
        cdk_to_state: Dict[str, str]  # kept for backward compat, not used
    ) -> List[LineageEvent]:
        """Filter events where parent belongs to given state using SQL JOIN."""
        # Optimized: Use SQL JOIN with districts table for O(1) state filtering
        query = """
            SELECT le.parent_cdk, le.child_cdk, le.event_year, le.confidence_score
            FROM lineage_events le
            JOIN districts d ON le.parent_cdk = d.cdk
            WHERE d.state_name = $1
        """
        rows = await self.fetch_all(query, state)
        
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
                confidence=float(r['confidence_score']) if r['confidence_score'] else 0.8,
            ))
        return events
    
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

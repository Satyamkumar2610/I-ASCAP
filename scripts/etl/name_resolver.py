import pandas as pd
import os
import logging
from typing import Dict, Optional, Tuple

class NameResolver:
    def __init__(self, name_changes_path: str):
        self.logger = logging.getLogger(__name__)
        self.changes_map = self._load_name_changes(name_changes_path)
        self.manual_fixes = {
            'bangalore': 'bengaluruurban',
            'bangalorerural': 'bengalururural',
            'belgaum': 'belagavi',
            'gulbarga': 'kalaburagi',
            'mysore': 'mysuru',
            'shimoga': 'shivamogga',
            'bellary': 'ballari',
            'bijapur': 'vijayapura',
            'chikmagalur': 'chikkamagaluru',
            'tumkur': 'tumakuru',
            'koriya': 'korea',
            'ladakh': 'lehladakh',
            'poonch': 'poonch', 
            'punch': 'poonch',
            'drbrambedkarkonaseema': 'konaseema',
            'ypsr': 'ysr',
            'faizabad': 'ayodhya',
            'allahabad': 'prayagraj'
        }
        
    def _normalize(self, name: str) -> str:
        if not isinstance(name, str): return ""
        n = name.lower().strip().replace(" district", "").replace("district", "")
        return n.replace(" ", "").replace("-", "").replace(".", "").replace("&", "and")

    def _load_name_changes(self, path: str) -> Dict[str, str]:
        """Load name changes into a lookup dictionary: {old_normalized: new_normalized}"""
        if not os.path.exists(path):
            self.logger.warning(f"Name changes file not found at {path}")
            return {}
            
        try:
            df = pd.read_excel(path, sheet_name='Data')
            # Expected cols: 'State/UT', 'Old Name', 'New Name'
            changes = {}
            for _, row in df.iterrows():
                old = self._normalize(row['Old Name'])
                new = self._normalize(row['New Name'])
                if old and new:
                    changes[old] = new
            self.logger.info(f"Loaded {len(changes)} name change rules.")
            return changes
        except Exception as e:
            self.logger.error(f"Error loading name changes: {e}")
            return {}

    def resolve(self, name: str) -> str:
        """Resolve a district name to its most current/canonical normalized form"""
        norm = self._normalize(name)
        
        # Check manual fixes first
        if norm in self.manual_fixes:
            norm = self.manual_fixes[norm]
            
        # Traverse the chain of name changes (e.g. A -> B -> C)
        # Prevent infinite loops with visited set
        visited = set()
        while norm in self.changes_map:
            if norm in visited: break
            visited.add(norm)
            norm = self.changes_map[norm]
            if norm in self.manual_fixes:
                 norm = self.manual_fixes[norm]
                 
        return norm

if __name__ == "__main__":
    # Test
    logging.basicConfig(level=logging.INFO)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(BASE_DIR, 'data', 'raw', 'district split', 'Name Changes_Districts_Indian States_1951-2021.xlsx')
    resolver = NameResolver(path)
    print(f"Orissa -> {resolver.resolve('Orissa')}") # State name check?
    print(f"Cuddapah -> {resolver.resolve('Cuddapah')}")

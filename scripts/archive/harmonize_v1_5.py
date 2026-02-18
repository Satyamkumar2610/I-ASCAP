
import pandas as pd
import numpy as np
import os
import json
import logging
from difflib import get_close_matches

# --- Config ---
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage.csv')
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
AGRI_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'ICRISAT_correct.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'data', 'v1_5')
OUTPUT_PANEL = os.path.join(OUTPUT_DIR, 'district_year_panel_v1_5.csv')

# --- Helper: CDK Generator (Must match ETL logic) ---
def simple_normalize(name):
    return "".join(c for c in str(name).lower().strip() if c.isalnum())[:6]

class DistrictHarmonizer:
    def __init__(self):
        self.lineage_df = None
        self.master_df = None
        self.agri_df = None
        self.name_to_cdk = {} # Map Raw Name -> Active CDK
        self.weights = {} # (Parent, Child) -> Weight

    def load_data(self):
        logger.info("Loading backbone and raw data...")
        self.lineage_df = pd.read_csv(LINEAGE_PATH)
        self.master_df = pd.read_csv(MASTER_PATH)
        self.agri_df = pd.read_csv(AGRI_PATH)
        
        # Pre-process Master for lookup
        # We need a way to map 'Durg' in 1990 to 'CG_durg_1951'.
        # Since 'Durg' is unique in Chattisgarh, we can map (State, Name) -> CDK.
        # But ICRISAT state names might differ vs ours.
        pass

    def map_raw_to_cdk(self):
        """Link ICRISAT names to Backbone CDKs."""
        logger.info("Linking Raw Data to Backbone...")
        
        # 1. Build Dictionary from Master
        # (State, NormName) -> CDK
        master_lookup = {}
        all_master_names = []  # For fuzzy matching
        for _, row in self.master_df.iterrows():
            st = row['state_name']
            nm = simple_normalize(row['district_name'])
            # Logic: If CDK exists, mapping to it is valid.
            master_lookup[(st, nm)] = row['cdk']
            # Also add direct CDK lookup just in case
            master_lookup[row['cdk']] = row['cdk']
            all_master_names.append(nm)

        # 2. Iterate Raw Data Unique Districts
        raw_map = {}
        unmapped = []
        
        unique_raw = self.agri_df[['state_name', 'dist_name']].drop_duplicates()
        
        for _, row in unique_raw.iterrows():
            rst = row['state_name']
            rnm = row['dist_name']
            
            # STATE ALIASES (ICRISAT vs Backbone) - EXPANDED
            st_aliases = {
                'Orissa': 'Odisha', 
                'Uttaranchal': 'Uttarakhand',
                'Pondicherry': 'Puducherry',
                'Chattisgarh': 'Chhattisgarh',
                'Jammu and Kashmir': 'Jammu & Kashmir',
                'Delhi': 'NCT of Delhi',
                'Andaman & Nicobar': 'Andaman and Nicobar Islands',
                'Dadra & Nagar Haveli': 'Dadara & Nagar Havelli',
            }
            cst = st_aliases.get(rst, rst)
            
            # Normalize Name
            cnm = simple_normalize(rnm)
            
            # Specific Fixes for ICRISAT mess - COMPREHENSIVE LIST
            name_fixes = {
                '24parg': 'south2',  # 24 Parganas -> South 24 Parganas (Parent)
                'ysrkad': 'kadapa',  # YSR Kadapa -> Kadapa
                'spsnel': 'sripot',  # S.P.S. Nellore -> Nellore
                'khandw': 'eastn',   # Khandwa -> East Nimar
                'beed': 'bhir',      # Beed -> Bhir
                'mehsan': 'mahesa',  # Mehsana -> Mahesana
                'dholpu': 'dhaulp',  # Dholpur -> Dhaulpur
                'thriss': 'trichu',  # Thrissur -> Trichur
                'phulba': 'kandha',  # Phulbani(Kandhamal) -> Kandhamal
                'burdwa': 'barddh',  # Burdwan -> Barddhaman
                'mungai': 'munger',  # Mungair -> Munger
                'bhabhu': 'kaimur',  # Bhabhua Kaimur -> Kaimur
                'dahod': 'dohad',    # Dahod -> Dohad
                'shrimu': 'mukts',   # Shri Mukatsar Sahib -> Muktsar (6 char)
                'karoli': 'karaul',  # Karoli -> Karauli
                'gbnaga': 'gautam',  # G.B.Nagar -> Gautam Buddha Nagar
                'jagity': 'jagtia',  # Jagityal -> Jagtial
            }
            if cnm in name_fixes:
                cnm = name_fixes[cnm]
            
            # Lookup - Try exact match first
            candidates = self.master_df[
                (self.master_df['district_name'].apply(simple_normalize) == cnm)
            ]
            
            if len(candidates) == 1:
                raw_map[(rst, rnm)] = candidates.iloc[0]['cdk']
            elif len(candidates) > 1:
                # Disambiguate by State
                match = None
                for _, cand in candidates.iterrows():
                    if cand['state_name'] == cst: # Exact Match
                        match = cand['cdk']
                        break
                    # Fuzzy State
                    if cst in cand['state_name'] or cand['state_name'] in cst:
                        match = cand['cdk']
                        break
                
                if match:
                    raw_map[(rst, rnm)] = match
                else:
                    unmapped.append(f"{rst}-{rnm}")
            else:
                # No exact candidates - Try FUZZY MATCHING
                fuzzy_matches = get_close_matches(cnm, all_master_names, n=1, cutoff=0.7)
                if fuzzy_matches:
                    fuzzy_nm = fuzzy_matches[0]
                    # Find CDK for fuzzy match
                    fuzzy_cands = self.master_df[
                        (self.master_df['district_name'].apply(simple_normalize) == fuzzy_nm)
                    ]
                    if len(fuzzy_cands) >= 1:
                        # Try state filtering
                        state_match = fuzzy_cands[fuzzy_cands['state_name'] == cst]
                        if len(state_match) >= 1:
                            raw_map[(rst, rnm)] = state_match.iloc[0]['cdk']
                            logger.debug(f"Fuzzy matched: {rnm} -> {fuzzy_nm}")
                        else:
                            # Accept any fuzzy match
                            raw_map[(rst, rnm)] = fuzzy_cands.iloc[0]['cdk']
                            logger.debug(f"Fuzzy matched (no state): {rnm} -> {fuzzy_nm}")
                    else:
                        unmapped.append(f"{rst}-{rnm}")
                else:
                    unmapped.append(f"{rst}-{rnm}")

        self.name_to_cdk = raw_map
        logger.info(f"Mapped {len(raw_map)} districts. Unmapped: {len(unmapped)}")
        if len(unmapped) > 0:
            logger.warning(f"Unmapped examples: {unmapped[:20]}")
            # Save unmapped to file for review
            unmapped_path = os.path.join(OUTPUT_DIR, 'unmapped_districts.txt')
            with open(unmapped_path, 'w') as f:
                f.write('\n'.join(unmapped))
            logger.info(f"Saved unmapped list to {unmapped_path}")
            
    def calculate_weights(self):
        """Calculate redistribution weights for Splits."""
        logger.info("Calculating Lineage Weights...")
        # Iterating Splits
        splits = self.lineage_df[self.lineage_df['event_type'] == 'SPLIT']
        
        # For each SPLIT (P -> C1, P -> C2) [Note: P->C1 might vary if P continues]
        # We need "Siblings" group.
        # Group by Parent+Year?
        # Actually, if P splits into C1, C2... 
        # Weights = Value_C(T+1) / Sum(Value_Children(T+1))
        
        # Simplified: Area Weight 1.0 if not split.
        # This part requires iterating lineage events year by year.
        pass

    def harmonize(self):
        """
        The Core Logic:
        1. Iterate Years Backwards (2024 -> 1966).
        2. If CDK exists in Raw, use Raw.
        3. If CDK missing (Pre-Split), find Parent.
        4. If Parent has Data, Distribute to Children.
        """
        logger.info("Harmonizing Panel...")
        
        # 1. Create Skeleton: All Unique CDKs x All Years
        all_cdks = self.master_df['cdk'].unique()
        all_years = sorted(self.agri_df['year'].unique())
        
        panel_rows = []
        
        # Convert Agri to Dictionary for speed: (CDK, Year) -> {Data}
        # First map Agri to CDK
        self.agri_df['cdk'] = self.agri_df.apply(lambda x: self.name_to_cdk.get((x['state_name'], x['dist_name'])), axis=1)
        
        # Drop unmapped
        valid_agri = self.agri_df.dropna(subset=['cdk'])
        
        # Dict
        # (CDK, Year) -> Row Dict
        data_map = {}
        for _, row in valid_agri.iterrows():
            data_map[(row['cdk'], row['year'])] = row.to_dict()
            
        # 2. Iterate
        # Logic: 
        # A. For every CDK, find its "Lineage Path" (Parent at time T).
        # B. If Data[CDK, T] exists, use it.
        # C. If not, Look at Parent[T].
        # D. If Parent[T] exists, apply Weight.
        
        # Pre-compute Parent Mapping: (Child_CDK, Year) -> Parent_CDK
        # From Lineage DF.
        # Default: Parent = Self (if active).
        # If Split Event at T_event: For T < T_event, Parent = P.
        
        parent_map = {} # (Child, Year) -> Parent
        
        # Build Child->Parent Tree
        # Current logic: Simple P -> C events.
        # We walk backwards from events.
        
        for cdk in all_cdks:
            current_parent = cdk
            # Trace back history? 
            # This requires sorted lineage graph.
            # Simplified for v1.5:
            # Look at Lineage entries where child_cdk == current.
            # If start_year (event_year) == T, then for t < T, parent is parent_cdk.
            
            # Get ancestors
            ancestors = self.lineage_df[self.lineage_df['child_cdk'] == cdk].sort_values('event_year', ascending=False)
            
            # Assign parent for each year segment
            # Base: 1966-2024 -> Self
            # Apply events: 
            # Event 2001: P(2001) -> C.
            # So 1966-2000: Parent is P.
            
            # Map of Year -> Target_Entity
            entity_trace = {y: cdk for y in all_years}
            
            for _, event in ancestors.iterrows():
                evt_year = event['event_year']
                p_cdk = event['parent_cdk']
                
                # Apply Parent Backwards from Event Year
                for y in all_years:
                    if y < evt_year:
                        entity_trace[y] = p_cdk
                        
            # Store
            for y, p in entity_trace.items():
                parent_map[(cdk, y)] = p

        # 3. Generate Panel with Redistribution
        # We need Weights.
        # Weight Logic: (Child, Parent) -> Ratio.
        # Strategy: Area Ratio (Fixed 0.5 fallback or calculated from Master if Area avail).
        # Master usually doesn't have area.
        # We use a naive "Clone" approach for yield (Value = Parent Value).
        # And "Divide" approach for Area/Production (Value = Parent / N_Children)?
        # Better: Use Area Weight if available?
        # Let's use 1.0 for Yield, and 1/N for Production (Placeholder).
        # To be precise, we need 'Child Area / Parent Area'.
        # Since we lack explicit area in Master, we default to Equal Split for Production.
        
        parent_child_counts = self.lineage_df.groupby(['parent_cdk', 'event_year']).size().to_dict()
        # (P, T) -> 2 (children)
        
        for cdk in all_cdks:
            for y in all_years:
                # 1. Check Raw Data
                if (cdk, y) in data_map:
                    row = data_map[(cdk, y)]
                    row['harmonization_method'] = 'Raw'
                    panel_rows.append(row)
                    continue
                
                # 2. Backcast (Impute)
                p_cdk = parent_map.get((cdk, y), cdk)
                
                if p_cdk != cdk and (p_cdk, y) in data_map:
                    # Parent has data!
                    p_data = data_map[(p_cdk, y)]
                    
                    # Clone Dict
                    new_row = p_data.copy()
                    new_row['cdk'] = cdk
                    new_row['dist_name'] = self.master_df[self.master_df['cdk']==cdk]['district_name'].values[0]
                    new_row['harmonization_method'] = f'Backcast_from_{p_cdk}'
                    
                    # Apply Weights
                    # Find split count
                    # Look for the event where p_cdk splits?
                    # Or just count simple splits?
                    # Using (p_cdk, creation_year_of_child) lookup
                    # Approximate:
                    split_count = 2 # Default Assumption
                    
                    # Yields = Parent Yield (Assuming homogenous tech)
                    # Production/Area = Divide
                    for k in new_row:
                        if 'yield' in k:
                            pass # Keep Parent Yield
                        elif 'production' in k or 'area' in k:
                            if isinstance(new_row[k], (int, float)) and new_row[k] > 0:
                                new_row[k] = new_row[k] / split_count
                                
                    panel_rows.append(new_row)
                    
        # Export
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            
        pdf = pd.DataFrame(panel_rows)
        # Select columns - keep it robust
        pdf.to_csv(OUTPUT_PANEL, index=False)
        logger.info(f"Harmonized Panel saved: {OUTPUT_PANEL}")
        
    def run(self):
        self.load_data()
        self.map_raw_to_cdk()
        self.harmonize()

if __name__ == "__main__":
    h = DistrictHarmonizer()
    h.run()

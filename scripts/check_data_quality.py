
import pandas as pd
import networkx as nx
import sys
import os

# Set paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage.csv')

def check_quality():
    print("Loading data...")
    if not os.path.exists(MASTER_PATH):
        print(f"ERROR: {MASTER_PATH} not found.")
        return
    if not os.path.exists(LINEAGE_PATH):
        print(f"ERROR: {LINEAGE_PATH} not found.")
        return

    master = pd.read_csv(MASTER_PATH)
    lineage = pd.read_csv(LINEAGE_PATH)

    print(f"Loaded {len(master)} districts and {len(lineage)} lineage events.")

    # 1. Check Identifiers
    print("\n--- identifier checks ---")
    valid_cdks = set(master['cdk'].unique())
    
    parent_cdks = set(lineage['parent_cdk'].unique())
    child_cdks = set(lineage['child_cdk'].unique())

    # Check for missing parents
    missing_parents = [p for p in parent_cdks if p not in valid_cdks]
    if missing_parents:
        print(f"FAIL: {len(missing_parents)} parent CDKs in lineage are NOT in master districts.")
        print(f"Examples: {missing_parents[:5]}")
    else:
        print("PASS: All parent CDKs exist in master.")

    # Check for missing children
    missing_children = [c for c in child_cdks if c not in valid_cdks]
    if missing_children:
        print(f"FAIL: {len(missing_children)} child CDKs in lineage are NOT in master districts.")
        print(f"Examples: {missing_children[:5]}")
    else:
        print("PASS: All child CDKs exist in master.")

    # 2. Relationship Checks
    print("\n--- Relationship Checks ---")
    # Self loops
    self_loops = lineage[lineage['parent_cdk'] == lineage['child_cdk']]
    if not self_loops.empty:
        print(f"FAIL: {len(self_loops)} districts split into themselves.")
        print(self_loops[['parent_cdk', 'event_year']])
    else:
        print("PASS: No self-loops found.")

    # Cycles
    G = nx.DiGraph()
    for _, row in lineage.iterrows():
        G.add_edge(row['parent_cdk'], row['child_cdk'])

    try:
        cycles = list(nx.simple_cycles(G))
        if cycles:
            print(f"FAIL: Found {len(cycles)} cycles in lineage graph.")
            for cycle in cycles[:3]:
                print(f"Cycle: {cycle}")
        else:
            print("PASS: No cycles found in lineage graph.")
    except Exception as e:
        print(f"Error checking cycles: {e}")

    # 3. Temporal Consistency
    print("\n--- Temporal Consistency ---")
    # Join start/end years to lineage
    master_dates = master[['cdk', 'start_year', 'end_year']].set_index('cdk')
    
    lineage_dates = lineage.join(master_dates, on='parent_cdk', rsuffix='_parent')
    lineage_dates = lineage_dates.join(master_dates, on='child_cdk', rsuffix='_child')
    
    # Rename for clarity
    lineage_dates = lineage_dates.rename(columns={
        'start_year': 'parent_start', 'end_year': 'parent_end',
        'start_year_child': 'child_start', 'end_year_child': 'child_end'
    })

    # Check: Child start year should be approx Event Year (+/- 1)
    # Allows for some data entry variance
    inconsistent_starts = lineage_dates[
        (lineage_dates['child_start'] < lineage_dates['event_year'] - 2) | 
        (lineage_dates['child_start'] > lineage_dates['event_year'] + 2)
    ]
    
    if not inconsistent_starts.empty:
        print(f"WARN: {len(inconsistent_starts)} children start >2 years away from split event.")
        # print(inconsistent_starts[['parent_cdk', 'child_cdk', 'event_year', 'child_start']].head())
    else:
        print("PASS: Child start years align with event years.")

    # Check: Parent end year should be approx Event Year (if parent ceases to exist)
    # Note: Parent might NOT cease to exist (e.g. carving out). 
    # But usually parent metrics stop being recorded under old CDK if checking distinct periods.
    # However, in this dataset, maybe parent continues? 
    # Let's check for "Impossible" dates: Parent Start > Event Year
    impossible_parents = lineage_dates[lineage_dates['parent_start'] > lineage_dates['event_year']]
    if not impossible_parents.empty:
        print(f"FAIL: {len(impossible_parents)} parents start AFTER the split event.")
        print(impossible_parents[['parent_cdk', 'event_year', 'parent_start']].head())
    else:
        print("PASS: Parents start before split event.")

    # 4. Data Completeness
    print("\n--- Data Completeness ---")
    # Check if we have duplicates
    dupes = lineage[lineage.duplicated(subset=['parent_cdk', 'child_cdk'], keep=False)]
    if not dupes.empty:
        print(f"WARN: {len(dupes)} duplicate parent-child entries found.")
        print(dupes.head())
    else:
        print("PASS: No duplicate lineage entries.")

if __name__ == "__main__":
    check_quality()

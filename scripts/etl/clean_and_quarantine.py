
import pandas as pd
import os
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTER_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_master.csv')
LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage.csv')

# Output Paths
CLEANED_LINEAGE_PATH = os.path.join(BASE_DIR, 'data', 'v1', 'district_lineage_cleaned.csv')
QUARANTINE_DIR = os.path.join(BASE_DIR, 'data', 'quarantine')

def clean_data():
    os.makedirs(QUARANTINE_DIR, exist_ok=True)
    
    if not os.path.exists(MASTER_PATH) or not os.path.exists(LINEAGE_PATH):
        logger.error("Input files not found!")
        return

    logger.info("Loading data...")
    master = pd.read_csv(MASTER_PATH)
    lineage = pd.read_csv(LINEAGE_PATH)
    
    initial_count = len(lineage)
    logger.info(f"Initial Lineage Count: {initial_count}")

    # 1. Deduplication
    lineage = lineage.drop_duplicates()
    dedup_count = len(lineage)
    logger.info(f"Dropped {initial_count - dedup_count} duplicates.")

    # 2. Self-Loop Removal
    self_loops = lineage[lineage['parent_cdk'] == lineage['child_cdk']]
    if not self_loops.empty:
        filename = os.path.join(QUARANTINE_DIR, 'lineage_self_loops.csv')
        self_loops.to_csv(filename, index=False)
        logger.info(f"Quarantined {len(self_loops)} self-loops to {filename}.")
        
        lineage = lineage[lineage['parent_cdk'] != lineage['child_cdk']]

    # 3. Orphan check
    valid_cdks = set(master['cdk'].unique())
    
    # Check parents
    invalid_parents = lineage[~lineage['parent_cdk'].isin(valid_cdks)]
    # Check children
    invalid_children = lineage[~lineage['child_cdk'].isin(valid_cdks)]
    
    invalid_rows = pd.concat([invalid_parents, invalid_children]).drop_duplicates()
    
    if not invalid_rows.empty:
        filename = os.path.join(QUARANTINE_DIR, 'lineage_orphans.csv')
        invalid_rows.to_csv(filename, index=False)
        logger.info(f"Quarantined {len(invalid_rows)} rows with missing keys to {filename}.")
        
        # Filter keep only valid

        lineage = lineage[lineage['parent_cdk'].isin(valid_cdks) & lineage['child_cdk'].isin(valid_cdks)]

    # 4. Cycle Detection (Complex Cycles)
    import networkx as nx
    G = nx.DiGraph()
    # Build graph from current valid lineage
    for idx, row in lineage.iterrows():
        G.add_edge(row['parent_cdk'], row['child_cdk'], idx=idx)
    
    try:
        cycles = list(nx.simple_cycles(G))
        if cycles:
            logger.info(f"Found {len(cycles)} complex cycles. Removing involved edges...")
            cycle_indices = set()
            for cycle in cycles:
                # Naive approach: remove the edge that closes the cycle (last to first)
                # or remove all edges in cycle. 
                # Let's remove the edge from the last node back to the first node in the cycle list
                # verifying it exists in our dataset
                u, v = cycle[-1], cycle[0]
                if G.has_edge(u, v):
                    edge_idx = G[u][v]['idx']
                    cycle_indices.add(edge_idx)
            
            if cycle_indices:
                cycle_rows = lineage.loc[list(cycle_indices)]
                filename = os.path.join(QUARANTINE_DIR, 'lineage_cycles.csv')
                cycle_rows.to_csv(filename, index=False)
                logger.info(f"Quarantined {len(cycle_rows)} cycle-causing edges to {filename}.")
                
                lineage = lineage.drop(index=list(cycle_indices))
    except ImportError:
        logger.warning("NetworkX not installed, skipping advanced cycle detection.")

    final_count = len(lineage)
    logger.info(f"Final Cleaned Lineage Count: {final_count} (Removed {initial_count - final_count} rows)")
    
    lineage.to_csv(CLEANED_LINEAGE_PATH, index=False)
    logger.info(f"Saved cleaned lineage to {CLEANED_LINEAGE_PATH}")

if __name__ == "__main__":
    clean_data()

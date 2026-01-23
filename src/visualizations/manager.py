import os
import pandas as pd
from ..config import PROCESSED_DF_PATH, VIZ_INTERACTIVE_DIR, VIZ_STATIC_DIR
from .network import generate_network_graph
from .timeline import generate_timeline_graph
from .static import generate_static_graph

def run_visualizations():
    """
    Main entry point to generate ALL visualizations for ALL states.
    Reads processed data and calls individual generators.
    """
    print(f"Loading data from {PROCESSED_DF_PATH}...")
    if not os.path.exists(PROCESSED_DF_PATH):
        print("Data file not found. Run ETL first.")
        return False
        
    try:
        df = pd.read_csv(PROCESSED_DF_PATH)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return False

    states = sorted(df['filter_state'].unique())
    print(f"Found {len(states)} states. Starting visualization generation...")

    results = {"network": 0, "timeline": 0, "static": 0}

    for state in states:
        safe_name = state.replace(' ', '_')
        print(f"Processing {state}...")
        
        # 1. Network Graph (Interactive)
        net_path = os.path.join(VIZ_INTERACTIVE_DIR, f"{safe_name}_interactive.html")
        if generate_network_graph(state, df, net_path):
            results["network"] += 1

        # 2. Timeline Graph (Interactive)
        time_path = os.path.join(VIZ_INTERACTIVE_DIR, f"{safe_name}_Timeline.html")
        if generate_timeline_graph(state, df, time_path):
            results["timeline"] += 1

        # 3. Static Graph (PNG)
        static_path = os.path.join(VIZ_STATIC_DIR, f"{safe_name}_lineage.png")
        if generate_static_graph(state, df, static_path):
            results["static"] += 1
            
    print("\nVisualization Summary:")
    print(f"  Interactive Networks: {results['network']}")
    print(f"  Interactive Timelines: {results['timeline']}")
    print(f"  Static Graphs: {results['static']}")
    
    return True

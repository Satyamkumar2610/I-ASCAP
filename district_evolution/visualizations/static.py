import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import os

def generate_static_graph(state_name, df, output_path):
    """
    Generates a static PNG lineage tree for a specific state.
    """
    state_df = df[df['filter_state'] == state_name].copy()
    if state_df.empty:
        return False

    G = nx.DiGraph()
    for _, row in state_df.iterrows():
        src = row['source_district']
        dst = row['dest_district']
        year = str(row['dest_year']) if pd.notna(row['dest_year']) else ""
        G.add_edge(src, dst, label=year)

    if len(G.nodes) == 0:
        return False

    plt.figure(figsize=(12, 8))
    pos = nx.spring_layout(G, seed=42, k=0.5)
    
    nx.draw(
        G, pos, 
        with_labels=True, 
        node_color='lightblue', 
        node_size=2000, 
        font_size=8, 
        font_weight='bold', 
        arrows=True, 
        arrowsize=20
    )
    
    edge_labels = nx.get_edge_attributes(G, 'label')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
    
    plt.title(f"District Lineage - {state_name}")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path)
    plt.close()
    return True

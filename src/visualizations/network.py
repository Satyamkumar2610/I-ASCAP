import pandas as pd
from pyvis.network import Network
import os
from ..config import COLORS

def generate_network_graph(state_name, df, output_path):
    """
    Generates an interactive Hierarchical Network graph for a specific state.
    """
    state_df = df[df['filter_state'] == state_name].copy()
    if state_df.empty:
        return False

    net = Network(height='600px', width='100%', bgcolor=COLORS['bg'], font_color=COLORS['text'], directed=True)
    
    # Hierarchical Layout Options
    options = """
    var options = {
      "nodes": {
        "borderWidth": 2,
        "shadow": true,
        "font": { "size": 16, "face": "Inter, sans-serif" }
      },
      "edges": {
        "color": { "color": "#bdc3c7", "highlight": "#2c3e50" },
        "smooth": { "type": "cubicBezier", "forceDirection": "vertical", "roundness": 0.4 },
        "arrows": { "to": { "enabled": true, "scaleFactor": 1 } }
      },
      "layout": {
        "hierarchical": {
          "enabled": true,
          "levelSeparation": 150,
          "nodeSpacing": 200,
          "treeSpacing": 200,
          "blockShifting": true,
          "edgeMinimization": true,
          "parentCentralization": true,
          "direction": "UD",        
          "sortMethod": "directed"  
        }
      },
      "interaction": {
        "navigationButtons": true,
        "zoomView": true,
        "dragView": true
      },
      "physics": {
        "hierarchicalRepulsion": {
          "nodeDistance": 120
        },
        "solver": "hierarchicalRepulsion"
      }
    }
    """
    net.set_options(options)
    
    district_info = {}
    
    # Pre-process nodes
    for _, row in state_df.iterrows():
        src = row['source_district']
        dst = row['dest_district']
        year = str(row['dest_year']) if pd.notna(row['dest_year']) else "Unknown"
        
        if dst not in district_info:
            district_info[dst] = {'year': year, 'parent': src, 'type': 'new'}
        
        if src not in district_info:
            district_info[src] = {'year': 'Original', 'parent': '-', 'type': 'origin'}

    # Add Nodes
    for district, info in district_info.items():
        is_origin = info['type'] == 'origin'
        
        title_html = (
            f"<div style='background: white; padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-family: sans-serif;'>"
            f"<b style='font-size: 14px; color: #333;'>{district}</b><br><hr style='margin: 4px 0; border-top: 1px solid #eee;'>"
            f"<b>Formed:</b> {info['year']}<br>"
            f"<b>Parent:</b> {info['parent']}"
            f"</div>"
        )
        
        color = COLORS['node_origin'] if is_origin else COLORS['node_new']
        size = 25 if is_origin else 20
        
        net.add_node(
            district, 
            label=district, 
            title=title_html, 
            color=color,
            size=size
        )

    # Add Edges
    for _, row in state_df.iterrows():
        src = row['source_district']
        dst = row['dest_district']
        yr = str(int(row['dest_year'])) if pd.notna(row['dest_year']) else ""
        net.add_edge(src, dst, label=yr)

    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    try:
        net.write_html(output_path)
        return True
    except Exception as e:
        print(f"Failed to write network graph for {state_name}: {e}")
        return False

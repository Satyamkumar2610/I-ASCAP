import pandas as pd
import networkx as nx
import plotly.graph_objects as go
import os

def generate_timeline_graph(state_name, df, output_path):
    """
    Generates a Plotly Interactive Timeline for a specific state.
    """
    state_df = df[df['filter_state'] == state_name].copy()
    if state_df.empty:
        return False

    G = nx.DiGraph()
    district_years = {}
    
    def parse_year(val):
        try:
            return int(float(str(val)))
        except:
            return None

    for _, row in state_df.iterrows():
        src = row['source_district']
        dst = row['dest_district']
        year_val = parse_year(row['dest_year'])
        
        G.add_edge(src, dst)
        if year_val:
            district_years[dst] = year_val
            
    # Estimate base years for roots
    year_values = [y for y in district_years.values() if y is not None]
    base_year = min(year_values) - 5 if year_values else 1950
    
    for node in G.nodes():
        if node not in district_years:
            district_years[node] = base_year

    if len(G.nodes) == 0:
        return False

    # Layout: X=Year, Y=Spread
    pos = {}
    nodes_by_year = {}
    for node, year in district_years.items():
        if year not in nodes_by_year:
            nodes_by_year[year] = []
        nodes_by_year[year].append(node)
        
    for year in sorted(nodes_by_year.keys()):
        nodes = sorted(nodes_by_year[year])
        count = len(nodes)
        ys = [i - (count - 1) / 2 for i in range(count)] if count > 1 else [0]
        for node, y in zip(nodes, ys):
            pos[node] = (year, y)

    # Plot Construction
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    edge_trace = go.Scatter(
        x=edge_x, y=edge_y,
        line=dict(width=1, color='#888'),
        hoverinfo='none',
        mode='lines'
    )

    node_x = []
    node_y = []
    node_text = []
    node_color = []
    
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        
        year = district_years.get(node, "Unknown")
        parents = list(G.predecessors(node))
        info = f"<b>{node}</b><br>Formed: {year}<br>Parent: {', '.join(parents) if parents else 'Original'}"
        
        node_text.append(info)
        node_color.append(year if isinstance(year, int) else base_year)

    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers',
        hoverinfo='text',
        marker=dict(
            showscale=True,
            colorscale='Viridis',
            color=node_color,
            size=25,
            colorbar=dict(thickness=15, title='Year', xanchor='left'),
            line_width=1, 
            line_color='white'
        ),
        text=node_text
    )

    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=go.Layout(
            title=f'District Evolution Timeline - {state_name}',
            showlegend=False,
            hovermode='closest',
            plot_bgcolor='white',
            margin=dict(b=40,l=40,r=40,t=60),
            xaxis=dict(showgrid=True, gridcolor='#eee', title="Year"),
            yaxis=dict(showgrid=False, showticklabels=False, visible=False)
        )
    )
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig.write_html(output_path)
    return True

import streamlit as st
import pandas as pd
import networkx as nx
import plotly.express as px
from streamlit_agraph import agraph, Node, Edge, Config
import os
import io

# Page Config
st.set_page_config(
    page_title="District Evolution Research",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Utils
def load_data():
    path = "data/processed/district_changes.csv"
    if not os.path.exists(path):
        st.error("Data not found. Run pipeline first.")
        return pd.DataFrame()
    return pd.read_csv(path)

def generate_citation():
    return """@misc{district_evolution_2026,
  title={District Evolution of India (1951-2024)},
  author={Satyam Kumar et al.},
  year={2026},
  publisher={GitHub},
  note={Data Version 2.0}
}"""

# --- MAIN APP ---

st.title("🏛️ District Evolution: Context over Content")
st.markdown("*A Research-Grade Analysis of Administrative Boundary Changes in India (1951-2024)*")

df = load_data()

# Sidebar
with st.sidebar:
    st.header("Filters")
    if not df.empty:
        states = sorted(df['filter_state'].unique())
        selected_state = st.selectbox("Select State", states)
        
        state_df = df[df['filter_state'] == selected_state]
        districts = sorted(set(state_df['source_district'].unique()) | set(state_df['dest_district'].unique()))
        selected_district = st.selectbox("Focus District (Optional)", ["All"] + list(districts))
    else:
        selected_state = None
    
    st.divider()
    st.info("Research Mode Enabled")
    st.download_button("Download Citation (BibTeX)", generate_citation(), "citation.bib")

if selected_state:
    # KPI Row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Changes", len(state_df))
    with col2:
        st.metric("Active Districts", len(districts))
    with col3:
        st.metric("Timeline", "1951-2024")
    with col4:
        st.metric("Data Quality", "High (Research)")

    tab1, tab2, tab3 = st.tabs(["🌳 Lineage Tree", "🗺️ Time-Machine Map", "📄 Methodology"])

    # TAB 1: LINEAGE (PyVis style / AGraph)
    with tab1:
        st.subheader(f"Administrative Lineage: {selected_state}")
        
        # Build Graph
        nodes = []
        edges = []
        node_ids = set()
        
        for _, row in state_df.iterrows():
            src = row['source_district']
            dst = row['dest_district']
            year = str(row['dest_year'])
            
            if src not in node_ids:
                nodes.append(Node(id=src, label=src, size=20, color="#2563eb")) # Blue
                node_ids.add(src)
            if dst not in node_ids:
                nodes.append(Node(id=dst, label=dst, size=20, color="#10b981")) # Green
                node_ids.add(dst)
                
            edges.append(Edge(source=src, target=dst, label=year))

        config = Config(
            width=900, 
            height=600, 
            directed=True, 
            physics=True, 
            hierarchical=True
        )
        
        return_value = agraph(nodes=nodes, edges=edges, config=config)

    # TAB 2: MAP (Placeholder for Phase 2)
    with tab2:
        st.subheader("Time-Machine Map (Beta)")
        year_slider = st.slider("Select Year", 1951, 2024, 2024)
        
        st.warning(f"⚠️ GeoJSON data for {selected_state} in {year_slider} is strictly preliminary.")
        
        # Placeholder Map (Density map of points just to show something)
        # In real implementation: px.choropleth_mapbox using actual GeoJSON
        st.map(pd.DataFrame({'lat': [20.5937], 'lon': [78.9629]})) # Center of India

    # TAB 3: DATA Log
    with tab3:
        st.subheader("Methodology & Data Log")
        st.markdown(f"""
        **Methodology:**
        - **Bifurcation**: A clean split of one district into two.
        - **Trifurcation**: One district split into three.
        - **Renaming**: Change of name without boundary change.
        
        **Data Source:** Census of India Notifications.
        """)
        
        st.dataframe(
            state_df[['source_district', 'dest_district', 'dest_year', 'split_type', 'notification_date', 'census_code_2011']],
            use_container_width=True
        )

else:
    st.info("Please select a state to begin analysis.")

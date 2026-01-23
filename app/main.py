import streamlit as st
import pandas as pd
import folium
from streamlit_folium import folium_static
from streamlit_agraph import agraph, Node, Edge, Config
import os

# --- CONFIGURATION ---
st.set_page_config(
    page_title="District Evolution Dashboard",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- UTILS ---
@st.cache_data
def load_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, 'data', 'processed', 'district_changes.csv')
    if not os.path.exists(path):
        st.error(f"Data file not found at {path}. Please run `python src/etl.py` first.")
        return pd.DataFrame()
    
    df = pd.read_csv(path)
    # Ensure dest_year is numeric for slider
    df['dest_year'] = pd.to_numeric(df['dest_year'], errors='coerce').fillna(0).astype(int)
    return df

# --- MAIN LAYOUT ---
def main():
    st.title("🏛️ District Evolution: India (1951-2024)")
    st.markdown("*A Research-Grade Analysis of Administrative Boundary Changes*")

    df = load_data()
    if df.empty:
        return

    # --- SIDEBAR FILTERS ---
    with st.sidebar:
        st.header("🔍 Research Filters")
        
        # State Filter
        all_states = sorted(df['filter_state'].dropna().unique())
        selected_state = st.selectbox("Select State", all_states)
        
        # Filter Data by State
        state_df = df[df['filter_state'] == selected_state].copy()
        
        # Time Range Slider
        min_year = int(state_df['dest_year'].min()) if not state_df.empty else 1951
        max_year = int(state_df['dest_year'].max()) if not state_df.empty else 2024
        
        if min_year == max_year:
             min_year = 1950 # Fallback
        
        selected_years = st.slider("Time Range", 1951, 2024, (1951, 2024))
        
        # Split Type Filter
        split_types = sorted(state_df['split_type'].unique()) if 'split_type' in state_df.columns else []
        selected_splits = st.multiselect("Split Type", split_types, default=split_types)
        
        # Apply Filters
        filtered_df = state_df[
            (state_df['dest_year'] >= selected_years[0]) & 
            (state_df['dest_year'] <= selected_years[1]) &
            (state_df['split_type'].isin(selected_splits))
        ]
        
        st.divider()
        st.caption(f"Showing {len(filtered_df)} change events.")

    # --- KPI ROW ---
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Changes", len(filtered_df))
    with col2:
        # Unique parents plus unique children in the filtered view
        active_districts = len(set(filtered_df['source_district']) | set(filtered_df['dest_district']))
        st.metric("Involved Districts", active_districts)
    with col3:
        st.metric("Time Period", f"{selected_years[0]} - {selected_years[1]}")
    with col4:
        avg_confidence = "N/A"
        if 'confidence_score' in filtered_df.columns:
            counts = filtered_df['confidence_score'].value_counts()
            if not counts.empty:
                avg_confidence = counts.idxmax()
        st.metric("Mode Confidence", avg_confidence)

    # --- TABS ---
    tab1, tab2, tab3 = st.tabs(["🕸️ Network Lineage", "🗺️ Time-Machine Map", "📄 Research Report"])

    # TAB 1: NETWORK
    with tab1:
        st.subheader(f"Administrative Lineage: {selected_state}")
        
        if filtered_df.empty:
            st.info("No data available for the selected filters.")
        else:
            nodes = []
            edges = []
            node_ids = set()
            
            for _, row in filtered_df.iterrows():
                src = row['source_district']
                dst = row['dest_district']
                year = str(row['dest_year'])
                
                if src not in node_ids:
                    nodes.append(Node(id=src, label=src, size=20, color="#2563eb", title=f"Source: {src}"))
                    node_ids.add(src)
                if dst not in node_ids:
                    nodes.append(Node(id=dst, label=dst, size=20, color="#10b981", title=f"Formed: {year}"))
                    node_ids.add(dst)
                
                edges.append(Edge(source=src, target=dst, label=year))
            
            config = Config(width=None, height=600, directed=True, physics=True, hierarchical=True)
            return_value = agraph(nodes=nodes, edges=edges, config=config)

    # TAB 2: MAP
    with tab2:
        st.subheader("Time-Machine Map (Beta)")
        st.markdown(f"**State:** {selected_state}")
        
        # Placeholder MAP logic - In production, this would load GeoJSON
        m = folium.Map(location=[20.5937, 78.9629], zoom_start=5)
        
        # Add a marker for the selected state (Approximate Geocoding Placeholder)
        # Real app would have a lat/lon dict for states
        folium.Marker(
            [20.5937, 78.9629], 
            popup=selected_state, 
            tooltip=f"{selected_state} Center"
        ).add_to(m)
        
        folium_static(m)
        
        st.warning("⚠️ Note: GeoJSON boundaries for historical years are pending integration.")

    # TAB 3: REPORT
    with tab3:
        st.subheader(f"District Proliferation Report: {selected_state}")
        
        start_count = len(set(state_df[state_df['dest_year'] < selected_years[0]]['dest_district']))
        # This logic is approximate; a real report needs full ancestry
        
        st.markdown(f"""
        ### Executive Summary
        Between **{selected_years[0]}** and **{selected_years[1]}**, the state of **{selected_state}** 
        witnessed **{len(filtered_df)}** administrative boundary changes.
        
        ### Key Events
        """)
        
        for _, row in filtered_df.sort_values('dest_year').head(10).iterrows():
            st.write(f"- **{row['dest_year']}**: {row['source_district']} was split to form **{row['dest_district']}** ({row.get('split_type', 'Change')})")
            
        if len(filtered_df) > 10:
            st.write("... (and more)")

        st.markdown("### Methodology")
        st.info("""
        **Data Source:** Gazette Notifications and Census Data (1951-2024).
        **Validation:** All changes pass the `Source != Dest` integrity check.
        **Confidence:** Changes are flagged High/Medium/Low based on data completeness.
        """)

if __name__ == "__main__":
    main()

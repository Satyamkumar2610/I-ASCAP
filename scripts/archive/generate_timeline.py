
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_PATH = os.path.join(BASE_DIR, 'data', 'raw', 'district_proliferation_1951_2024.xlsx')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output', 'visualizations')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'national_timeline.html')

def generate_timeline():
    # Ensure output directory exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Load Data
    print(f"Loading data from {RAW_DATA_PATH}...")
    try:
        df = pd.read_excel(RAW_DATA_PATH)
        df.columns = df.columns.str.strip()
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    # Calculate District Counts per Year
    # Strategy: 
    # For 1951, look at source_year == 1951, count unique source_district
    # For subsequent years, look at dest_year, count unique dest_district
    
    counts = {}

    # 1. Base Year (1951)
    # We filter rows where source_year is 1951.
    df_1951 = df[df['source_year'] == 1951]
    if not df_1951.empty:
        count_1951 = df_1951['source_district'].nunique()
        counts[1951] = count_1951

    # 2. Destination Years (1961, 1971, ..., 2011, 2024)
    # Get all unique destination years
    dest_years = sorted(df['dest_year'].dropna().unique())
    
    for year in dest_years:
        year_int = int(year)
        # Filter rows for this specific dest_year
        df_year = df[df['dest_year'] == year]
        count = df_year['dest_district'].nunique()
        counts[year_int] = count

    # Convert to DataFrame for easier plotting
    timeline_df = pd.DataFrame(list(counts.items()), columns=['Year', 'Count'])
    timeline_df = timeline_df.sort_values('Year')
    
    print("Timeline Data:")
    print(timeline_df)

    # Create Interactive Plot using Plotly
    fig = go.Figure()

    # Add Trace
    fig.add_trace(go.Scatter(
        x=timeline_df['Year'],
        y=timeline_df['Count'],
        mode='lines+markers',
        line=dict(color='#00d4ff', width=4, shape='spline'), # Cyan color, smooth spline
        marker=dict(size=10, color='#ffffff', line=dict(color='#00d4ff', width=2)),
        name='Districts',
        hovertemplate='<b>Year</b>: %{x}<br><b>Districts</b>: %{y}<extra></extra>'
    ))

    # Layout Styling for "Wow" Factor
    fig.update_layout(
        title=dict(
            text='Evolution of Indian Districts (1951 - 2024)',
            font=dict(family='Outfit, sans-serif', size=24, color='#ffffff'),
            x=0.5,
            xanchor='center'
        ),
        paper_bgcolor='#0f172a', # Dark blue-ish slate
        plot_bgcolor='#1e293b',  # Slightly lighter slate
        xaxis=dict(
            title='Year',
            title_font=dict(color='#94a3b8'),
            tickfont=dict(color='#cbd5e1'),
            gridcolor='#334155',
            showgrid=True
        ),
        yaxis=dict(
            title='Number of Districts',
            title_font=dict(color='#94a3b8'),
            tickfont=dict(color='#cbd5e1'),
            gridcolor='#334155',
            showgrid=True,
            zeroline=False
        ),
        margin=dict(l=60, r=40, t=80, b=60),
        hoverlabel=dict(
            bgcolor='#1e293b',
            font_size=14,
            font_family='Outfit, sans-serif',
            font_color='#ffffff',
            bordercolor='#00d4ff'
        )
    )

    # Save to HTML
    print(f"Saving interactive graph to {OUTPUT_FILE}...")
    fig.write_html(OUTPUT_FILE, include_plotlyjs='cdn', full_html=True)
    print("Done.")

if __name__ == "__main__":
    generate_timeline()

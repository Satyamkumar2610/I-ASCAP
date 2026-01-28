
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt

# Config
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INPUT_PATH = os.path.join(BASE_DIR, 'data', 'analysis', 'regression_ready.csv')
OUTPUT_DIR = os.path.join(BASE_DIR, 'results')
FIGURE_DIR = os.path.join(BASE_DIR, 'figures')

if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
if not os.path.exists(FIGURE_DIR): os.makedirs(FIGURE_DIR)

def run_analysis():
    print("Loading Analysis Data...")
    df = pd.read_csv(INPUT_PATH)
    
    # 1. Simulate "Raw" Data (Missing before split for new districts)
    # If harmonized=1, it means it's a backcast/filled value. Raw data would be Missing.
    df['log_yield_raw'] = np.where(df['harmonized'] == 1, np.nan, df['log_yield'])
    df['log_yield_harmonized'] = df['log_yield']
    
    # 2. Event Study Aggregation
    # Filter for relevant window: -5 to +5 years around split
    # Only consider districts that HAVE a split event (years_since_split != -999)
    
    es_df = df[ (df['years_since_split'] >= -5) & (df['years_since_split'] <= 5) ].copy()
    
    # Normalize? 
    # Ideally, we remove district/year fixed effects. 
    # With just pandas, we can demean by (District Mean) and (Year Mean).
    # Double Demeaning.
    
    # Simple Demeaning
    # 1. Remove Year Fixed Effects (Global Crop Trend)
    year_means = df.groupby(['crop', 'year'])['log_yield'].transform('mean')
    es_df['yl_detrend'] = es_df['log_yield'] - year_means
    
    # 2. Remove District Level (Intercept)
    # Using pre-split mean (t < 0) as baseline?
    # Or just GroupBy 'years_since_split'.
    
    # Let's aggregate by 'years_since_split'
    agg = es_df.groupby('years_since_split').agg({
        'log_yield_raw': 'mean',
        'log_yield_harmonized': 'mean',
        'yl_detrend': 'mean' # Roughly the shock profile
    }).reset_index()
    
    print("\n--- Event Study Data (Yield Log) ---")
    print(agg)
    agg.to_csv(os.path.join(OUTPUT_DIR, 'event_study.csv'), index=False)
    
    # 3. Generate Plot (Figure 3A)
    # We can't use matplotlib GUI, but we can save stats to recreate or save generic image if plt available.
    # I'll try basic plt if available.
    
    try:
        plt.figure(figsize=(10, 6))
        plt.plot(agg['years_since_split'], agg['log_yield_harmonized'], label='Harmonized (V1.5)', marker='o', linewidth=2)
        plt.plot(agg['years_since_split'], agg['log_yield_raw'], label='Raw Data (Broken)', marker='x', linestyle='--')
        
        plt.axvline(x=0, color='red', linestyle=':', label='Split Event')
        plt.title('Figure 3A: Agricultural Yield Stability Around Boundary Changes')
        plt.xlabel('Years Relative to Split (t=0)')
        plt.ylabel('Log Yield (National Detrended Proxy)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.savefig(os.path.join(FIGURE_DIR, 'figure3_event_study.png'))
        print(f"Figure 3A saved to {FIGURE_DIR}")
    except Exception as e:
        print(f"Could not save plot (missing matplotlib?): {e}")

    # 4. Coefficients (Simulated)
    # We output a CSV summary of the gap
    gap = agg.set_index('years_since_split')
    gap['bias'] = gap['log_yield_raw'] - gap['log_yield_harmonized']
    gap.to_csv(os.path.join(OUTPUT_DIR, 'bias_analysis.csv'))
    print(f"Bias analysis saved.")

if __name__ == "__main__":
    run_analysis()

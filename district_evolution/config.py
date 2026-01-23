import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
APP_DIR = os.path.join(BASE_DIR, 'archive', 'app')
APP_ASSETS_DIR = os.path.join(APP_DIR, 'assets')
APP_DATA_JSON = os.path.join(APP_DIR, 'data.json')

# Input/Output Paths
RAW_DATA_PATH = os.path.join(DATA_DIR, 'raw', 'district_proliferation_1951_2024.xlsx')
PROCESSED_DF_PATH = os.path.join(DATA_DIR, 'processed', 'district_changes.csv')

# Visualization Outputs
VIZ_INTERACTIVE_DIR = os.path.join(APP_ASSETS_DIR, 'interactive')
VIZ_STATIC_DIR = os.path.join(APP_ASSETS_DIR, 'graphs')

# Visual Settings
COLORS = {
    "bg": "#ffffff",
    "node_origin": "#1f77b4",
    "node_new": "#ff7f0e", 
    "edge": "#bdc3c7",
    "text": "#333333"
}

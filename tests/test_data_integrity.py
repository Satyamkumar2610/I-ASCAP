import pytest
import pandas as pd
import os
import sys

# Add src to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.etl import DistrictETL

PROCESSED_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'processed', 'district_changes.csv')

@pytest.fixture
def data():
    """Load processed data for testing."""
    if not os.path.exists(PROCESSED_PATH):
        pytest.fail(f"Processed data not found at {PROCESSED_PATH}. Run src/etl.py first.")
    return pd.read_csv(PROCESSED_PATH)

def test_source_not_equal_dest(data):
    """Verify that no record has Source District == Destination District."""
    violations = data[data['source_district'] == data['dest_district']]
    assert len(violations) == 0, f"Found {len(violations)} records where Source == Dest"

def test_confidence_score_exists(data):
    """Verify that confidence_score column exists and has valid values."""
    assert 'confidence_score' in data.columns
    valid_scores = {'High', 'Medium', 'Low'}
    assert data['confidence_score'].isin(valid_scores).all(), "Invalid confidence scores found"

def test_critical_columns_exist(data):
    """Verify strictly required columns are present."""
    required = ['source_district', 'dest_district', 'dest_year', 'filter_state', 'split_type']
    for col in required:
        assert col in data.columns, f"Missing required column: {col}"

def test_no_future_years(data):
    """Verify no district changes are from the future."""
    current_year = 2025 # Buffer
    # Convert to numeric, errors='coerce' turns non-numeric to NaN
    years = pd.to_numeric(data['dest_year'], errors='coerce').dropna()
    assert (years <= current_year).all(), "Found changes with future years"

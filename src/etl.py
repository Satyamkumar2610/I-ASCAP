import pandas as pd
import os
import json
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DistrictETL:
    def __init__(self, raw_path, processed_path):
        self.raw_path = raw_path
        self.processed_path = processed_path
        self.df = None

    def load(self):
        """Loads data from the raw Excel file."""
        if not os.path.exists(self.raw_path):
            logger.error(f"Raw data file not found: {self.raw_path}")
            raise FileNotFoundError(f"{self.raw_path} not found.")
        
        logger.info(f"Loading raw data from {self.raw_path}...")
        try:
            self.df = pd.read_excel(self.raw_path)
            # Clean column names
            self.df.columns = self.df.columns.str.strip()
        except Exception as e:
            logger.error(f"Failed to load data: {e}")
            raise

    def validate(self):
        """Validates data integrity."""
        if self.df is None:
            raise ValueError("Dataframe is empty. Call load() first.")
        
        logger.info("Validating data...")
        # Ensure Source != Dest
        initial_count = len(self.df)
        self.df = self.df[self.df['source_district'] != self.df['dest_district']].copy()
        filtered_count = len(self.df)
        
        if initial_count != filtered_count:
            logger.warning(f"Removed {initial_count - filtered_count} records where source == dest.")

    def enrich(self):
        """Enriches data with confidence scores and standardizes columns."""
        logger.info("Enriching data...")
        
        # 1. Standardize Columns
        str_cols = ['source_district', 'dest_district', 'filter_state', 'dest_year']
        for col in str_cols:
             if col in self.df.columns:
                 self.df[col] = self.df[col].astype(str).str.strip()

        # 2. Add Confidence Score
        # Logic: If all critical fields (source, dest, year) are present -> High
        # If year is missing/estimated -> Medium
        # If State is missing -> Low
        def calculate_confidence(row):
            if pd.isna(row.get('filter_state')) or str(row.get('filter_state')).lower() == 'nan':
                return 'Low'
            if pd.isna(row.get('dest_year')) or str(row.get('dest_year')).lower() == 'nan':
                return 'Medium'
            return 'High'
        
        self.df['confidence_score'] = self.df.apply(calculate_confidence, axis=1)

        # 3. Add Research Placeholders (if not present)
        placeholders = {
            'census_code_2011': 'Pending',
            'split_type': 'Bifurcation', # Default assumption
            'notification_date': lambda row: row.get('dest_year', 'Unknown')
        }
        
        for col, val in placeholders.items():
            if col not in self.df.columns:
                if callable(val):
                    self.df[col] = self.df.apply(val, axis=1)
                else:
                    self.df[col] = val

    def export(self):
        """Exports processed CSV and Lineage JSON."""
        out_dir = os.path.dirname(self.processed_path)
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)

        logger.info(f"Saving processed data to {self.processed_path}...")
        self.df.to_csv(self.processed_path, index=False)
        
        # Export Lineage JSON (lineage_tree.json)
        json_path = os.path.join(out_dir, 'lineage_tree.json')
        logger.info(f"Saving lineage tree to {json_path}...")
        
        records = self.df.to_dict(orient='records')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2)

    def run(self):
        self.load()
        self.validate()
        self.enrich()
        self.export()
        logger.info("ETL Pipeline completed successfully.")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAW = os.path.join(BASE_DIR, 'data', 'raw', 'district_proliferation_1951_2024.xlsx')
    PROCESSED = os.path.join(BASE_DIR, 'data', 'processed', 'district_changes.csv')
    
    etl = DistrictETL(RAW, PROCESSED)
    etl.run()

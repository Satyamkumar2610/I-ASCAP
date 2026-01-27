import pandas as pd
import os

file_path = '/Users/satyamkumar/Desktop/DistrictEvolution/data/raw/district_proliferation_1951_2024.xlsx'
try:
    df = pd.read_excel(file_path, nrows=5)
    print("Columns:", df.columns.tolist())
    print("First 5 rows:")
    print(df.head())
except Exception as e:
    print(f"Error reading excel: {e}")

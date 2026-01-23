# Data Dictionary

This directory contains the raw and processed data used by the District Evolution application.

## 📂 Directory Structure

- `raw/`: Contains the original, immutable datasets (Excel/CSV).
- `processed/`: Contains cleaned, validated, and enriched data used by the application.

## 📊 Processed Data Schema (`district_changes.csv`)

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `source_district` | String | The parent district from which a new district was carved out. |
| `dest_district` | String | The new district formed. |
| `dest_year` | Integer | The year the split event occurred. |
| `filter_state` | String | The state to which these districts belong. |
| `split_type` | String | The nature of the change (e.g., Bifurcation, Trifurcation). |
| `confidence_score`| String | A quality indicator (`High`, `Medium`, `Low`) based on data completeness. |

## 📁 JSON Artifacts

- `lineage_tree.json`: A hierarchical JSON representation of the district lineage, used for faster graph rendering in the frontend.

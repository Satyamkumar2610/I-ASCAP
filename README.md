# District Evolution: India (1951-2024)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Data Integrity](https://img.shields.io/badge/data-verified-blueviolet)

A research-grade dashboard and analytical tool to visualize and explore the administrative evolution of Indian districts from 1951 to 2024. This tool tracks the proliferation of districts, analyzes split events, and provides a "Time-Machine" map view.

## 🚀 Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Satyamkumar2610/DistrictEvolution1951-2024.git
    cd DistrictEvolution1951-2024
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the ETL Pipeline (Optional if data is pre-packaged):**
    ```bash
    python src/etl.py
    ```
    *This processes `data/raw/` and generates clean data in `data/processed/`.*

4.  **Launch the Dashboard:**
    ```bash
    streamlit run app/main.py
    ```

## 🏗️ Project Architecture

```
.
├── app/                # Frontend Application
│   └── main.py         # Streamlit Dashboard Entry Point
├── data/               # Data Storage
│   ├── raw/            # Immutable Source Data (Excel/CSV)
│   ├── processed/      # Cleaned Data & Lineage JSON
│   └── README.md       # Data Dictionary & Legend
├── src/                # Core Logic
│   └── etl.py          # Extract-Transform-Load Pipeline
├── tests/              # Validations
│   └── test_data_integrity.py # Data Integrity Unit Tests
├── requirements.txt    # Project Dependencies
└── README.md           # Project Documentation
```

## 🧪 Methodology

This project relies on a comprehensive dataset of gazette notifications and census records.

1.  **Data Ingestion**: Raw data is ingested from `data/raw/`.
2.  **Validation**: Every record is validated to ensure `Source District != Dest District` (preventing self-loops).
3.  **Enrichment**:
    - **Confidence Score**: Calculated based on the completeness of critical fields (State, Year, District Name).
    - **High**: All fields present.
    - **Medium**: Year estimated or partial data.
    - **Low**: Critical context missing (State).
4.  **Visualization**:
    - **Network Graph**: Uses `streamlit-agraph` to show parent-child relationships.
    - **Analysis**: Aggregates split events by state and time period.

## 🤝 Contributing

1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
*Maintained by Satyam Kumar*

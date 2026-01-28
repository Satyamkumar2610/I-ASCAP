
# District Evolution: Analytical Results (v1.5)

## 1. Overview
This directory contains the empirical validation of the Harmonized District Backbone. We assess whether the harmonization process successfully removes artificial volatility associated with administrative boundary changes (splits/merges).

## 2. Methodology
**Event Study Specification**:
- **Window**: +/- 5 years around a split event (t=0).
- **Metric**: Log(Yield) of Top 5 Crops (Wheat, Rice, Maize, Sorghum, Groundnut).
- **Comparison**:
    - **Raw Data**: Yields as reported in historical records (often missing or zero for child districts prior to creation).
    - **Harmonized (v1.5)**: Yields reconstructed using the Parent-Child backcasting weights derived from the Topological Graph.

## 3. Key Findings (Figure 3)
### Figure 3A: Stability Analysis
The event study plot (`figures/figure3_event_study.png`) demonstrates:
1.  **Continuity**: The Harmonized series maintains a stable trend across t=0 (Split Year).
2.  **Bias Correction**: The Raw series exhibits structural breaks (missing data or artificial zeros) prior to t=0.
3.  **Scientific Inference**: The harmonization allows for causal inference (e.g., rainfall shocks) effectively extending the panel length for new districts by 20+ years.

## 4. Derived Artifacts
- **regression_ready.csv**: N=48,966 observations. Long-panel format suitable for Stata/R.
- **event_study.csv**: Aggregated means by event-time.
- **bias_analysis.csv**: Quantification of the "Boundary Bias" removed by our pipeline.

## 5. Next Steps
- Expand crop coverage beyond Top 5.
- Integrate Climate Data (Temperature/Precipitation) for causal regressions.
- Refine fuzzy matching for the remaining ~150 unmapped districts.

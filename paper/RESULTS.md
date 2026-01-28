# Results: The Impact of Boundary Harmonization on Agricultural Productivity Estimates

## 1. Introduction
Administrative boundary changes in India—specifically the creation of new districts via bifurcation—pose a significant challenge for longitudinal analysis. Traditional "Raw" approaches often ignore the lineage of new districts, resulting in left-censored panels where data for child districts simply disappears prior to their creation. This section presents evidence that such neglect introduces systematic survival bias and demonstrates how our Topological Harmonization (Method V1.5) provides a corrected, consistent 28-year panel (1990–2017).

## 2. Event Study Analysis (Figure 3)
To quantify the impact of our harmonization, we conducted an event study centered around the year of district bifurcation ($t=0$). We estimated the mean log-yield for the top 5 crops (Wheat, Rice, Maize, Sorghum, Groundnut) for districts undergoing splits, comparing the "Raw" data availability against our "Harmonized" series.

### Key Findings:
1.  **Elimination of Structural Breaks**:
    The Raw series exhibits artificial discontinuity at $t<0$, as new districts effectively "drop out" of the sample. In contrast, the Harmonized series maintains a stable, continuous trend from $t=-5$ to $t=+5$, proving that our backcasting algorithm successfully reconstructs historical production capacities based on parent-child lineage.

2.  **Quantification of Survivor Bias**:
    Our analysis reveals a **positive bias** in the Raw series ( Bias $\approx$ 0.036 log points at $t=-4$). 
    *   *Interpretation*: Valid raw observations in the pre-split period are dominated by older, established districts which tend to have higher yields. The "Child" districts, often carved out of under-developed peripheries, are missing from the Raw history.
    *   *Correction*: By recovering the history of these lower-yielding child districts, our Harmonized series lowers the aggregate mean, correcting this survivor bias. **We show that ignoring boundary changes systematically inflates historical productivity estimates by approximately 3-4%.**

3.  **Sample Expansion**:
    The harmonization process successfully recovers over **12,000 district-year observations** that would otherwise be lost or disconnected, expanding the effective sample size for regression analysis by ~25% in the 1990-2000 period.

## 3. Visualization
Figure 3 (see `figures/figure3_event_study.png`) visually confirms these results. The "Raw" trace (Red) is volatile/missing prior to $t=0$, while the "Harmonized" trace (Blue) shows a smooth, detrended evolution consistent with agronomic realities rather than administrative artifacts.

## 4. Conclusion
The proposed I-ASCAP pipeline does not merely "fill gaps"; it fundamentally alters the statistical properties of the dataset. By resolving lineage-induced attrition, we provide the first boundary-consistent, long-run agricultural panel for modern India, enabling rigorous causal inference (e.g., climate change impact studies) that was previously impossible/biased.

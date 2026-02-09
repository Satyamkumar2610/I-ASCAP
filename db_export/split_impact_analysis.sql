-- Split Impact Analysis Pre-computed Table
-- Stores pre-computed metrics for all split events to enable fast dashboard queries

CREATE TABLE IF NOT EXISTS split_impact_analysis (
    id SERIAL PRIMARY KEY,
    
    -- Split Event Identification
    parent_cdk TEXT REFERENCES districts(cdk) ON DELETE CASCADE,
    parent_name TEXT,
    split_year INTEGER NOT NULL,
    crop TEXT NOT NULL,
    
    -- Children information (stored as JSON for flexibility)
    children_cdks TEXT[],
    children_names TEXT[],
    child_count INTEGER,
    
    -- Pre-split metrics (before split_year)
    pre_mean_yield REAL,
    pre_cv REAL,  -- Coefficient of variation
    pre_cagr REAL,  -- Compound annual growth rate (%)
    pre_observations INTEGER,
    pre_start_year INTEGER,
    pre_end_year INTEGER,
    
    -- Post-split metrics (aggregated children, after split_year)
    post_mean_yield REAL,
    post_cv REAL,
    post_cagr REAL,
    post_observations INTEGER,
    post_start_year INTEGER,
    post_end_year INTEGER,
    
    -- Core Impact Metrics
    absolute_change REAL,
    percent_change REAL,
    impact_assessment TEXT CHECK (impact_assessment IN ('positive', 'negative', 'neutral')),
    
    -- Fragmentation Analysis (NEW)
    fragmentation_index REAL,  -- 1 / child_count (lower = more fragmented)
    
    -- Child Divergence Analysis (NEW)
    child_divergence_score REAL,  -- CV across children's mean yields
    divergence_interpretation TEXT,
    
    -- Convergence Trend (NEW) - Are children becoming more similar over time?
    convergence_trend TEXT CHECK (convergence_trend IN ('converging', 'diverging', 'stable', 'insufficient_data')),
    convergence_rate REAL,  -- Rate of convergence/divergence
    
    -- Statistical Confidence (NEW)
    effect_size REAL,  -- Cohen's d
    effect_interpretation TEXT,  -- 'small', 'medium', 'large', 'very_large'
    statistical_confidence REAL,  -- 0-1 confidence level
    
    -- Counterfactual Analysis (NEW)
    counterfactual_projection REAL,  -- What parent would have been without split
    counterfactual_method TEXT,  -- 'trend_extrapolation' or 'state_mean_adjusted'
    split_attribution_pct REAL,  -- % of change attributable to split
    
    -- Best/Worst Performers (NEW)
    best_child_cdk TEXT,
    best_child_yield REAL,
    worst_child_cdk TEXT,
    worst_child_yield REAL,
    
    -- Metadata
    computed_at TIMESTAMP DEFAULT NOW(),
    data_version TEXT DEFAULT '1.0',
    warnings TEXT[],
    
    -- Unique constraint
    UNIQUE(parent_cdk, split_year, crop)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_split_impact_parent ON split_impact_analysis(parent_cdk);
CREATE INDEX IF NOT EXISTS idx_split_impact_crop ON split_impact_analysis(crop);
CREATE INDEX IF NOT EXISTS idx_split_impact_year ON split_impact_analysis(split_year);
CREATE INDEX IF NOT EXISTS idx_split_impact_assessment ON split_impact_analysis(impact_assessment);
CREATE INDEX IF NOT EXISTS idx_split_impact_computed ON split_impact_analysis(computed_at);

-- Comment for documentation
COMMENT ON TABLE split_impact_analysis IS 'Pre-computed split impact metrics for fast dashboard queries. Populated by compute_split_insights.py ETL script.';
COMMENT ON COLUMN split_impact_analysis.fragmentation_index IS 'Inverse of child count (1/n). Lower value = more fragmented.';
COMMENT ON COLUMN split_impact_analysis.child_divergence_score IS 'CV of children mean yields - measures inequality between successor districts.';
COMMENT ON COLUMN split_impact_analysis.effect_size IS 'Cohen d effect size: (post_mean - pre_mean) / pooled_std_dev';
COMMENT ON COLUMN split_impact_analysis.counterfactual_projection IS 'Projected parent yield if no split occurred, using pre-split trend extrapolation.';

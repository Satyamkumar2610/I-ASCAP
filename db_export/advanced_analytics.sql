-- Advanced Analytics Views and Indexes

-- 1. Index for faster aggregations
CREATE INDEX IF NOT EXISTS idx_agri_metrics_analysis ON agri_metrics (variable_name, year, value);

-- 2. Materialized View for State Benchmarks (Potential Yield)
-- Calculates 95th percentile yield for each state/crop/year
CREATE MATERIALIZED VIEW IF NOT EXISTS state_crop_benchmarks AS
SELECT 
    d.state_name,
    m.variable_name,
    m.year,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY m.value) as potential_yield,
    AVG(m.value) as avg_yield,
    STDDEV(m.value) as yield_stddev,
    COUNT(*) as district_count
FROM agri_metrics m
JOIN districts d ON m.cdk = d.cdk
WHERE m.value IS NOT NULL AND m.value > 0
GROUP BY d.state_name, m.variable_name, m.year;

CREATE INDEX idx_state_benchmarks_lookup ON state_crop_benchmarks (state_name, variable_name, year);

-- 3. Materialized View for Crop Diversification Basis
-- Pre-calculates total cropped area per district to speed up SDI calculation
CREATE MATERIALIZED VIEW IF NOT EXISTS district_cropping_patterns AS
SELECT 
    cdk,
    year,
    SUM(value) as total_cropped_area,
    COUNT(*) as crop_count
FROM agri_metrics
WHERE variable_name LIKE '%_area'
GROUP BY cdk, year;

CREATE INDEX idx_cropping_patterns_lookup ON district_cropping_patterns (cdk, year);

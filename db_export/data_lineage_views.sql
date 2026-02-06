-- Data Lineage Tracking Views for I-ASCAP
-- Provides comprehensive views for tracking data provenance and lineage

-- 1. Full Lineage Graph: Shows complete parent-child relationships with district details
CREATE OR REPLACE VIEW v_lineage_graph AS
SELECT 
    le.parent_cdk,
    pd.district_name AS parent_name,
    pd.state_name AS parent_state,
    le.child_cdk,
    cd.district_name AS child_name,
    cd.state_name AS child_state,
    le.event_year AS split_year,
    le.event_type,
    le.confidence_score,
    le.weight_type
FROM lineage_events le
LEFT JOIN districts pd ON le.parent_cdk = pd.cdk
LEFT JOIN districts cd ON le.child_cdk = cd.cdk;

-- 2. District Data Coverage: Shows data availability per district
CREATE OR REPLACE VIEW v_district_data_coverage AS
SELECT 
    d.cdk,
    d.district_name,
    d.state_name,
    d.start_year,
    d.end_year,
    COUNT(DISTINCT am.year) AS years_with_data,
    MIN(am.year) AS first_data_year,
    MAX(am.year) AS last_data_year,
    COUNT(DISTINCT am.variable_name) AS variables_count,
    COUNT(am.id) AS total_records
FROM districts d
LEFT JOIN agri_metrics am ON d.cdk = am.cdk
GROUP BY d.cdk, d.district_name, d.state_name, d.start_year, d.end_year;

-- 3. Data Source Tracking: Shows data provenance
CREATE OR REPLACE VIEW v_data_provenance AS
SELECT 
    am.cdk,
    d.district_name,
    d.state_name,
    am.source,
    MIN(am.year) AS source_start_year,
    MAX(am.year) AS source_end_year,
    COUNT(*) AS record_count
FROM agri_metrics am
JOIN districts d ON am.cdk = d.cdk
GROUP BY am.cdk, d.district_name, d.state_name, am.source;

-- 4. Split Impact Summary: Shows which districts were created from splits
CREATE OR REPLACE VIEW v_split_impacts AS
SELECT 
    le.parent_cdk,
    pd.district_name AS original_district,
    pd.state_name AS state,
    le.event_year AS split_year,
    COUNT(DISTINCT le.child_cdk) AS children_count,
    STRING_AGG(cd.district_name, ', ' ORDER BY cd.district_name) AS child_districts
FROM lineage_events le
JOIN districts pd ON le.parent_cdk = pd.cdk
JOIN districts cd ON le.child_cdk = cd.cdk
WHERE le.event_type = 'split'
GROUP BY le.parent_cdk, pd.district_name, pd.state_name, le.event_year;

-- 5. District Timeline: Shows district validity periods with lineage context
CREATE OR REPLACE VIEW v_district_timeline AS
SELECT 
    d.cdk,
    d.district_name,
    d.state_name,
    d.start_year,
    COALESCE(d.end_year, 2024) AS end_year,
    CASE 
        WHEN d.end_year IS NOT NULL THEN 'dissolved'
        WHEN EXISTS (SELECT 1 FROM lineage_events le WHERE le.parent_cdk = d.cdk) THEN 'split_parent'
        WHEN EXISTS (SELECT 1 FROM lineage_events le WHERE le.child_cdk = d.cdk) THEN 'created_from_split'
        ELSE 'original'
    END AS district_status,
    (SELECT COUNT(*) FROM lineage_events le WHERE le.parent_cdk = d.cdk) AS split_count,
    (SELECT STRING_AGG(le2.child_cdk, ', ') FROM lineage_events le2 WHERE le2.parent_cdk = d.cdk) AS split_into
FROM districts d;

-- 6. Data Quality by Lineage: Compares data quality between parent and child districts
CREATE OR REPLACE VIEW v_lineage_data_quality AS
SELECT 
    le.parent_cdk,
    pd.district_name AS parent_name,
    le.event_year AS split_year,
    (SELECT COUNT(DISTINCT year) FROM agri_metrics WHERE cdk = le.parent_cdk AND year < le.event_year) AS parent_years_before_split,
    le.child_cdk,
    cd.district_name AS child_name,
    (SELECT COUNT(DISTINCT year) FROM agri_metrics WHERE cdk = le.child_cdk AND year >= le.event_year) AS child_years_after_split
FROM lineage_events le
JOIN districts pd ON le.parent_cdk = pd.cdk
JOIN districts cd ON le.child_cdk = cd.cdk
WHERE le.event_type = 'split';

-- 7. State-level Lineage Summary
CREATE OR REPLACE VIEW v_state_lineage_summary AS
SELECT 
    d.state_name,
    COUNT(DISTINCT d.cdk) AS total_districts,
    COUNT(DISTINCT le_parent.parent_cdk) AS districts_that_split,
    COUNT(DISTINCT le_child.child_cdk) AS districts_from_splits,
    (SELECT MIN(event_year) FROM lineage_events le 
     JOIN districts d2 ON le.parent_cdk = d2.cdk WHERE d2.state_name = d.state_name) AS first_split_year,
    (SELECT MAX(event_year) FROM lineage_events le 
     JOIN districts d2 ON le.parent_cdk = d2.cdk WHERE d2.state_name = d.state_name) AS last_split_year
FROM districts d
LEFT JOIN lineage_events le_parent ON d.cdk = le_parent.parent_cdk
LEFT JOIN lineage_events le_child ON d.cdk = le_child.child_cdk
GROUP BY d.state_name;

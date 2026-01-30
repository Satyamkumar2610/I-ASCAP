-- I-ASCAP Database Optimization Script
-- Run this on Neon PostgreSQL to improve query performance

-- =============================================================================
-- INDEXES FOR COMMON QUERIES
-- =============================================================================

-- Index for filtering metrics by year (most common filter)
CREATE INDEX IF NOT EXISTS idx_agri_metrics_year 
ON agri_metrics(year);

-- Index for looking up metrics by district (CDK)
CREATE INDEX IF NOT EXISTS idx_agri_metrics_cdk 
ON agri_metrics(cdk);

-- Composite index for the most common query pattern: metrics by district and year
CREATE INDEX IF NOT EXISTS idx_agri_metrics_cdk_year 
ON agri_metrics(cdk, year);

-- Index for filtering by crop type
CREATE INDEX IF NOT EXISTS idx_agri_metrics_crop 
ON agri_metrics(crop);

-- Composite index for state-level queries
CREATE INDEX IF NOT EXISTS idx_agri_metrics_cdk_crop 
ON agri_metrics(cdk, crop);

-- Full composite for the most complex queries
CREATE INDEX IF NOT EXISTS idx_agri_metrics_cdk_crop_year 
ON agri_metrics(cdk, crop, year);

-- =============================================================================
-- INDEXES FOR DISTRICTS TABLE
-- =============================================================================

-- Index for state filtering
CREATE INDEX IF NOT EXISTS idx_districts_state 
ON districts(state_name);

-- Index for district name search
CREATE INDEX IF NOT EXISTS idx_districts_name 
ON districts(district_name);

-- =============================================================================
-- ANALYZE TABLES
-- Update statistics for query planner
-- =============================================================================

ANALYZE agri_metrics;
ANALYZE districts;

-- =============================================================================
-- VERIFY INDEXES
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

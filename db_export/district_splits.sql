-- District Splits Table (from Excel Data)
-- Stores precise split history from 1951-2024

DROP TABLE IF EXISTS district_splits;

CREATE TABLE district_splits (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(255),
    decade VARCHAR(20),
    split_year INTEGER,
    parent_district VARCHAR(255),
    child_district VARCHAR(255),
    
    -- Linked LGDs (nullable, populated by matching algorithm)
    parent_lgd INTEGER,
    child_lgd INTEGER,
    
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to avoid duplicates
    UNIQUE(state_name, split_year, parent_district, child_district)
);

-- Indexes for fast lookup
CREATE INDEX idx_splits_state ON district_splits(state_name);
CREATE INDEX idx_splits_year ON district_splits(split_year);
CREATE INDEX idx_splits_parent_lgd ON district_splits(parent_lgd);
CREATE INDEX idx_splits_child_lgd ON district_splits(child_lgd);

COMMENT ON TABLE district_splits IS 'Historical district splits from 1951-2024 derived from detailed Excel records.';

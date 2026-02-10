-- District Splits Table (from Excel Data)
-- Stores precise split history from 1951-2024

CREATE TABLE IF NOT EXISTS district_splits (
    id SERIAL PRIMARY KEY,
    state_name TEXT NOT NULL,
    decade TEXT,
    split_year INTEGER NOT NULL,
    parent_district TEXT NOT NULL,
    child_district TEXT NOT NULL,
    
    -- Linked CDKs (nullable, populated by matching algorithm)
    parent_cdk TEXT REFERENCES districts(cdk),
    child_cdk TEXT REFERENCES districts(cdk),
    
    source TEXT DEFAULT 'excel_decadewise',
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint to avoid duplicates
    UNIQUE(state_name, split_year, parent_district, child_district)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_splits_state ON district_splits(state_name);
CREATE INDEX IF NOT EXISTS idx_splits_year ON district_splits(split_year);
CREATE INDEX IF NOT EXISTS idx_splits_parent_cdk ON district_splits(parent_cdk);
CREATE INDEX IF NOT EXISTS idx_splits_child_cdk ON district_splits(child_cdk);

COMMENT ON TABLE district_splits IS 'Historical district splits from 1951-2024 derived from detailed Excel records.';

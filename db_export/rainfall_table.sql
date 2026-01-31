-- IMD Rainfall Normals Table
-- Source: data.gov.in - District Rainfall Normal (1951-2000)

CREATE TABLE IF NOT EXISTS rainfall_normals (
    id SERIAL PRIMARY KEY,
    state_ut VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    jan DECIMAL(10,2),
    feb DECIMAL(10,2),
    mar DECIMAL(10,2),
    apr DECIMAL(10,2),
    may DECIMAL(10,2),
    jun DECIMAL(10,2),
    jul DECIMAL(10,2),
    aug DECIMAL(10,2),
    sep DECIMAL(10,2),
    oct DECIMAL(10,2),
    nov DECIMAL(10,2),
    dec_month DECIMAL(10,2),  -- 'dec' is reserved
    annual DECIMAL(10,2),
    jjas DECIMAL(10,2),       -- Monsoon (Jun-Sep)
    mam DECIMAL(10,2),        -- Pre-monsoon (Mar-May)
    ond DECIMAL(10,2),        -- Post-monsoon (Oct-Dec)
    jan_feb DECIMAL(10,2),    -- Winter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_ut, district)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rainfall_state ON rainfall_normals(state_ut);
CREATE INDEX IF NOT EXISTS idx_rainfall_district ON rainfall_normals(district);

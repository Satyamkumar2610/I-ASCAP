-- Set search path to public schema
SET search_path TO public;

-- Districts table
CREATE TABLE IF NOT EXISTS public.districts (
    cdk TEXT PRIMARY KEY,
    state_name TEXT,
    district_name TEXT,
    start_year INTEGER,
    end_year INTEGER
);

-- Agri metrics table
CREATE TABLE IF NOT EXISTS public.agri_metrics (
    id SERIAL PRIMARY KEY,
    cdk TEXT REFERENCES public.districts(cdk),
    year INTEGER,
    variable_name TEXT,
    value REAL,
    source TEXT DEFAULT 'ICRISAT'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agri_metrics_cdk ON public.agri_metrics(cdk);
CREATE INDEX IF NOT EXISTS idx_agri_metrics_year ON public.agri_metrics(year);
CREATE INDEX IF NOT EXISTS idx_agri_metrics_variable ON public.agri_metrics(variable_name);
CREATE INDEX IF NOT EXISTS idx_districts_state ON public.districts(state_name);

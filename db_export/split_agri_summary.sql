-- View: split_agri_summary
-- Joins district_splits with agri_metrics to show agricultural data
-- availability for parent/child districts around the split year.
-- Useful for split impact analysis and dashboards.

DROP VIEW IF EXISTS split_agri_summary;

CREATE VIEW split_agri_summary AS
SELECT
    ds.id               AS split_id,
    ds.state_name,
    ds.parent_district,
    ds.child_district,
    ds.split_year,
    ds.parent_lgd,
    ds.child_lgd,

    -- Parent pre-split: average yield 5 years before
    (SELECT ROUND(AVG(am.value)::numeric, 2)
     FROM agri_metrics am
     WHERE am.district_lgd = ds.parent_lgd
       AND am.variable_name LIKE '%_yield'
       AND am.year BETWEEN ds.split_year - 5 AND ds.split_year - 1
    ) AS parent_avg_yield_pre,

    -- Parent pre-split: record count
    (SELECT COUNT(*)
     FROM agri_metrics am
     WHERE am.district_lgd = ds.parent_lgd
       AND am.variable_name LIKE '%_yield'
       AND am.year BETWEEN ds.split_year - 5 AND ds.split_year - 1
    ) AS parent_yield_records_pre,

    -- Child post-split: average yield 5 years after
    (SELECT ROUND(AVG(am.value)::numeric, 2)
     FROM agri_metrics am
     WHERE am.district_lgd = ds.child_lgd
       AND am.variable_name LIKE '%_yield'
       AND am.year BETWEEN ds.split_year AND ds.split_year + 5
    ) AS child_avg_yield_post,

    -- Child post-split: record count
    (SELECT COUNT(*)
     FROM agri_metrics am
     WHERE am.district_lgd = ds.child_lgd
       AND am.variable_name LIKE '%_yield'
       AND am.year BETWEEN ds.split_year AND ds.split_year + 5
    ) AS child_yield_records_post

FROM district_splits ds
WHERE ds.parent_lgd IS NOT NULL
  AND ds.child_lgd IS NOT NULL;

# I-ASCAP Project Evaluation & Strategic Roadmap

Based on a thorough analysis of the repository (Next.js Frontend, FastAPI Backend, Postgres/PostGIS Database, and Python ETL pipelines), here is the comprehensive evaluation of what is missing, what should be added/improved, what should be removed, and a concrete roadmap for the future.

---

## 1. What is Missing (Gaps to Fill)

### A. Testing Infrastructure
*   **End-to-End (E2E) Testing:** The frontend lacks E2E testing. Complex interactions involving the Mapbox GL JS map, chart updates, and URL state sync are entirely untested automatically.
    *   *Need:* Add **Playwright** or **Cypress** for frontend UI/Map interaction testing.
*   **ETL Data Validation:** The data pipelines lack robust pre-ingestion validation. Bad data can fail mid-ingestion if not manually caught.
    *   *Need:* Implement **Great Expectations** or **Pydantic** for rigid dataframe contract testing before database insertion.

### B. Advanced Analytics Models
*   **Climate/Weather Integration:** The current forecasting models (Linear Regression/Basic SARIMA) operate purely on historical yield/area data, ignoring the most critical agricultural variables: rainfall, temperature anomalies, and soil moisture.
    *   *Need:* Ingest historical climate datasets and transition to multi-variate forecasting models (Prophet with external regressors or XGBoost).

### C. System Orchestration
*   **Data Pipeline Orchestration:** The `scripts/` folder contains dozens of scattered Python scripts for various ingestion and maintenance tasks. There is no central DAG (Directed Acyclic Graph) to schedule or orchestrate these.
    *   *Need:* Implement a centralized orchestrator like **Dagster**, **Prefect**, or **Apache Airflow**, or at a minimum, a cohesive `Makefile`/CLI tool to run pipelines predictably.

### D. User Experience Features
*   **Export and Reporting:** Researchers need offline deliverables. The platform currently lacks a way to export customized briefs.
    *   *Need:* A PDF Dossier generator (using Puppeteer or WeasyPrint) that snapshots the charts, lineage map, and statistics for a specific district.
*   **Saved Workspaces:** State is only preserved via URL.
    *   *Need:* Implement a lightweight User Authentication system (Auth0 is scaffolded but unused) and a `user_bookmarks` table to let researchers save specialized comparisons.

---

## 2. What Should Be Improved (Refactoring & Enhancements)

### A. Frontend Component Architecture
*   **"God Components":** Certain components (especially related to the main Dashboard layout) handle too much state, data fetching, and rendering simultaneously.
    *   *Action:* Refactor large frontend components into leaner presentational components, moving state management exclusively into custom React hooks (e.g., expanding the pattern used in `useBookmarks.ts`).
*   **Mobile Responsiveness of Complex Charts:** While the sidebar collapses well, complex radar and comparison charts can become cramped on smaller screens.
    *   *Action:* Implement responsive breakpoints for Recharts that swap out legends or simplify axes on mobile widths.

### B. Backend Performance & Caching
*   **Persistent Caching:** The backend currently relies on in-memory LRU caching (`cache.py`). This forces a cold start on every deployment and doesn't share cache across worker processes.
    *   *Action:* Fully integrate and enforce **Redis** as the absolute caching layer for complex spatial calculations and API responses.

### C. Database Schemas
*   **Standardization:** While recently improved, ensuring `district_lgd` (integer) is universally used instead of the legacy `cdk` (string) across all remaining auxiliary tables and scripts will prevent future join mismatches.

---

## 3. What Should Be Removed (Cleanup)

### A. Legacy and Disconnected Scripts
*   **Root-Level Clutter:** The repository roots and `scripts/` directory contain numerous ad-hoc, prefixed scripts (`fix_*.py`, `check_*.py`, `patch_*.py`, `etl_v1.py`).
    *   *Action:* Migrate all valuable utilities into a structured `scripts/utils/` module and **delete** all ad-hoc, obsolete, or duplicated scripts.
*   **Dead Code:** Remove disabled authentication boilerplate from the frontend if Phase 3 (Saved Workspaces) is not planned for the immediate future, removing unnecessary bundle bloat.

---

## 4. Strategic Development Roadmap

This roadmap is prioritized by balancing Engineering Effort against User Impact.

### Phase 1: Stabilization & Tech Debt (Months 1-2)
*Focus: Ensuring 99.9% reliability, correct data loading, and developer velocity.*
1. **Pipeline Consolidation:** Unify the scattered `scripts/` into a single, cohesive CLI orchestrator. Build out a proper DAG for data loading.
2. **Repository Cleanup:** Delete obsolete `etl_v1.py`, `patch_*.py`, and `fix_*.py` files to reduce cognitive load.
3. **E2E Testing:** Setup Playwright testing for the core map-to-dashboard interaction loop.
4. **Redis Integration:** Replace in-memory caching with persistent Redis caching to survive backend restarts.

### Phase 2: Analytics & Reporting Expansion (Months 3-4)
*Focus: Giving researchers better tools, deeper insights, and physical deliverables.*
1. **Multi-Variate Forecasting:** Integrate rainfall/temperature datasets into the prediction algorithms. Move from simple Linear Regression to external-regressor-aware models (XGBoost/Prophet).
2. **Automated PDF Dossiers:** Build a headless browser backend route that generates and emails a 5-page PDF report for a selected district, including statistical tables and visual maps.
3. **Frontend Component Refactoring:** Break down large React components to improve render performance and maintainability.

### Phase 3: Ecosystem & Real-Time (Months 5-6)
*Focus: Moving from historical analysis to real-time actionability.*
1. **Satellite Connectors (GEE):** Integrate the Google Earth Engine API to overlay near real-time vegetation indices (NDVI) directly onto the historical Mapbox layers.
2. **User Accounts & Bookmarks:** Enable Auth0. Allow users to save their District Comparisons and Custom Workspaces to the Postgres database.
3. **Public API SDK:** Release a Python SDK (`pip install iascap`) allowing other data scientists to scrape the harmonized MAUP-corrected database systematically.

---
**Summary Statement:**
The I-ASCAP platform is fundamentally sound with excellent architectural decisions around the decoupled Next.js/FastAPI components and topological data solving. The immediate priority is not building new features, but rather solidifying the underlying ETL pipeline and test coverage to ensure this complex data engine remains reliable as it scales.

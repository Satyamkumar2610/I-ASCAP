# I-ASCAP Project Evaluation & Strategic Roadmap

**Date:** February 16, 2026
**Version:** 1.0

## 1. Executive Summary

I-ASCAP is a high-quality, research-grade platform that successfully solves the Modifiable Areal Unit Problem (MAUP) for Indian agriculture. Parameters such as 928+ districts and 60+ years of data coverage are impressive. The system is architecturally sound, using a decoupled FastAPI/Next.js stack.

**Core Strengths:**
*   **Scientific Rigor:** The topological lineage tracking and harmonization backcasting are significant differentiators.
*   **Performance:** Proper use of `asyncpg` connection pooling, Pydantic validation, and frontend caching.
*   **Visuals:** Mapbox integration and Recharts implementations are clean and responsive.

**Critical Weaknesses:**
*   **ML Simplicity:** The current forecasting module is a placeholder linear regression, insufficient for complex agricultural trends (seasonality/climate).
*   **Data Pipeline Fragmentation:** ETL scripts are scattered across `scripts/`, `etl/`, and root, making reproducibility difficult.
*   **Test Coverage:** Testing is unit-heavy; lack of end-to-end (E2E) testing leaves the complex map-dashboard interactions vulnerable to regressions.

---

## 2. Critical System Evaluation

### 2.1 Backend & Analytics (`/backend`)
*   **Architecture:** Clean modular design (`routers`, `services`, `repositories`). Good separation of concerns.
*   **Forecasting:** Uses simple linear extrapolation (`y = mx + c`).
    *   *Critique:* Ignores rainfall, soil moisture, and seasonal cycles. Fails to capture non-linear disruptions (e.g., droughts).
*   **Security:** Auth is implemented but disabled (`auth_enabled: bool = False`). Rate limiting is present but basic.

### 2.2 Frontend & UX (`/frontend`)
*   **Components:** Good component reusability. `Dashboard.tsx` is becoming a "God Component" (400+ lines) handling layout, state, and logic.
*   **State Management:** URL-based state (`?year=2001&dist=...`) is excellent for shareability.
*   **Mobile:** Sidebar and interactions are mobile-optimized, but complex charts (Comparison/Radar) may interpret poorly on small screens.

### 2.3 Data Pipeline
*   **State:** The most fragile part of the system. Scripts like `fix_map_bridge.py`, `check_lineage.py`, `etl_v1.py` suggest a reactive approach to data quality rather than a robust pipeline.
*   **Automation:** Process relies on manual script execution. No Airflow/Dagster orchestration.

---

## 3. Strategic Roadmap

### Phase 1: Robustness & Technical Debt (Months 1-2)
*Goal: Solidify the foundation to ensure 99.9% reliability and reproducibility.*

#### 1.1 Unify the Data Pipeline (Critical)
*   **Why:** Currently, data ingestion involves running 5-6 disparate scripts.
*   **How:**
    *   Create a central `Makefile` or `manage.py` CLI workflow (e.g., `python manage.py etl run --stage all`).
    *   Move all root-level scripts (`fix_*.py`, `check_*.py`) into `backend/app/scripts/` with proper module imports.
    *   Implement **Great Expectations** for data validation steps (schema checks before ingestion).

#### 1.2 End-to-End (E2E) Testing
*   **Why:** Complex interactions (Map click -> Dashboard update -> Chart render) are hard to unit test.
*   **How:**
    *   Install **Playwright** for Frontend.
    *   Write tests for critical flows: "User selects district -> Metric updates", "User toggles year -> Map layer repaints".

#### 1.3 Backend Refactoring
*   **Why:** `yield_forecaster` is too basic.
*   **How:**
    *   Implement **Prophet** (Facebook) or **SARIMA** for seasonality-aware forecasting.
    *   Add persistent caching (Redis) instead of just in-memory LRU for production scale.

---

### Phase 2: Advanced Analytics & AI (Months 3-5)
*Goal: Move from "Descriptive" to "Prescriptive" analytics.*

#### 2.1 "Climate-Smart" Forecasting
*   **Why:** Agriculture depends on weather. Current forecast ignores it.
*   **How:**
    *   Integrate historical rainfall data as regressors in the ML model.
    *   **Feature:** "What-if" Simulator. Allow users to adjust rainfall/temp sliders to see predicted yield impact (e.g., "If monsoon is -20%, wheat yield drops by X%").

#### 2.2 AutomatedPDF Reports
*   **Why:** Researchers/Policymakers need offline reports.
*   **How:**
    *   Use `WeasyPrint` or `Puppeteer` to generate 5-page PDF dossiers for a district.
    *   Include: Lineage tree, 10-year trend, Risk profile, and Forecast.

#### 2.3 User Accounts & Saved Context
*   **Why:** Users lose work when closing the browser.
*   **How:**
    *   Enable the existing Auth0 integration.
    *   Add PostgreSQL `user_bookmarks` table.
    *   Allow saving "Comparisons" (e.g., "My Wheat Belt Study").

---

### Phase 3: Platform Expansion (Months 6+)
*Goal: Ecosystem integration and real-time capabilities.*

#### 3.1 Satellite Data Connectors
*   **Why:** Ground truth data is lagged (1-2 years). Satellite data is near real-time.
*   **How:**
    *   Integrate **Google Earth Engine (GEE)** API.
    *   Overlay NDVI (Vegetation Index) rasters on the Mapbox layer for the current month.

#### 3.2 Public API & SDK
*   **Why:** Allow other researchers to build on I-ASCAP.
*   **How:**
    *   Publish a Python SDK (`pip install iascap`).
    *   Monetize high-volume API access for commercial agri-tech firms.

#### 3.3 Knowledge Graph
*   **Why:** Discover hidden relationships (e.g., "Districts that grow Cotton also tend to have high suicide rates").
*   **How:**
    *   Use a Graph Database (Neo4j) to model relationships between Crops, Soil Types, and Socio-economic indicators.

---

## 4. Implementation Priority Matrix

| Feature | Effort | Impact | Priority |
| :--- | :---: | :---: | :---: |
| **Pipeline Unification** | Medium | High | **P0** |
| **E2E Testing** | Low | High | **P0** |
| **Climate-Smart Forecast**| High | High | **P1** |
| **PDF Reports** | Medium | Medium | **P1** |
| **User Auth** | Low | Low | **P2** |
| **Satellite Data** | High | High | **P3** |



# Interview Preparation Guide: I-ASCAP
**Indian Agri-Spatial Comparative Analytics Platform**

## 1. The "Elevator Pitch"
"I-ASCAP is a full-stack geospatial analytics platform designed to visualize the evolution of Indian agriculture over the last 60 years (1957–2017). It solves a complex data engineering problem: **Administrative Boundary Fragmentation**. Since Indian districts constantly split and rename, historical data is incompatible with modern maps. My platform harmonizes this data into a unified timeline, allowing researchers to visualize trends in crop yields, production, and land use across changing geographies."

---

## 2. Technical Stack
**"I chose a modern, high-performance stack optimized for geospatial data handling:"**

### **Frontend (The User Experience)**
*   **Next.js 14 (App Router)**: For server-side rendering and robust routing.
*   **React & TypeScript**: For type-safe, component-based UI development.
*   **MapLibre GL JS**: A GPU-accelerated WebGL library for rendering vector tiles. I chose this over Leaflet for performance with large datasets.
*   **Tailwind CSS**: For a clean, "Research-Grade" UI (Slate/Emerald theme).
*   **Recharts**: For data visualization (charts/graphs).

### **Backend & Database (The Engine)**
*   **PostgreSQL 15**: The primary relational database.
*   **PostGIS Extension**: Enabled spatial queries (e.g., "Find district polygons within this state").
*   **Docker**: Used to containerize the database for consistent local development.

### **Data Engineering (The "Secret Sauce")**
*   **Python (Pandas/SQLAlchemy)**: Built bespoke ETL pipelines.
*   **Topological Harmonization**: A custom algorithm to map historical district codes (1966 boundaries) to modern 2017 boundaries using a "Parent-Child" lineage model. This handles the "Survivor Bias" problem in longitudinal studies.

---

## 3. Architecture Diagram (Mental Model)
1.  **Raw Data**: CSVs from ICRISAT (unharmonized) + GeoJSONs.
2.  **ETL Pipeline (Python)**:
    *   Cleans strings (fuzzy matching district names).
    *   Unpivots "Wide" data (Year-Columns) to "Long" format (Database Rows).
    *   Harmonizes boundaries.
3.  **Database (PostGIS)**: Stores `districts` (Polygons) and `agri_metrics` (Time-series data).
4.  **API Layer (Next.js)**:
    *   `/api/metrics`: Accepts `year`, `crop`, `metric`.
    *   Queries DB -> Returns JSON.
5.  **Client (Browser)**:
    *   Fetches JSON.
    *   Paints Map Polygon Colors (Choropleth) dynamically based on value.

---

## 4. Key Challenges & Solutions (The "STAR" Method)

### **Challenge 1: The "Moving Targets" Problem**
*   **Situation**: India had ~300 districts in 1960 and has ~700+ today. A dataset from 1980 saying "Andhra Pradesh" doesn't match a map from 2020.
*   **Task**: Create a unified view where 1980 data can be shown on a map without holes.
*   **Action**: I implemented a **Harmonization Bridge**. I created a mapping table that links historical district entities to their stable "Parent" IDs.
*   **Result**: The platform successfully visualizes continuous timelines despite boundary changes, a feature missing in most standard government dashboards.

### **Challenge 2: Performance with Large Datasets**
*   **Situation**: Loading 50 years of data for 600 districts * 20 crops = millions of data points.
*   **Action**:
    *   Moved from CSV-based local loading to **PostgreSQL**.
    *   Implemented partial data fetching (API only fetches *current year/crop*).
    *   Used **Vector Tiles** for the map instead of heavy GeoJSONs where possible (or optimized GeoJSONs).
*   **Result**: Map rendering time dropped from 4s to <500ms.

### **Challenge 3: Resilience & UX**
*   **Situation**: The database might be offline during demos or testing.
*   **Action**: I built a **Robust Fallback Pattern**. The API tries the database first; if it fails (connection timeout), it seamlessly falls back to a pre-computed CSV subset (`dataset.csv`).
*   **Result**: Zero downtime during development/demos.

---

## 5. How to Demo It
1.  **Start with the "Why"**: "Agriculture is the backbone of India, but data is fragmented. Let me show you how I fixed that."
2.  **Show the Sidebar**: "Here on the left, we have a GIS-style workspace. It's built with React."
3.  **Interact**:
    *   "I'll search for 'Patna'..." (Show search).
    *   "I'll select 'Wheat Yield'..." (Show map update).
    *   "Now, watch the timeline..." (Drag the slider 1990 -> 2005).
    *   "Notice how the colors shift from light to dark teal? That's the Green Revolution spreading."
4.  **Conclude**: "This system is scalable. I can add Rainfall data or Satelite Imagery next."

---

## 6. Future Roadmap (If asked)
*   **Data Expansion**: Integrate **Land Utilization Data** (Forest Cover, Net Sown Area) which is currently in the raw pipeline but not yet harmonized.
*   **Server Actions**: Move more logic to the server.
*   **Cloud Deployment**: Deploy DB to AWS RDS and App to Vercel.
*   **Machine Learning**: Predict crop yields for 2030 based on historical trends.

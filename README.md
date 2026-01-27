
# I-ASCAP: Indian Agri-Spatial Comparative Analytics Platform

## Overview
I-ASCAP is a research-grade geospatial platform designed to visualize and analyze the evolution of Indian agriculture at the district level from 1966 to 2024. It addresses the challenge of strictly comparing data across changing administrative boundaries through a "Harmonization" and "Apportioning" engine.

## Architecture
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Mapbox GL JS.
- **Backend**: Python 3.10+, FastAPI, GeoPandas, Rasterstats.
- **Database**: PostgreSQL 15 + PostGIS (via Docker).
- **Data Engineering**: Custom `DistrictHarmonizer` class to handle topological splits.

## Project Structure
```
.
├── backend/                # Python FastAPI Backend
│   ├── app/
│   │   ├── core/           # Core logic (Harmonizer, Climate)
│   │   └── main.py         # API Entry point
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/app/            # App Router pages and components
│   └── Dockerfile
├── data/                   # Data storage (CSVs, GeoJSONs)
├── docker-compose.yml      # Deployment configuration
└── requirements.txt        # Python dependencies
```

## Setup & Running

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Python 3.10+ (for local dev)

### Quick Start (Docker)
Run the entire stack (DB, Backend, Frontend) with one command:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development

#### Backend
1. Navigate to `backend/`
2. Create venv: `python -m venv venv && source venv/bin/activate`
3. Install deps: `pip install -r requirements.txt`
4. Run: `uvicorn app.main:app --reload`

#### Frontend
1. Navigate to `frontend/`
2. Install deps: `npm install`
3. Run: `npm run dev`

## Key Features
- **Dynamic Time Slider**: Toggle between 1966 and 2024.
- **Harmonization Engine**: Automatically apportions historical data to modern district boundaries.
- **Lineage Tracking**: View the ancestry of split districts (e.g., Adilabad -> Nirmal).

## Configuration
- **Mapbox Token**: Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `frontend/.env.local`.
- **Database**: Configure `DATABASE_URL` in `docker-compose.yml`.

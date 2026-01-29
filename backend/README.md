# District Evolution Analytics Backend

Research-grade spatio-temporal analytics API for longitudinal analysis across Indian district boundary evolution.

## Quick Start

```bash
# From project root
docker compose up --build
```

API available at http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

| Endpoint | Description |
|:---|:---|
| `GET /api/v1/districts` | List districts with filtering |
| `GET /api/v1/lineage/splits?state=X` | Get split events for state |
| `GET /api/v1/metrics?year=Y&crop=C&metric=M` | Choropleth data |
| `GET /api/v1/analysis/split-impact/summary` | State summaries |
| `GET /api/v1/analysis/split-impact/analysis` | Impact analysis |

## Architecture

```
app/
├── api/v1/        # FastAPI routes (no business logic)
├── services/      # Business orchestration
├── analytics/     # Pure math (CAGR, CV, harmonization)
├── repositories/  # Data access
└── schemas/       # Pydantic models
```

## Key Features

- **Lineage-First**: Districts as temporal graph nodes
- **Uncertainty Propagation**: Bootstrap confidence intervals
- **Reproducibility**: Every response includes provenance metadata
- **Domain-Agnostic**: Supports agriculture, climate, health, socioeconomic

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

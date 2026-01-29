"""
Research-Grade Spatio-Temporal Analytics API
FastAPI Application Entry Point
"""
import hashlib
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import init_db_pool, close_db_pool

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle: startup and shutdown."""
    # Startup
    await init_db_pool()
    yield
    # Shutdown
    await close_db_pool()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    **Research-Grade Spatio-Temporal Analytics API**
    
    A truth-preserving infrastructure for longitudinal analysis across 
    Indian district boundary evolution (1951-2024).
    
    ## Key Features
    - **Lineage-First Design**: Districts as temporal graph nodes
    - **Uncertainty Propagation**: All analytics include confidence intervals
    - **Reproducibility Metadata**: Every response includes provenance
    - **Domain-Agnostic**: Agriculture, climate, health, socioeconomic
    
    ## Non-Negotiables
    - No naïve time-series comparisons
    - No silent data imputation
    - All derived values annotated with method
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Utility: Query Hash Generator
# -----------------------------------------------------------------------------
def generate_query_hash(request: Request) -> str:
    """Generate SHA-256 hash of normalized query parameters."""
    query_string = str(sorted(request.query_params.items()))
    return f"sha256:{hashlib.sha256(query_string.encode()).hexdigest()[:16]}"


# -----------------------------------------------------------------------------
# Health Check
# -----------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for container orchestration."""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/", tags=["System"])
async def root():
    """API root with navigation links."""
    return {
        "message": "District Evolution Analytics API",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


# -----------------------------------------------------------------------------
# Import and Include API Routers
# -----------------------------------------------------------------------------
from app.api.v1.router import api_router

app.include_router(api_router, prefix="/api/v1")


# -----------------------------------------------------------------------------
# Global Exception Handler
# -----------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler with provenance."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred",
            "provenance": {
                "query_hash": generate_query_hash(request),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

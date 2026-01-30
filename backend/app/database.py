"""
Async Database Connection Pool using asyncpg.
"""
import asyncpg
import ssl
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from app.config import get_settings

settings = get_settings()

# Global pool reference
_pool: Optional[asyncpg.Pool] = None


async def init_db_pool() -> asyncpg.Pool:
    """Initialize the database connection pool."""
    global _pool
    if _pool is None:
        # Use DATABASE_URL from environment if available
        dsn = os.environ.get("DATABASE_URL", settings.database_url)
        
        # Prepare connection kwargs
        pool_kwargs = {
            "dsn": dsn,
            "min_size": settings.db_pool_min_size,
            "max_size": settings.db_pool_max_size,
            "command_timeout": settings.db_command_timeout,
        }
        
        # Add SSL for Neon/cloud databases
        if "neon.tech" in dsn or "sslmode=require" in dsn:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            pool_kwargs["ssl"] = ssl_context
        
        _pool = await asyncpg.create_pool(**pool_kwargs)
    return _pool


async def close_db_pool() -> None:
    """Close the database connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_pool() -> asyncpg.Pool:
    """Get the current connection pool."""
    if _pool is None:
        return await init_db_pool()
    return _pool


@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Async context manager for database connections.
    Usage:
        async with get_connection() as conn:
            result = await conn.fetch("SELECT * FROM districts")
    """
    pool = await get_pool()
    async with pool.acquire() as connection:
        yield connection


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Dependency injection for FastAPI routes.
    Usage:
        @app.get("/")
        async def endpoint(db = Depends(get_db)):
            ...
    """
    async with get_connection() as conn:
        yield conn

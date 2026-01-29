"""
Async Database Connection Pool using asyncpg.
"""
import asyncpg
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
        _pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=settings.db_pool_min_size,
            max_size=settings.db_pool_max_size,
            command_timeout=settings.db_command_timeout,
        )
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

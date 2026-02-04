"""
Pytest fixtures and configuration for I-ASCAP tests.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from unittest.mock import MagicMock, patch






from app.config import get_settings
from app.database import init_db_pool, close_db_pool, get_pool

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def db_pool():
    """
    Real database connection pool for integration tests.
    Uses the DATABASE_URL environment variable (set in CI/docker).
    """
    pool = await init_db_pool()
    yield pool
    await close_db_pool()

@pytest.fixture
def mock_db_pool():
    """Mock database pool for unit tests without DB."""
    mock_pool = MagicMock()
    mock_connection = MagicMock()
    mock_pool.acquire.return_value.__aenter__.return_value = mock_connection
    mock_pool.acquire.return_value.__aexit__.return_value = None
    return mock_pool

@pytest.fixture
async def client(db_pool) -> AsyncGenerator[AsyncClient, None]:
    """
    AsyncAPI client with REAL database connection.
    Use this for integration tests.
    """
    from app.main import app
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c

@pytest.fixture
async def mock_client() -> AsyncGenerator[AsyncClient, None]:
    """
    AsyncAPI client with MOCKED database.
    Use this for unit tests.
    """
    from app.main import app
    with patch('app.database.init_db_pool'), patch('app.database.close_db_pool'):
        async with AsyncClient(app=app, base_url="http://test") as c:
            yield c


# Sample test data
@pytest.fixture
def sample_district_data():
    """Sample district data for testing."""
    return {
        "cdk": "UP_agra_1971",
        "name": "Agra",
        "state": "Uttar Pradesh",
        "valid_from": 1971,
        "valid_to": None,
    }


@pytest.fixture
def sample_metrics_data():
    """Sample agricultural metrics data for testing."""
    return [
        {"year": 2010, "cdk": "UP_agra_1971", "crop": "wheat", "area": 100000, "production": 250000, "yield": 2500},
        {"year": 2011, "cdk": "UP_agra_1971", "crop": "wheat", "area": 105000, "production": 270000, "yield": 2571},
        {"year": 2012, "cdk": "UP_agra_1971", "crop": "wheat", "area": 110000, "production": 295000, "yield": 2682},
    ]


@pytest.fixture
def sample_split_event():
    """Sample split event data for testing."""
    return {
        "id": "CG_bilasp_1991_2001",
        "parent_cdk": "CG_bilasp_1991",
        "parent_name": "Bilaspur",
        "split_year": 2001,
        "children_cdks": ["CG_janjgi_2001", "CG_korba_2001"],
        "children_names": ["Janjgir-Champa", "Korba"],
        "children_count": 2,
    }

"""
Pytest fixtures and configuration for I-ASCAP tests.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from unittest.mock import MagicMock, patch


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db_pool():
    """Mock database pool for testing without real database."""
    mock_pool = MagicMock()
    mock_connection = MagicMock()
    mock_pool.acquire.return_value.__aenter__.return_value = mock_connection
    mock_pool.acquire.return_value.__aexit__.return_value = None
    return mock_pool


@pytest.fixture
async def test_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for API testing."""
    from app.main import app
    
    # Mock the database pool initialization
    with patch('app.database.init_db_pool'):
        with patch('app.database.close_db_pool'):
            async with AsyncClient(app=app, base_url="http://test") as client:
                yield client


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

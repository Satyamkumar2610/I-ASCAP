"""Pytest configuration and fixtures."""
import pytest
import asyncio
from typing import Generator


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_values():
    """Sample data for statistics tests."""
    return [100, 120, 110, 130, 125, 140, 135]


@pytest.fixture
def pre_post_values():
    """Pre/post split sample data."""
    return {
        "pre": [100, 110, 105, 115, 120],
        "post": [130, 135, 140, 145, 150],
    }

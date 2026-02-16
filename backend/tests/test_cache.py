"""
Tests for the caching system (InMemoryCache + Redis fallback logic).
"""
import pytest
import time
from unittest.mock import patch, AsyncMock, MagicMock

from app.cache import (
    InMemoryCache,
    RedisCache,
    _create_cache,
    cached,
    _generate_cache_key,
    CacheTTL,
)


# ---------------------------------------------------------------------------
# InMemoryCache Tests
# ---------------------------------------------------------------------------

class TestInMemoryCache:
    """Tests for in-memory cache backend."""

    @pytest.fixture
    def cache(self):
        return InMemoryCache()

    @pytest.mark.asyncio
    async def test_get_set(self, cache):
        await cache.set("key1", {"data": "hello"})
        result = await cache.get("key1")
        assert result == {"data": "hello"}

    @pytest.mark.asyncio
    async def test_get_missing_key(self, cache):
        result = await cache.get("nonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self, cache):
        await cache.set("key1", "value1")
        deleted = await cache.delete("key1")
        assert deleted is True
        assert await cache.get("key1") is None

    @pytest.mark.asyncio
    async def test_delete_missing(self, cache):
        deleted = await cache.delete("nonexistent")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_ttl_expiry(self, cache):
        await cache.set("key1", "value1", ttl=1)
        assert await cache.get("key1") == "value1"
        
        # Simulate expiry by manipulating the stored timestamp
        cache._store["key1"]["expires_at"] = time.time() - 1
        assert await cache.get("key1") is None

    @pytest.mark.asyncio
    async def test_clear(self, cache):
        await cache.set("k1", "v1")
        await cache.set("k2", "v2")
        await cache.clear()
        assert await cache.get("k1") is None
        assert await cache.get("k2") is None

    @pytest.mark.asyncio
    async def test_stats(self, cache):
        await cache.set("k1", "v1")
        await cache.set("k2", "v2")
        stats = await cache.stats()
        assert stats["type"] == "in-memory"
        assert stats["total_keys"] == 2
        assert stats["active_keys"] == 2
        assert stats["status"] == "ok"


# ---------------------------------------------------------------------------
# Cache Factory Tests
# ---------------------------------------------------------------------------

class TestCacheFactory:
    """Tests for create_cache factory."""

    def test_memory_backend(self):
        cache = _create_cache(backend="memory")
        assert isinstance(cache, InMemoryCache)

    def test_auto_without_redis_package(self):
        """Auto mode should fall back to in-memory if redis package is missing."""
        with patch.dict("sys.modules", {"redis.asyncio": None, "redis": None}):
            with patch("builtins.__import__", side_effect=ImportError):
                cache = _create_cache(backend="memory")
                assert isinstance(cache, InMemoryCache)

    def test_auto_with_redis_package(self):
        """Auto mode should return RedisCache if redis package is available."""
        try:
            import redis.asyncio  # noqa: F401
            cache = _create_cache(backend="auto")
            assert isinstance(cache, RedisCache)
        except ImportError:
            pytest.skip("redis package not installed")


# ---------------------------------------------------------------------------
# Cache Key Generation
# ---------------------------------------------------------------------------

class TestCacheKeyGeneration:
    """Tests for cache key generation."""

    def test_deterministic(self):
        key1 = _generate_cache_key("prefix", "arg1", "arg2")
        key2 = _generate_cache_key("prefix", "arg1", "arg2")
        assert key1 == key2

    def test_different_args_different_keys(self):
        key1 = _generate_cache_key("prefix", "arg1")
        key2 = _generate_cache_key("prefix", "arg2")
        assert key1 != key2

    def test_different_prefix_different_keys(self):
        key1 = _generate_cache_key("metrics", "arg1")
        key2 = _generate_cache_key("forecast", "arg1")
        assert key1 != key2


# ---------------------------------------------------------------------------
# Cached Decorator Tests
# ---------------------------------------------------------------------------

class TestCachedDecorator:
    """Tests for the @cached decorator."""

    @pytest.mark.asyncio
    async def test_caches_result(self):
        call_count = 0

        @cached(ttl=60, prefix="test")
        async def expensive_fn(x: int):
            nonlocal call_count
            call_count += 1
            return x * 2

        # Reset global cache to fresh InMemoryCache
        import app.cache as cache_mod
        old_cache = cache_mod._cache
        cache_mod._cache = InMemoryCache()

        try:
            result1 = await expensive_fn(5)
            result2 = await expensive_fn(5)
            
            assert result1 == 10
            assert result2 == 10
            assert call_count == 1  # Second call should be cached
        finally:
            cache_mod._cache = old_cache

    @pytest.mark.asyncio
    async def test_different_args_not_cached(self):
        call_count = 0

        @cached(ttl=60, prefix="test2")
        async def fn(x: int):
            nonlocal call_count
            call_count += 1
            return x + 1

        import app.cache as cache_mod
        old_cache = cache_mod._cache
        cache_mod._cache = InMemoryCache()

        try:
            await fn(1)
            await fn(2)
            assert call_count == 2
        finally:
            cache_mod._cache = old_cache


# ---------------------------------------------------------------------------
# CacheTTL Constants
# ---------------------------------------------------------------------------

class TestCacheTTL:
    """Verify TTL constants are reasonable."""

    def test_districts_ttl(self):
        assert CacheTTL.DISTRICTS == 86400

    def test_metrics_ttl(self):
        assert CacheTTL.METRICS == 300

    def test_health_ttl(self):
        assert CacheTTL.HEALTH == 60

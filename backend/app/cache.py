"""
In-memory caching system for I-ASCAP API.
Uses TTL-based cache for frequently accessed data.
"""

import time
import hashlib
import json
from typing import Any, Optional, Dict, Callable
from functools import wraps
from collections import OrderedDict
import asyncio

from app.logging_config import get_logger

logger = get_logger("cache")


class TTLCache:
    """
    Thread-safe TTL cache with LRU eviction.
    Optimized for Render's single-instance deployment.
    """
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from function arguments."""
        key_data = f"{prefix}:{json.dumps(args, sort_keys=True, default=str)}:{json.dumps(kwargs, sort_keys=True, default=str)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache if it exists and hasn't expired."""
        async with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None
            
            entry = self._cache[key]
            if time.time() > entry["expires_at"]:
                del self._cache[key]
                self._misses += 1
                return None
            
            # Move to end (LRU)
            self._cache.move_to_end(key)
            self._hits += 1
            return entry["value"]
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in cache with optional TTL."""
        async with self._lock:
            # Evict oldest if at capacity
            while len(self._cache) >= self._max_size:
                self._cache.popitem(last=False)
            
            self._cache[key] = {
                "value": value,
                "expires_at": time.time() + (ttl or self._default_ttl),
                "created_at": time.time(),
            }
    
    async def delete(self, key: str) -> bool:
        """Delete a specific key from cache."""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    async def clear(self) -> int:
        """Clear all cache entries. Returns count of cleared entries."""
        async with self._lock:
            count = len(self._cache)
            self._cache.clear()
            return count
    
    async def invalidate_prefix(self, prefix: str) -> int:
        """Invalidate all keys matching a prefix."""
        async with self._lock:
            keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
            for key in keys_to_delete:
                del self._cache[key]
            return len(keys_to_delete)
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self._hits + self._misses
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / total * 100, 2) if total > 0 else 0,
            "default_ttl": self._default_ttl,
        }


# Global cache instance
_cache = TTLCache(max_size=500, default_ttl=3600)  # 1 hour default


def get_cache() -> TTLCache:
    """Get the global cache instance."""
    return _cache


def cached(ttl: int = 3600, prefix: str = ""):
    """
    Decorator to cache async function results.
    
    Usage:
        @cached(ttl=300, prefix="metrics")
        async def get_metrics(year: int, crop: str):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = get_cache()
            
            # Generate cache key
            key_prefix = prefix or func.__name__
            cache_key = cache._generate_key(key_prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit for {key_prefix}")
                return cached_value
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            logger.debug(f"Cached result for {key_prefix}")
            
            return result
        return wrapper
    return decorator


# Pre-defined cache TTLs for different data types
class CacheTTL:
    """Standard cache TTL values in seconds."""
    
    # Static/rarely changing data
    DISTRICTS = 86400  # 24 hours
    STATES = 86400  # 24 hours
    LINEAGE = 86400  # 24 hours
    
    # Analytics results
    SUMMARY = 3600  # 1 hour
    SPLIT_EVENTS = 3600  # 1 hour
    ANALYSIS = 1800  # 30 minutes
    
    # Time-sensitive data
    METRICS = 300  # 5 minutes
    HEALTH = 60  # 1 minute

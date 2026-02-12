"""
In-memory caching system for I-ASCAP API.
Uses TTL-based cache for frequently accessed data.
Now properly async to match the interface of the previous Redis cache.
"""

import hashlib
import json
import time
from typing import Any, Optional, Dict, Callable
from functools import wraps

from app.logging_config import get_logger

logger = get_logger("cache")

class InMemoryCache:
    """
    Simple in-memory cache replacing Redis.
    Check for expiration on retrieval.
    """
    
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = 3600
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from function arguments."""
        try:
            key_data = f"{prefix}:{json.dumps(args, sort_keys=True, default=str)}:{json.dumps(kwargs, sort_keys=True, default=str)}"
        except Exception:
            # Fallback for non-serializable args
            key_data = f"{prefix}:{str(args)}:{str(kwargs)}"
            
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache."""
        if key not in self._store:
            return None
            
        item = self._store[key]
        if item["expires_at"] < time.time():
            del self._store[key]
            return None
            
        return item["value"]
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in cache."""
        expires_at = time.time() + (ttl or self._default_ttl)
        self._store[key] = {
            "value": value,
            "expires_at": expires_at
        }
    
    async def delete(self, key: str) -> bool:
        """Delete a key."""
        if key in self._store:
            del self._store[key]
            return True
        return False

    async def clear(self) -> None:
        """Clear the database (use with caution)."""
        self._store.clear()
    
    async def stats(self) -> Dict[str, Any]:
        """Get Cache stats."""
        return {
            "type": "in-memory",
            "keys": len(self._store),
            "status": "ok"
        }

_cache = InMemoryCache()

def get_cache() -> InMemoryCache:
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
            try:
                cached_value = await cache.get(cache_key)
                if cached_value is not None:
                    logger.debug(f"Cache hit for {key_prefix}")
                    return cached_value
            except Exception as e:
                logger.warning(f"Cache get failed: {e}")
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            try:
                await cache.set(cache_key, result, ttl)
                logger.debug(f"Cached result for {key_prefix}")
            except Exception as e:
                logger.warning(f"Cache set failed: {e}")
            
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

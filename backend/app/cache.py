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



import json
import hashlib
from typing import Any, Optional, Dict, Callable
from functools import wraps
import redis.asyncio as redis

from app.config import get_settings
from app.logging_config import get_logger

logger = get_logger("cache")
settings = get_settings()

class RedisCache:
    """
    Redis-based caching system using redis-py (asyncio).
    """
    
    def __init__(self):
        self._redis = redis.from_url(
            settings.redis_url, 
            encoding="utf-8", 
            decode_responses=True
        )
        self._default_ttl = 3600
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from function arguments."""
        key_data = f"{prefix}:{json.dumps(args, sort_keys=True, default=str)}:{json.dumps(kwargs, sort_keys=True, default=str)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache."""
        try:
            val = await self._redis.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.warning(f"Redis get failed: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in cache."""
        try:
            await self._redis.set(
                key, 
                json.dumps(value, default=str), 
                ex=ttl or self._default_ttl
            )
        except Exception as e:
             logger.warning(f"Redis set failed: {e}")
    
    async def delete(self, key: str) -> bool:
        """Delete a key."""
        try:
            return await self._redis.delete(key) > 0
        except Exception as e:
            logger.warning(f"Redis delete failed: {e}")
            return False

    async def clear(self) -> None:
        """Clear the database (use with caution)."""
        await self._redis.flushdb()
    
    async def stats(self) -> Dict[str, Any]:
        """Get Redis info."""
        try:
            info = await self._redis.info()
            return {
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
            }
        except Exception:
            return {"status": "error"}

_cache = RedisCache()

def get_cache() -> RedisCache:
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

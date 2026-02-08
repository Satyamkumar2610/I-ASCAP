import asyncio
from app.cache import get_cache

async def clear():
    print("Clearing Redis Cache...")
    cache = get_cache()
    await cache.clear()
    print("Cache Cleared.")

if __name__ == "__main__":
    asyncio.run(clear())

import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheClient:
    def __init__(self):
        self._redis: Optional[aioredis.Redis] = None
        self._memory_fallback: dict[str, Any] = {}

    async def connect(self):
        try:
            self._redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=1.5
            )
            await self._redis.ping()
            logger.info("Successfully connected to Redis at %s", settings.REDIS_URL)
        except Exception as e:
            logger.warning("Redis unavailable (%s). Falling back to in-memory cache.", e)
            self._redis = None

    async def disconnect(self):
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[Any]:
        if self._redis:
            try:
                val = await self._redis.get(key)
                return json.loads(val) if val else None
            except Exception:
                pass
        return self._memory_fallback.get(key)

    async def set(self, key: str, value: Any, expire_seconds: int = 60) -> bool:
        serialized = json.dumps(value, default=str)
        if self._redis:
            try:
                await self._redis.set(key, serialized, ex=expire_seconds)
                return True
            except Exception:
                pass
        self._memory_fallback[key] = value
        return True

    async def delete(self, key: str) -> bool:
        if self._redis:
            try:
                await self._redis.delete(key)
            except Exception:
                pass
        self._memory_fallback.pop(key, None)
        return True


cache = CacheClient()

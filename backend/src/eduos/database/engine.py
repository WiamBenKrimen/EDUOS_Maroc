from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg

from eduos.core.config import get_settings


@asynccontextmanager
async def lifespan_pool() -> AsyncIterator[asyncpg.Pool]:
    settings = get_settings()
    pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=settings.database_pool_min_size,
        max_size=settings.database_pool_max_size,
        command_timeout=settings.database_command_timeout_seconds,
    )
    try:
        yield pool
    finally:
        await pool.close()

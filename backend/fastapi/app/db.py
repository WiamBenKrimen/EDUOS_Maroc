from contextlib import asynccontextmanager
from typing import AsyncIterator

import asyncpg

from app.core.config import get_settings


@asynccontextmanager
async def lifespan_pool() -> AsyncIterator[asyncpg.Pool]:
    pool = await asyncpg.create_pool(get_settings().database_url, min_size=1, max_size=10)
    try:
        yield pool
    finally:
        await pool.close()

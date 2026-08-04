from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg


@asynccontextmanager
async def connection(
    pool: asyncpg.Pool,
) -> AsyncIterator[asyncpg.Connection]:
    async with pool.acquire() as acquired:
        yield acquired


@asynccontextmanager
async def transaction(
    pool: asyncpg.Pool,
) -> AsyncIterator[asyncpg.Connection]:
    async with connection(pool) as acquired:
        async with acquired.transaction():
            yield acquired

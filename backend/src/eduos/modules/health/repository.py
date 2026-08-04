import asyncpg


async def ping(pool: asyncpg.Pool) -> None:
    async with pool.acquire() as connection:
        await connection.fetchval("SELECT 1")

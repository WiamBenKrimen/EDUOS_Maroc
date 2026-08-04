import asyncio
from pathlib import Path

import asyncpg

from eduos.core.config import get_settings

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = BACKEND_ROOT / "database" / "seed.sql"


async def main() -> None:
    connection = await asyncpg.connect(get_settings().database_url)
    try:
        await connection.execute(SEED_PATH.read_text(encoding="utf-8-sig"))
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())

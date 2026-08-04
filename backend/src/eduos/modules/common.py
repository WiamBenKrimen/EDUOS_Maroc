from collections.abc import Iterable

import asyncpg


def rows(items: Iterable[asyncpg.Record]) -> list[dict]:
    return [dict(item) for item in items]

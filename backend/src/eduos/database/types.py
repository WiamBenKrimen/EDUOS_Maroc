from typing import TypeAlias

import asyncpg

DatabasePool: TypeAlias = asyncpg.Pool
DatabaseConnection: TypeAlias = asyncpg.Connection

from uuid import UUID

import asyncpg


async def find_active_by_id(
    pool: asyncpg.Pool, user_id: UUID
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT id, centre_id, role, personnel_fonction, nom, prenom, email
          FROM users
         WHERE id=$1 AND statut='actif'
        """,
        user_id,
    )


async def find_by_credentials(
    pool: asyncpg.Pool, email: str, password: str
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """SELECT id, centre_id, role, personnel_fonction, nom, prenom, email
             FROM users
            WHERE email = $1::citext
              AND password_hash = crypt($2, password_hash)
              AND statut = 'actif'
            LIMIT 1""",
        email,
        password,
    )


async def record_login(pool: asyncpg.Pool, user_id: UUID) -> None:
    await pool.execute(
        "UPDATE users SET last_login_at = now() WHERE id = $1",
        user_id,
    )

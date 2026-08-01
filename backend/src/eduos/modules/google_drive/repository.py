from uuid import UUID

import asyncpg


async def get_connection(
    pool: asyncpg.Pool,
    centre_id: UUID,
    encryption_key: str,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT centre_id,folder_id,account_email,connected_by,
               connected_at,updated_at,
               pgp_sym_decrypt(refresh_token,$2) AS refresh_token
          FROM google_drive_connections
         WHERE centre_id=$1
        """,
        centre_id,
        encryption_key,
    )


async def upsert_connection(
    pool: asyncpg.Pool,
    centre_id: UUID,
    user_id: UUID,
    refresh_token: str,
    folder_id: str,
    account_email: str | None,
    encryption_key: str,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO google_drive_connections(
          centre_id,refresh_token,folder_id,account_email,connected_by
        ) VALUES(
          $1,pgp_sym_encrypt($3,$6,'cipher-algo=aes256'),$4,$5,$2
        )
        ON CONFLICT(centre_id) DO UPDATE
          SET refresh_token=excluded.refresh_token,
              folder_id=excluded.folder_id,
              account_email=excluded.account_email,
              connected_by=excluded.connected_by,
              connected_at=now(),updated_at=now()
        RETURNING centre_id,folder_id,account_email,connected_at,updated_at
        """,
        centre_id,
        user_id,
        refresh_token,
        folder_id,
        account_email,
        encryption_key,
    )


async def delete_connection(pool: asyncpg.Pool, centre_id: UUID) -> bool:
    result = await pool.execute(
        "DELETE FROM google_drive_connections WHERE centre_id=$1",
        centre_id,
    )
    return result.endswith("1")


async def get_teaching_user(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT id,centre_id,personnel_fonction
          FROM users
         WHERE id=$1 AND centre_id=$2 AND role='personnel'
           AND personnel_fonction IN ('formateur','enseignant')
           AND statut='actif'
        """,
        user_id,
        centre_id,
    )

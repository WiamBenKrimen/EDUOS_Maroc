from uuid import UUID

import asyncpg

from eduos.modules.prospects.schemas import ProspectInput, ProspectStatusInput


async def list_all(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        "SELECT * FROM prospects WHERE centre_id=$1 ORDER BY created_at DESC",
        centre_id,
    )


async def create(
    pool: asyncpg.Pool, centre_id: UUID, payload: ProspectInput
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO prospects(
          centre_id,nom_complet,email,telephone,formation_souhaitee,source,notes
        )
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        """,
        centre_id,
        payload.nom_complet,
        str(payload.email).lower() if payload.email else None,
        payload.telephone,
        payload.formation_souhaitee,
        payload.source,
        payload.notes,
    )


async def update_status(
    pool: asyncpg.Pool,
    centre_id: UUID,
    prospect_id: UUID,
    payload: ProspectStatusInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE prospects
           SET statut=$1,
               contacted_at=CASE
                 WHEN $1='en_cours' THEN now() ELSE contacted_at END,
               converted_at=CASE
                 WHEN $1='inscrit' THEN now() ELSE converted_at END,
               updated_at=now()
         WHERE id=$2 AND centre_id=$3
         RETURNING *
        """,
        payload.statut,
        prospect_id,
        centre_id,
    )

from uuid import UUID

import asyncpg

from eduos.modules.formations.schemas import FormationInput


async def list_all(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        "SELECT * FROM formations WHERE centre_id=$1 ORDER BY titre",
        centre_id,
    )


async def create(
    pool: asyncpg.Pool,
    centre_id: UUID,
    payload: FormationInput,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO formations(
          centre_id,code,titre,categorie,niveau,duree_heures,
          prix_mensuel,frais_inscription
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        """,
        centre_id,
        payload.code,
        payload.titre,
        payload.categorie,
        payload.niveau,
        payload.duree_heures,
        payload.prix_mensuel,
        payload.frais_inscription,
    )

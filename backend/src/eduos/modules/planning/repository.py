from uuid import UUID

import asyncpg

from eduos.modules.planning.schemas import SeanceInput


async def list_all(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT s.*, c.nom AS cohorte_nom, f.titre AS formation
          FROM seances s
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
         ORDER BY s.starts_at
        """,
        centre_id,
    )


async def create(
    pool: asyncpg.Pool,
    centre_id: UUID,
    payload: SeanceInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO seances(
          cohorte_id,intervenant_id,personnel_id,titre,description,
          starts_at,ends_at,salle
        )
        SELECT $1,$2,$3,$4,$5,$6,$7,$8
         WHERE EXISTS(
           SELECT 1
             FROM cohortes c
             JOIN formations f ON f.id=c.formation_id
            WHERE c.id=$1 AND f.centre_id=$9
         )
        RETURNING *
        """,
        payload.cohorte_id,
        payload.intervenant_id,
        payload.personnel_id,
        payload.titre,
        payload.description,
        payload.starts_at,
        payload.ends_at,
        payload.salle,
        centre_id,
    )


async def update(
    pool: asyncpg.Pool,
    centre_id: UUID,
    seance_id: UUID,
    payload: SeanceInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE seances s
           SET cohorte_id=$3,intervenant_id=$4,personnel_id=$5,
               titre=$6,description=$7,starts_at=$8,ends_at=$9,salle=$10
          FROM cohortes current_c
          JOIN formations current_f ON current_f.id=current_c.formation_id
         WHERE s.id=$1
           AND s.cohorte_id=current_c.id
           AND current_f.centre_id=$2
           AND EXISTS(
             SELECT 1
               FROM cohortes target_c
               JOIN formations target_f ON target_f.id=target_c.formation_id
              WHERE target_c.id=$3 AND target_f.centre_id=$2
           )
        RETURNING s.*
        """,
        seance_id,
        centre_id,
        payload.cohorte_id,
        payload.intervenant_id,
        payload.personnel_id,
        payload.titre,
        payload.description,
        payload.starts_at,
        payload.ends_at,
        payload.salle,
    )


async def delete(
    pool: asyncpg.Pool,
    centre_id: UUID,
    seance_id: UUID,
) -> bool:
    result = await pool.execute(
        """
        DELETE FROM seances s
         USING cohortes c,formations f
         WHERE s.id=$1
           AND s.cohorte_id=c.id
           AND c.formation_id=f.id
           AND f.centre_id=$2
        """,
        seance_id,
        centre_id,
    )
    return result == "DELETE 1"


async def list_change_requests(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT d.id,d.seance_id,d.starts_at_souhaite,d.ends_at_souhaite,
               d.motif,d.statut,d.created_at,s.titre AS session_name,
               s.starts_at AS current_starts_at,s.ends_at AS current_ends_at,
               concat_ws(' ',u.prenom,u.nom) AS personnel_name
          FROM demandes_changement_seance d
          JOIN seances s ON s.id=d.seance_id
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN users u ON u.id=d.personnel_id
         WHERE f.centre_id=$1
         ORDER BY (d.statut='en_attente') DESC,d.created_at DESC
        """,
        centre_id,
    )


async def decide_change_request(
    pool: asyncpg.Pool,
    centre_id: UUID,
    request_id: UUID,
    decided_by: UUID,
    statut: str,
) -> asyncpg.Record | None:
    async with pool.acquire() as connection:
        async with connection.transaction():
            request = await connection.fetchrow(
                """
                UPDATE demandes_changement_seance d
                   SET statut=$4::change_request_status,
                       decided_by=$3,decided_at=now()
                  FROM seances s
                  JOIN cohortes c ON c.id=s.cohorte_id
                  JOIN formations f ON f.id=c.formation_id
                 WHERE d.id=$1 AND d.seance_id=s.id
                   AND f.centre_id=$2 AND d.statut='en_attente'
                RETURNING d.*,s.id AS target_seance_id,
                          d.starts_at_souhaite,d.ends_at_souhaite
                """,
                request_id,
                centre_id,
                decided_by,
                statut,
            )
            if request and statut == "approuvee":
                await connection.execute(
                    """
                    UPDATE seances
                       SET starts_at=$2,ends_at=$3,statut='reportee'
                     WHERE id=$1
                    """,
                    request["target_seance_id"],
                    request["starts_at_souhaite"],
                    request["ends_at_souhaite"],
                )
            return request

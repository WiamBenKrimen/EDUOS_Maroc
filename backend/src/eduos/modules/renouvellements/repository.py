from uuid import UUID

import asyncpg

from eduos.modules.renouvellements.schemas import RenewalUpdateInput


async def list_all(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.id, r.inscription_id, r.date_expiration, r.statut,
               r.remise_proposee, r.contacted_at, r.renewed_at, r.notes,
               concat_ws(' ',u.prenom,u.nom) AS participant,
               u.telephone, f.titre AS formation
          FROM renouvellements r
          JOIN inscriptions i ON i.id=r.inscription_id
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
         ORDER BY r.date_expiration
        """,
        centre_id,
    )


async def update(
    pool: asyncpg.Pool,
    centre_id: UUID,
    renewal_id: UUID,
    payload: RenewalUpdateInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE renouvellements r
           SET statut=$1,
               date_expiration=coalesce($2,r.date_expiration),
               notes=coalesce($3,r.notes),
               contacted_at=CASE
                 WHEN $1='contacte' THEN coalesce(r.contacted_at,now())
                 ELSE r.contacted_at
               END,
               renewed_at=CASE
                 WHEN $1='renouvele' THEN now() ELSE NULL
               END
          FROM inscriptions i
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE r.id=$4
           AND r.inscription_id=i.id
           AND f.centre_id=$5
        RETURNING r.id,r.date_expiration,r.statut,
                  r.contacted_at,r.renewed_at,r.notes
        """,
        payload.statut,
        payload.date_expiration,
        payload.notes,
        renewal_id,
        centre_id,
    )

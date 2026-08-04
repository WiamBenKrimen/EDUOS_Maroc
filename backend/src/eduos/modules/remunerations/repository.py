from datetime import date
from uuid import UUID

import asyncpg


async def list_all(
    pool: asyncpg.Pool,
    centre_id: UUID,
    periode: date | None = None,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.id, r.periode, r.heures, r.taux_horaire,
               r.montant_total, r.statut, r.paid_at,
               concat_ws(' ',u.prenom,u.nom) AS formateur,
               coalesce(iv.specialite, '') AS specialite
          FROM remunerations r
          JOIN intervenants iv ON iv.id=r.intervenant_id
          JOIN users u ON u.id=iv.user_id
         WHERE u.centre_id=$1
           AND ($2::date IS NULL OR r.periode=$2)
         ORDER BY r.periode DESC,u.prenom,u.nom
        """,
        centre_id,
        periode,
    )


async def update_status(
    pool: asyncpg.Pool,
    centre_id: UUID,
    remuneration_id: UUID,
    statut: str,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE remunerations r
           SET statut=$3::remuneration_status,
               paid_at=CASE WHEN $3='payee' THEN now() ELSE NULL END
          FROM intervenants iv
          JOIN users u ON u.id=iv.user_id
         WHERE r.id=$1
           AND r.intervenant_id=iv.id
           AND u.centre_id=$2
        RETURNING r.*
        """,
        remuneration_id,
        centre_id,
        statut,
    )

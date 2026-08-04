from uuid import UUID

import asyncpg

from eduos.modules.paiements.schemas import PaymentInput


async def create(
    pool: asyncpg.Pool,
    centre_id: UUID,
    recorded_by: UUID,
    payload: PaymentInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO paiements(
          facture_id,reference,montant,methode,transaction_ref,paid_at,recorded_by
        )
        SELECT $1,$2,$3,$4,$5,coalesce($6,now()),$7
         WHERE EXISTS(
           SELECT 1
             FROM factures fa
             JOIN inscriptions i ON i.id=fa.inscription_id
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE fa.id=$1 AND f.centre_id=$8
         )
        RETURNING *
        """,
        payload.facture_id,
        payload.reference,
        payload.montant,
        payload.methode,
        payload.transaction_ref,
        payload.paid_at,
        recorded_by,
        centre_id,
    )

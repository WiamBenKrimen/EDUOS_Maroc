from uuid import UUID

import asyncpg


async def financial_summary(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> tuple[list[asyncpg.Record], list[asyncpg.Record]]:
    invoices = await pool.fetch(
        """
        SELECT fa.*, u.prenom || ' ' || u.nom AS participant
          FROM factures fa
          JOIN inscriptions i ON i.id=fa.inscription_id
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
         ORDER BY fa.date_echeance DESC
        """,
        centre_id,
    )
    payments = await pool.fetch(
        """
        SELECT pa.*
          FROM paiements pa
          JOIN factures fa ON fa.id=pa.facture_id
          JOIN inscriptions i ON i.id=fa.inscription_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
         ORDER BY pa.created_at DESC
        """,
        centre_id,
    )
    return invoices, payments


async def list_invoices(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT fa.id, fa.numero, fa.montant_ttc, fa.date_echeance,
               fa.statut AS facture_statut,
               concat_ws(' ',u.prenom,u.nom) AS participant_nom,
               c.nom AS cohorte_nom,
               coalesce(
                 jsonb_agg(
                   jsonb_build_object(
                     'id',pa.id,'montant',pa.montant,'methode',pa.methode,
                     'statut',pa.statut,'paid_at',pa.paid_at
                   ) ORDER BY pa.created_at
                 ) FILTER (WHERE pa.id IS NOT NULL),
                 '[]'::jsonb
               ) AS paiements
          FROM factures fa
          JOIN inscriptions ins ON ins.id=fa.inscription_id
          JOIN participants p ON p.id=ins.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=ins.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN paiements pa ON pa.facture_id=fa.id
         WHERE f.centre_id=$1
         GROUP BY fa.id,u.prenom,u.nom,c.nom
         ORDER BY fa.date_echeance DESC
        """,
        centre_id,
    )

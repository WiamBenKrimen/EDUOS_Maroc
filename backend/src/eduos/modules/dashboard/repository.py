from uuid import UUID

import asyncpg


async def get_kpis(pool: asyncpg.Pool, centre_id: UUID) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        SELECT
          (SELECT count(*)
             FROM inscriptions i
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1 AND i.statut='confirmee') AS active_students,
          (SELECT coalesce(
                    round(100.0*count(*) FILTER (WHERE p.statut='present')
                          / nullif(count(*),0),0),0)
             FROM presences p
             JOIN seances s ON s.id=p.seance_id
             JOIN cohortes c ON c.id=s.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1) AS attendance_rate,
          (SELECT coalesce(sum(p.montant),0)
             FROM paiements p
             JOIN factures fa ON fa.id=p.facture_id
             JOIN inscriptions i ON i.id=fa.inscription_id
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1 AND p.statut='paye') AS collected_revenue,
          (SELECT count(*)
             FROM factures fa
             JOIN inscriptions i ON i.id=fa.inscription_id
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND fa.statut IN ('en_retard','en_attente')) AS invoices_to_follow
        """,
        centre_id,
    )


async def get_upcoming_sessions(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT s.id, s.titre, s.starts_at, s.ends_at, s.salle,
               c.nom AS cohorte, u.prenom || ' ' || u.nom AS intervenant
          FROM seances s
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants i ON i.id=s.intervenant_id
          LEFT JOIN users u ON u.id=i.user_id
         WHERE f.centre_id=$1
           AND s.starts_at >= now()
           AND s.statut='planifiee'
         ORDER BY s.starts_at
         LIMIT 8
        """,
        centre_id,
    )

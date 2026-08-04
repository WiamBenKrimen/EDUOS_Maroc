from uuid import UUID

import asyncpg


async def list_all(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.*, u.prenom || ' ' || u.nom AS participant,
               c.nom AS cohorte, f.titre AS formation
          FROM rapports_suivi r
          JOIN inscriptions i ON i.id=r.inscription_id
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
         ORDER BY r.periode DESC
        """,
        centre_id,
    )

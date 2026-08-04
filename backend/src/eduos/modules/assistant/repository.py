import json
from typing import Any
from uuid import UUID

import asyncpg


async def list_people_catalog(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    """Return searchable people while keeping every row scoped to one centre."""
    return await pool.fetch(
        """
        SELECT 'participant'::text AS type,
               p.id,
               u.id AS user_id,
               NULL::uuid AS intervenant_id,
               concat_ws(' ',u.prenom,u.nom) AS nom_complet,
               u.email::text AS email,
               u.telephone,
               p.matricule AS reference,
               NULL::text AS fonction,
               u.avatar_url,
               u.statut::text AS statut
          FROM participants p
          JOIN users u ON u.id=p.user_id
         WHERE u.centre_id=$1
        UNION ALL
        SELECT 'personnel'::text AS type,
               u.id,
               u.id AS user_id,
               iv.id AS intervenant_id,
               concat_ws(' ',u.prenom,u.nom) AS nom_complet,
               u.email::text AS email,
               u.telephone,
               coalesce(iv.code,u.id::text) AS reference,
               u.personnel_fonction::text AS fonction,
               u.avatar_url,
               u.statut::text AS statut
          FROM users u
          LEFT JOIN intervenants iv ON iv.user_id=u.id
         WHERE u.centre_id=$1 AND u.role='personnel'
        UNION ALL
        SELECT 'prospect'::text AS type,
               p.id,
               NULL::uuid AS user_id,
               NULL::uuid AS intervenant_id,
               p.nom_complet,
               p.email::text AS email,
               p.telephone,
               p.id::text AS reference,
               NULL::text AS fonction,
               NULL::text AS avatar_url,
               p.statut::text AS statut
          FROM prospects p
         WHERE p.centre_id=$1
         ORDER BY nom_complet
        """,
        centre_id,
    )


async def create_pending_action(
    pool: asyncpg.Pool,
    centre_id: UUID,
    director_id: UUID,
    action: str,
    payload: dict[str, Any],
    summary: dict[str, Any],
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO assistant_actions(
          centre_id,director_id,action,payload,summary,expires_at
        )
        VALUES($1,$2,$3,$4::jsonb,$5::jsonb,now()+interval '15 minutes')
        RETURNING id,action,summary,expires_at
        """,
        centre_id,
        director_id,
        action,
        json.dumps(payload, ensure_ascii=False),
        json.dumps(summary, ensure_ascii=False),
    )


async def claim_pending_action(
    pool: asyncpg.Pool,
    action_id: UUID,
    centre_id: UUID,
    director_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE assistant_actions
           SET statut='executing',confirmed_at=now()
         WHERE id=$1 AND centre_id=$2 AND director_id=$3
           AND statut='pending' AND expires_at>now()
        RETURNING *
        """,
        action_id,
        centre_id,
        director_id,
    )


async def complete_action(
    pool: asyncpg.Pool,
    action_id: UUID,
    result: dict[str, Any],
) -> None:
    await pool.execute(
        """
        UPDATE assistant_actions
           SET statut='completed',result=$2::jsonb,completed_at=now()
         WHERE id=$1
        """,
        action_id,
        json.dumps(result, ensure_ascii=False),
    )


async def fail_action(pool: asyncpg.Pool, action_id: UUID, error: str) -> None:
    await pool.execute(
        """
        UPDATE assistant_actions
           SET statut='failed',error=$2,completed_at=now()
         WHERE id=$1
        """,
        action_id,
        error[:500],
    )


async def cancel_action(
    pool: asyncpg.Pool,
    action_id: UUID,
    centre_id: UUID,
    director_id: UUID,
) -> bool:
    result = await pool.execute(
        """
        UPDATE assistant_actions
           SET statut='cancelled',completed_at=now()
         WHERE id=$1 AND centre_id=$2 AND director_id=$3
           AND statut='pending'
        """,
        action_id,
        centre_id,
        director_id,
    )
    return result == "UPDATE 1"

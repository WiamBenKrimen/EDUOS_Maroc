from uuid import UUID

import asyncpg

from eduos.modules.users.schemas import PersonnelInput


async def list_all(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
               u.personnel_fonction, u.statut, u.created_at,
               iv.id AS intervenant_id,iv.specialite,iv.taux_horaire,iv.note,
               count(DISTINCT c.id)::int AS groupes_actifs
          FROM users u
          LEFT JOIN intervenants iv ON iv.user_id=u.id
          LEFT JOIN cohortes c
            ON c.intervenant_id=iv.id AND c.statut='actif'
         WHERE u.centre_id=$1 AND u.role='personnel'
         GROUP BY u.id,iv.id,iv.specialite,iv.taux_horaire,iv.note
         ORDER BY u.prenom,u.nom
        """,
        centre_id,
    )


async def create_account(
    connection: asyncpg.Connection,
    centre_id: UUID,
    created_by: UUID,
    payload: PersonnelInput,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        INSERT INTO users (
          centre_id,role,personnel_fonction,nom,prenom,email,telephone,
          password_hash,created_by
        )
        VALUES ($1,'personnel',$2,$3,$4,$5,$6,crypt($7,gen_salt('bf')),$8)
        RETURNING id,nom,prenom,email,telephone,personnel_fonction,statut,created_at
        """,
        centre_id,
        payload.fonction,
        payload.nom,
        payload.prenom,
        str(payload.email).lower(),
        payload.telephone,
        payload.password,
        created_by,
    )


async def create_intervenant(
    connection: asyncpg.Connection,
    account_id: UUID,
    centre_id: UUID,
    payload: PersonnelInput,
) -> None:
    await connection.execute(
        """
        INSERT INTO intervenants(
          user_id,centre_id,fonction,code,specialite,taux_horaire
        )
        VALUES(
          $1,$2,$3,
          'INT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
          $4,$5
        )
        """,
        account_id,
        centre_id,
        payload.fonction,
        payload.specialite or "Général",
        payload.taux_horaire,
    )

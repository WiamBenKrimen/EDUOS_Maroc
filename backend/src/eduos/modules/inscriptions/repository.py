from uuid import UUID

import asyncpg

from eduos.modules.inscriptions.schemas import EnrollmentInput


async def list_options(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT c.id, c.nom, c.capacite, c.date_debut, c.date_fin,
               c.heure_debut, c.heure_fin, f.titre AS formation,
               f.prix_mensuel, u.prenom || ' ' || u.nom AS formateur,
               count(i.id)::int AS inscrits
          FROM cohortes c
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=c.intervenant_id
          LEFT JOIN users u ON u.id=iv.user_id
          LEFT JOIN inscriptions i
            ON i.cohorte_id=c.id AND i.statut='confirmee'
         WHERE f.centre_id=$1 AND c.statut='actif'
         GROUP BY c.id,f.titre,f.prix_mensuel,u.prenom,u.nom
         ORDER BY c.date_debut
        """,
        centre_id,
    )


async def lock_cohort(
    connection: asyncpg.Connection,
    cohort_id: UUID,
    centre_id: UUID,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        SELECT c.id, c.date_debut, c.date_fin, c.capacite, f.prix_mensuel
          FROM cohortes c
          JOIN formations f ON f.id=c.formation_id
         WHERE c.id=$1
           AND f.centre_id=$2
           AND c.statut='actif'
         FOR UPDATE OF c
        """,
        cohort_id,
        centre_id,
    )


async def count_active(
    connection: asyncpg.Connection, cohort_id: UUID
) -> int:
    return await connection.fetchval(
        """
        SELECT count(*)
          FROM inscriptions
         WHERE cohorte_id=$1 AND statut='confirmee'
        """,
        cohort_id,
    )


async def create_account(
    connection: asyncpg.Connection,
    centre_id: UUID,
    created_by: UUID,
    payload: EnrollmentInput,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        INSERT INTO users(
          centre_id,role,nom,prenom,email,telephone,password_hash,created_by
        )
        VALUES(
          $1,'participant',$2,$3,$4,$5,crypt($6,gen_salt('bf')),$7
        )
        RETURNING id,email,nom,prenom
        """,
        centre_id,
        payload.nom,
        payload.prenom,
        str(payload.email).lower(),
        payload.telephone,
        payload.password,
        created_by,
    )


async def create_participant(
    connection: asyncpg.Connection,
    account_id: UUID,
    payload: EnrollmentInput,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        INSERT INTO participants(
          user_id,matricule,date_naissance,adresse,ville
        )
        VALUES(
          $1,
          'P-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
          $2,$3,$4
        )
        RETURNING id,matricule
        """,
        account_id,
        payload.date_naissance,
        payload.adresse,
        payload.ville,
    )


async def create_enrollment(
    connection: asyncpg.Connection,
    participant_id: UUID,
    cohort: asyncpg.Record,
    created_by: UUID,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        INSERT INTO inscriptions(
          participant_id,cohorte_id,reference,date_debut,date_fin_prevue,
          montant_mensuel,created_by
        )
        VALUES(
          $1,$2,
          'INS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
          $3,$4,$5,$6
        )
        RETURNING id,reference
        """,
        participant_id,
        cohort["id"],
        cohort["date_debut"],
        cohort["date_fin"],
        cohort["prix_mensuel"],
        created_by,
    )


async def create_contract_record(
    connection: asyncpg.Connection,
    centre_id: UUID,
    participant_id: UUID,
    enrollment_id: UUID,
    created_by: UUID,
    participant_name: str,
) -> None:
    await connection.execute(
        """
        INSERT INTO documents(
          centre_id,participant_id,inscription_id,type,nom,storage_key,
          mime_type,genere_automatiquement,uploaded_by
        )
        VALUES(
          $1,$2,$3,'contrat',$4,
          'generated/contracts/' || $3::uuid::text || '.pdf',
          'application/pdf',true,$5
        )
        """,
        centre_id,
        participant_id,
        enrollment_id,
        f"Contrat - {participant_name}",
        created_by,
    )

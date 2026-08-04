from uuid import UUID

import asyncpg

from eduos.modules.centres.schemas import CentreApplicationInput


async def create_application(pool: asyncpg.Pool, payload: CentreApplicationInput) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO candidatures_centres(
          reference, centre_nom, responsable_nom, telephone, email, ville,
          taille_apprenants, besoins, remarques
        )
        VALUES (
          'CAND-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
          $1,$2,$3,$4,$5,$6,$7,$8
        )
        RETURNING id, reference, statut, created_at
        """,
        payload.centre_nom.strip(), payload.responsable_nom.strip(), payload.telephone.strip(),
        str(payload.email).lower() if payload.email else None, payload.ville.strip(),
        payload.taille_apprenants, payload.besoins, payload.remarques,
    )


async def list_applications(pool: asyncpg.Pool) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, reference, centre_nom, responsable_nom, telephone, email, ville,
               taille_apprenants, besoins, remarques, statut, motif_refus, created_at,
               processed_at, centre_created_id, directeur_created_id
          FROM candidatures_centres
         ORDER BY CASE statut WHEN 'en_attente' THEN 0 ELSE 1 END, created_at DESC
        """
    )


async def decide_application(
    pool: asyncpg.Pool, application_id: UUID, admin_id: UUID, statut: str,
    motif_refus: str | None, password: str,
) -> asyncpg.Record | None:
    async with pool.acquire() as connection:
        async with connection.transaction():
            application = await connection.fetchrow(
                "SELECT * FROM candidatures_centres WHERE id=$1 FOR UPDATE", application_id
            )
            if not application or application["statut"] != "en_attente":
                return None

            if statut == "refusee":
                return await connection.fetchrow(
                    """
                    UPDATE candidatures_centres
                       SET statut='refusee', motif_refus=$2, processed_by=$3,
                           processed_at=now()
                     WHERE id=$1
                 RETURNING id, reference, statut, motif_refus, processed_at
                    """,
                    application_id, motif_refus or "Dossier refusé par l'administration.", admin_id,
                )

            if not application["email"]:
                raise ValueError("Une adresse e-mail est requise pour créer le compte directeur.")

            centre = await connection.fetchrow(
                """
                INSERT INTO centres(code, nom, ville, telephone, email)
                VALUES (
                  'CTR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
                  $1,$2,$3,$4
                )
                RETURNING id, code, nom
                """,
                application["centre_nom"], application["ville"], application["telephone"], application["email"],
            )
            name_parts = application["responsable_nom"].strip().split(maxsplit=1)
            prenom = name_parts[0]
            nom = name_parts[1] if len(name_parts) > 1 else name_parts[0]
            director = await connection.fetchrow(
                """
                INSERT INTO users(centre_id, role, nom, prenom, email, telephone, password_hash, created_by)
                VALUES ($1,'directeur',$2,$3,$4,$5,crypt($6,gen_salt('bf')),$7)
                RETURNING id, nom, prenom, email
                """,
                centre["id"], nom, prenom, application["email"], application["telephone"], password, admin_id,
            )
            return await connection.fetchrow(
                """
                UPDATE candidatures_centres
                   SET statut='acceptee', processed_by=$2, processed_at=now(),
                       centre_created_id=$3, directeur_created_id=$4
                 WHERE id=$1
             RETURNING id, reference, statut, processed_at, centre_created_id, directeur_created_id
                """,
                application_id, admin_id, centre["id"], director["id"],
            )

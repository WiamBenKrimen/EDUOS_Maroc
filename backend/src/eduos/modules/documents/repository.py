from uuid import UUID

import asyncpg


async def list_attestations(
    pool: asyncpg.Pool, centre_id: UUID
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT i.id AS id,
               i.id AS inscription_id,
               concat_ws(' ',u.prenom,u.nom) AS nom,
               c.nom AS groupe,
               f.titre AS niveau,
               coalesce(
                 round(avg(a.score * 100 / nullif(e.score_max,0)),0),0
               )::int AS note,
               coalesce(
                 avg(a.score * 100 / nullif(e.score_max,0)),0
               ) >= 60 AS eligible,
               EXISTS(
                 SELECT 1
                   FROM documents d
                  WHERE d.inscription_id=i.id
                    AND d.type IN ('attestation','certificat')
               ) AS generee
          FROM inscriptions i
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN evaluations e ON e.cohorte_id=c.id
          LEFT JOIN evaluation_attempts a
            ON a.evaluation_id=e.id
           AND a.participant_id=p.id
           AND a.submitted_at IS NOT NULL
         WHERE f.centre_id=$1
         GROUP BY i.id,u.prenom,u.nom,c.nom,f.titre
         ORDER BY u.prenom,u.nom
        """,
        centre_id,
    )


async def generate_attestations(
    pool: asyncpg.Pool,
    centre_id: UUID,
    uploaded_by: UUID,
    inscription_ids: list[UUID],
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        INSERT INTO documents(
          centre_id,participant_id,inscription_id,type,nom,storage_key,
          mime_type,visible_participant,genere_automatiquement,uploaded_by
        )
        SELECT $1,i.participant_id,i.id,'attestation',
               'Attestation - ' || concat_ws(' ',u.prenom,u.nom),
               'attestations/' || i.id::text || '/' ||
                 to_char(clock_timestamp(),'YYYYMMDDHH24MISSUS') || '.pdf',
               'application/pdf',true,true,$2
          FROM inscriptions i
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE i.id=ANY($3::uuid[])
           AND f.centre_id=$1
           AND coalesce((
             SELECT avg(a.score * 100 / nullif(e.score_max,0))
               FROM evaluations e
               JOIN evaluation_attempts a
                 ON a.evaluation_id=e.id
                AND a.participant_id=p.id
                AND a.submitted_at IS NOT NULL
              WHERE e.cohorte_id=c.id
           ),0) >= 60
        RETURNING *
        """,
        centre_id,
        uploaded_by,
        inscription_ids,
    )

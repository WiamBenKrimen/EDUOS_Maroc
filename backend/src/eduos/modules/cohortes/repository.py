from uuid import UUID

import asyncpg

from eduos.modules.cohortes.schemas import CohorteInput, CohorteUpdate


async def list_all(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT c.*, f.titre AS formation_titre,
               concat_ws(' ',u.prenom,u.nom) AS formateur,
               count(i.id)::int AS inscrits,
               coalesce(
                 jsonb_agg(
                   DISTINCT jsonb_build_object(
                     'id',student_user.id,
                     'nom',concat_ws(' ',student_user.prenom,student_user.nom)
                   )
                 ) FILTER (WHERE student_user.id IS NOT NULL),
                 '[]'::jsonb
               ) AS participants
          FROM cohortes c
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=c.intervenant_id
          LEFT JOIN users u ON u.id=iv.user_id
          LEFT JOIN inscriptions i
            ON i.cohorte_id=c.id AND i.statut='confirmee'
          LEFT JOIN participants student ON student.id=i.participant_id
          LEFT JOIN users student_user ON student_user.id=student.user_id
         WHERE f.centre_id=$1
         GROUP BY c.id,f.titre,u.prenom,u.nom
         ORDER BY c.date_debut DESC
        """,
        centre_id,
    )


async def create(
    pool: asyncpg.Pool,
    centre_id: UUID,
    payload: CohorteInput,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO cohortes(
          formation_id,intervenant_id,code,nom,date_debut,date_fin,
          capacite,salle,jours_semaine,heure_debut,heure_fin
        )
        SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::time,$11::time
         WHERE EXISTS(
           SELECT 1 FROM formations WHERE id=$1 AND centre_id=$12
         )
        RETURNING *
        """,
        payload.formation_id,
        payload.intervenant_id,
        payload.code,
        payload.nom,
        payload.date_debut,
        payload.date_fin,
        payload.capacite,
        payload.salle,
        payload.jours_semaine,
        payload.heure_debut,
        payload.heure_fin,
        centre_id,
    )


async def update(
    pool: asyncpg.Pool,
    centre_id: UUID,
    cohorte_id: UUID,
    payload: CohorteUpdate,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE cohortes c
           SET nom=$3,capacite=$4,
               intervenant_id=coalesce($5,c.intervenant_id)
          FROM formations f
         WHERE c.id=$1
           AND c.formation_id=f.id
           AND f.centre_id=$2
           AND ($5::uuid IS NULL OR EXISTS(
             SELECT 1 FROM intervenants iv
              WHERE iv.id=$5 AND iv.centre_id=$2
                AND iv.fonction IN ('formateur','enseignant')
           ))
        RETURNING c.*
        """,
        cohorte_id,
        centre_id,
        payload.nom,
        payload.capacite,
        payload.intervenant_id,
    )

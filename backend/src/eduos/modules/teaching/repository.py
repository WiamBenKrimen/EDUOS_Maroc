from datetime import date
from uuid import UUID

import asyncpg

from eduos.modules.teaching.schemas import (
    EvaluationInput,
    ResourceInput,
)


async def dashboard_stats(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        WITH assigned_cohorts AS (
          SELECT c.id
            FROM intervenants iv
            JOIN cohortes c ON c.intervenant_id=iv.id
            JOIN formations f ON f.id=c.formation_id
           WHERE iv.user_id=$1 AND f.centre_id=$2 AND c.statut='actif'
        ), owned_sessions AS (
          SELECT s.*
            FROM seances s
            JOIN cohortes c ON c.id=s.cohorte_id
            JOIN formations f ON f.id=c.formation_id
            LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
           WHERE f.centre_id=$2
             AND (iv.user_id=$1 OR s.personnel_id=$1)
        )
        SELECT
          (SELECT count(*)::int FROM assigned_cohorts) AS formations_actives,
          (SELECT count(DISTINCT i.participant_id)::int
             FROM inscriptions i
            WHERE i.cohorte_id IN (SELECT id FROM assigned_cohorts)
              AND i.statut='confirmee') AS apprenants,
          (SELECT coalesce(round(sum(
                    extract(epoch FROM (ends_at-starts_at))/3600
                  )::numeric,1),0)
             FROM owned_sessions
            WHERE starts_at >= date_trunc('month',now())
              AND starts_at < date_trunc('month',now())+interval '1 month'
              AND statut <> 'annulee') AS heures_mois,
          (SELECT count(*)::int
             FROM evaluation_attempts ea
             JOIN evaluations e ON e.id=ea.evaluation_id
            WHERE e.cohorte_id IN (SELECT id FROM assigned_cohorts)
              AND ea.submitted_at IS NOT NULL AND ea.score IS NULL
          ) AS evaluations_a_corriger,
          (SELECT count(*)::int
             FROM owned_sessions
            WHERE starts_at::date=current_date
              AND statut <> 'annulee') AS seances_aujourdhui,
          (SELECT count(*)::int
             FROM owned_sessions s
            WHERE s.starts_at::date <= current_date
              AND s.statut IN ('planifiee','terminee','reportee')
              AND NOT EXISTS(
                SELECT 1 FROM presences p
                 WHERE p.seance_id=s.id AND p.validated_at IS NOT NULL
              )) AS presences_a_valider
        """,
        user_id,
        centre_id,
    )


async def list_cohorts(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT c.id,c.code,c.nom,c.date_debut,c.date_fin,c.salle,
               f.id AS formation_id,f.titre AS formation,
               count(DISTINCT i.participant_id)::int AS participants,
               count(DISTINCT s.id)::int AS seances_total,
               count(DISTINCT s.id) FILTER(
                 WHERE s.statut='terminee'
               )::int AS seances_terminees,
               min(s.starts_at) FILTER(
                 WHERE s.starts_at >= now() AND s.statut <> 'annulee'
               ) AS prochaine_seance
          FROM intervenants iv
          JOIN cohortes c ON c.intervenant_id=iv.id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN inscriptions i
            ON i.cohorte_id=c.id AND i.statut='confirmee'
          LEFT JOIN seances s ON s.cohorte_id=c.id
         WHERE iv.user_id=$1 AND f.centre_id=$2 AND c.statut='actif'
         GROUP BY c.id,f.id
         ORDER BY c.date_debut DESC,c.nom
        """,
        user_id,
        centre_id,
    )


async def list_sessions(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT s.id,s.cohorte_id,s.titre,s.description,s.starts_at,
               s.ends_at,s.salle,s.statut,s.qr_token,c.nom AS cohorte,
               f.titre AS formation,d.id AS request_id,
               d.starts_at_souhaite,d.ends_at_souhaite,
               d.motif AS request_motif,d.statut AS request_statut
          FROM seances s
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
          LEFT JOIN LATERAL (
            SELECT request.*
              FROM demandes_changement_seance request
             WHERE request.seance_id=s.id AND request.personnel_id=$1
             ORDER BY request.created_at DESC
             LIMIT 1
          ) d ON true
         WHERE f.centre_id=$2
           AND (iv.user_id=$1 OR s.personnel_id=$1)
           AND ($3::date IS NULL OR s.starts_at::date >= $3)
           AND ($4::date IS NULL OR s.starts_at::date <= $4)
         ORDER BY s.starts_at
        """,
        user_id,
        centre_id,
        date_from,
        date_to,
    )


async def list_online_sessions(pool: asyncpg.Pool, user_id: UUID, centre_id: UUID) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT s.id,s.titre,s.starts_at,s.ends_at,c.nom AS cohorte,f.titre AS formation,
               os.status AS online_status,os.meeting_url,os.started_at AS online_started_at,
               count(pr.id) FILTER (WHERE pr.statut IN ('present','retard'))::int AS attendees
          FROM seances s JOIN cohortes c ON c.id=s.cohorte_id JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=s.intervenant_id LEFT JOIN online_sessions os ON os.seance_id=s.id
          LEFT JOIN presences pr ON pr.seance_id=s.id
         WHERE f.centre_id=$2 AND (iv.user_id=$1 OR s.personnel_id=$1) AND s.statut<>'annulee'
         GROUP BY s.id,c.nom,f.titre,os.status,os.meeting_url,os.started_at
         ORDER BY s.starts_at DESC
        """, user_id, centre_id)


async def start_online_session(pool: asyncpg.Pool, user_id: UUID, centre_id: UUID, session_id: UUID, meeting_url: str) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO online_sessions(seance_id,meeting_url,status,started_at,ended_at)
        SELECT s.id,$4,'active',now(),NULL FROM seances s JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
         WHERE s.id=$3 AND f.centre_id=$2 AND (iv.user_id=$1 OR s.personnel_id=$1)
        ON CONFLICT(seance_id) DO UPDATE SET meeting_url=excluded.meeting_url,status='active',started_at=now(),ended_at=NULL
        RETURNING *
        """, user_id, centre_id, session_id, meeting_url)


async def get_session_for_online_start(pool: asyncpg.Pool, user_id: UUID, centre_id: UUID, session_id: UUID) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT s.id,s.titre,s.starts_at,s.ends_at FROM seances s JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
         WHERE s.id=$3 AND f.centre_id=$2 AND (iv.user_id=$1 OR s.personnel_id=$1)
        """, user_id, centre_id, session_id)


async def stop_online_session(pool: asyncpg.Pool, user_id: UUID, centre_id: UUID, session_id: UUID) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE online_sessions os SET status='ended',ended_at=now() FROM seances s JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
         WHERE os.seance_id=s.id AND os.seance_id=$3 AND f.centre_id=$2 AND (iv.user_id=$1 OR s.personnel_id=$1)
        RETURNING os.*
        """, user_id, centre_id, session_id)


async def create_change_request(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    session_id: UUID,
    starts_at,
    ends_at,
    motif: str | None,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO demandes_changement_seance(
          seance_id,personnel_id,starts_at_souhaite,ends_at_souhaite,motif
        )
        SELECT s.id,$1,$4,$5,$6
          FROM seances s
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
         WHERE s.id=$3 AND f.centre_id=$2
           AND (iv.user_id=$1 OR s.personnel_id=$1)
        RETURNING *
        """,
        user_id,
        centre_id,
        session_id,
        starts_at,
        ends_at,
        motif,
    )


async def get_attendance_session(
    connection: asyncpg.Connection | asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    session_id: UUID,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        SELECT s.id,s.cohorte_id,s.titre,s.starts_at,s.ends_at,s.salle,
               s.qr_token,c.nom AS cohorte,f.titre AS formation
          FROM seances s
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
         WHERE s.id=$3 AND f.centre_id=$2
           AND (iv.user_id=$1 OR s.personnel_id=$1)
        """,
        user_id,
        centre_id,
        session_id,
    )


async def list_attendance_participants(
    connection: asyncpg.Connection | asyncpg.Pool,
    session_id: UUID,
) -> list[asyncpg.Record]:
    return await connection.fetch(
        """
        SELECT p.id AS participant_id,i.id AS inscription_id,p.matricule,
               concat_ws(' ',u.prenom,u.nom) AS nom,
               pr.statut,pr.justification,pr.validated_at
          FROM seances s
          JOIN inscriptions i
            ON i.cohorte_id=s.cohorte_id AND i.statut='confirmee'
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          LEFT JOIN presences pr
            ON pr.seance_id=s.id AND pr.participant_id=p.id
         WHERE s.id=$1
         ORDER BY u.prenom,u.nom
        """,
        session_id,
    )


async def upsert_attendance(
    connection: asyncpg.Connection,
    session_id: UUID,
    participant_id: UUID,
    statut: str,
    justification: str | None,
    validated_by: UUID,
) -> bool:
    item = await connection.fetchrow(
        """
        INSERT INTO presences(
          seance_id,participant_id,statut,justification,
          check_in_at,validated_by,validated_at
        )
        SELECT $1,$2,$3::attendance_status,$4,
               CASE WHEN $3 IN ('present','retard') THEN now() END,$5,now()
          FROM seances s
          JOIN inscriptions i
            ON i.cohorte_id=s.cohorte_id AND i.participant_id=$2
           AND i.statut='confirmee'
         WHERE s.id=$1
        ON CONFLICT (seance_id,participant_id) DO UPDATE
          SET statut=excluded.statut,
              justification=excluded.justification,
              check_in_at=coalesce(presences.check_in_at,excluded.check_in_at),
              validated_by=excluded.validated_by,
              validated_at=excluded.validated_at
        RETURNING id
        """,
        session_id,
        participant_id,
        statut,
        justification,
        validated_by,
    )
    return item is not None


async def list_resources(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.id,r.cohorte_id,r.parent_id,r.type,r.titre,r.description,
               r.storage_key,r.mime_type,r.taille_octets,r.duree_minutes,
               r.semaine,r.publie,r.nouveau,r.created_at,
               c.nom AS cohorte,f.titre AS formation,
               concat_ws(' ',u.prenom,u.nom) AS auteur
          FROM ressources r
          JOIN cohortes c ON c.id=r.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN intervenants iv ON iv.id=c.intervenant_id
          LEFT JOIN users u ON u.id=r.created_by
         WHERE iv.user_id=$1 AND r.centre_id=$2
         ORDER BY r.created_at DESC,r.titre
        """,
        user_id,
        centre_id,
    )


async def cohort_is_assigned(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    cohort_id: UUID,
) -> bool:
    return bool(
        await pool.fetchval(
            """
            SELECT EXISTS(
              SELECT 1
                FROM cohortes c
                JOIN formations f ON f.id=c.formation_id
                JOIN intervenants iv ON iv.id=c.intervenant_id
               WHERE c.id=$3 AND f.centre_id=$2 AND iv.user_id=$1
            )
            """,
            user_id,
            centre_id,
            cohort_id,
        )
    )


async def get_resource_for_teacher(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    resource_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT r.id,r.storage_key,r.file_name,r.file_content,
               r.mime_type,r.titre
          FROM ressources r
          JOIN cohortes c ON c.id=r.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN intervenants iv ON iv.id=c.intervenant_id
         WHERE r.id=$3 AND iv.user_id=$1 AND f.centre_id=$2
        """,
        user_id,
        centre_id,
        resource_id,
    )


async def create_resource(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    resource_id: UUID,
    payload: ResourceInput,
    storage_key: str,
    file_name: str | None = None,
    file_content: bytes | None = None,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO ressources(
          id,centre_id,formation_id,cohorte_id,type,titre,description,
          storage_key,file_name,file_content,mime_type,taille_octets,
          duree_minutes,semaine,
          publie,nouveau,created_by
        )
        SELECT $3,$2,c.formation_id,c.id,$5::resource_type,$6,$7,
               $8,$14,$15,$9,$10,$11,$12,$13,true,$1
          FROM cohortes c
          JOIN formations f ON f.id=c.formation_id
          JOIN intervenants iv ON iv.id=c.intervenant_id
         WHERE c.id=$4 AND f.centre_id=$2 AND iv.user_id=$1
        RETURNING *
        """,
        user_id,
        centre_id,
        resource_id,
        payload.cohorte_id,
        payload.type,
        payload.titre,
        payload.description,
        storage_key,
        payload.mime_type,
        payload.taille_octets,
        payload.duree_minutes,
        payload.semaine,
        payload.publie,
        file_name,
        file_content,
    )


async def list_evaluations(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT e.id,e.cohorte_id,e.titre,e.description,e.duree_minutes,
               e.score_max,e.publiee,e.opens_at,e.closes_at,e.created_at,
               c.nom AS cohorte,count(DISTINCT q.id)::int AS questions,
               count(DISTINCT ea.id)::int AS tentatives
          FROM evaluations e
          JOIN cohortes c ON c.id=e.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN intervenants iv ON iv.id=c.intervenant_id
          LEFT JOIN questions q ON q.evaluation_id=e.id
          LEFT JOIN evaluation_attempts ea ON ea.evaluation_id=e.id
         WHERE iv.user_id=$1 AND f.centre_id=$2
         GROUP BY e.id,c.nom
         ORDER BY e.created_at DESC
        """,
        user_id,
        centre_id,
    )


async def create_evaluation_record(
    connection: asyncpg.Connection,
    user_id: UUID,
    centre_id: UUID,
    payload: EvaluationInput,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        INSERT INTO evaluations(
          cohorte_id,titre,description,duree_minutes,score_max,publiee,
          opens_at,closes_at,created_by
        )
        SELECT c.id,$4,$5,$6,$7,$8,$9,$10,$1
          FROM cohortes c
          JOIN formations f ON f.id=c.formation_id
          JOIN intervenants iv ON iv.id=c.intervenant_id
         WHERE c.id=$3 AND f.centre_id=$2 AND iv.user_id=$1
        RETURNING *
        """,
        user_id,
        centre_id,
        payload.cohorte_id,
        payload.titre,
        payload.description,
        payload.duree_minutes,
        payload.score_max,
        payload.publiee,
        payload.opens_at,
        payload.closes_at,
    )


async def create_question(
    connection: asyncpg.Connection,
    evaluation_id: UUID,
    texte: str,
    ordre: int,
    points,
) -> UUID:
    return await connection.fetchval(
        """
        INSERT INTO questions(evaluation_id,texte,ordre,points)
        VALUES($1,$2,$3,$4)
        RETURNING id
        """,
        evaluation_id,
        texte,
        ordre,
        points,
    )


async def create_question_option(
    connection: asyncpg.Connection,
    question_id: UUID,
    texte: str,
    correcte: bool,
    ordre: int,
) -> None:
    await connection.execute(
        """
        INSERT INTO question_options(question_id,texte,correcte,ordre)
        VALUES($1,$2,$3,$4)
        """,
        question_id,
        texte,
        correcte,
        ordre,
    )


async def list_contacts(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT u.id,concat_ws(' ',u.prenom,u.nom) AS nom,u.role,
               u.personnel_fonction,p.id AS participant_id
          FROM users u
          LEFT JOIN participants p ON p.user_id=u.id
         WHERE u.centre_id=$2 AND u.id<>$1 AND u.statut='actif'
         ORDER BY (u.role='participant') DESC,u.prenom,u.nom
        """,
        user_id,
        centre_id,
    )


async def list_tickets(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT t.id,t.sujet,t.statut,t.created_at,t.updated_at,
               CASE
                 WHEN t.created_by=$1 THEN coalesce(
                   concat_ws(' ',participant_user.prenom,participant_user.nom),
                   concat_ws(' ',assigned.prenom,assigned.nom)
                 )
                 ELSE concat_ws(' ',creator.prenom,creator.nom)
               END AS contact
          FROM tickets t
          JOIN users creator ON creator.id=t.created_by
          LEFT JOIN users assigned ON assigned.id=t.assigned_to
          LEFT JOIN participants p ON p.id=t.participant_id
          LEFT JOIN users participant_user ON participant_user.id=p.user_id
         WHERE t.centre_id=$2 AND (t.created_by=$1 OR t.assigned_to=$1)
         ORDER BY t.updated_at DESC,t.created_at DESC
        """,
        user_id,
        centre_id,
    )


async def list_ticket_messages(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT tm.id,tm.ticket_id,tm.sender_id,tm.message,tm.created_at,
               concat_ws(' ',u.prenom,u.nom) AS sender_name
          FROM ticket_messages tm
          JOIN tickets t ON t.id=tm.ticket_id
          JOIN users u ON u.id=tm.sender_id
         WHERE t.centre_id=$2 AND (t.created_by=$1 OR t.assigned_to=$1)
         ORDER BY tm.created_at
        """,
        user_id,
        centre_id,
    )


async def create_ticket(
    connection: asyncpg.Connection,
    user_id: UUID,
    centre_id: UUID,
    recipient_id: UUID,
    sujet: str,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        INSERT INTO tickets(
          centre_id,participant_id,created_by,assigned_to,sujet,statut
        )
        SELECT $2,p.id,$1,
               CASE WHEN recipient.role='personnel' THEN recipient.id ELSE $1 END,
               $4,'ouvert'
          FROM users recipient
          LEFT JOIN participants p ON p.user_id=recipient.id
         WHERE recipient.id=$3 AND recipient.centre_id=$2
           AND recipient.statut='actif'
        RETURNING *
        """,
        user_id,
        centre_id,
        recipient_id,
        sujet,
    )


async def create_ticket_message(
    connection: asyncpg.Connection | asyncpg.Pool,
    ticket_id: UUID,
    sender_id: UUID,
    message: str,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        INSERT INTO ticket_messages(ticket_id,sender_id,message)
        VALUES($1,$2,$3)
        RETURNING *
        """,
        ticket_id,
        sender_id,
        message,
    )


async def ticket_accessible(
    connection: asyncpg.Connection | asyncpg.Pool,
    ticket_id: UUID,
    user_id: UUID,
    centre_id: UUID,
) -> bool:
    return bool(
        await connection.fetchval(
            """
            SELECT EXISTS(
              SELECT 1 FROM tickets
               WHERE id=$1 AND centre_id=$3
                 AND (created_by=$2 OR assigned_to=$2)
            )
            """,
            ticket_id,
            user_id,
            centre_id,
        )
    )


async def update_ticket_status(
    pool: asyncpg.Pool,
    ticket_id: UUID,
    user_id: UUID,
    centre_id: UUID,
    statut: str,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE tickets
           SET statut=$4::ticket_status,updated_at=now()
         WHERE id=$1 AND centre_id=$3
           AND (created_by=$2 OR assigned_to=$2)
        RETURNING *
        """,
        ticket_id,
        user_id,
        centre_id,
        statut,
    )


async def list_grades(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT i.id AS inscription_id,p.id AS participant_id,
               concat_ws(' ',u.prenom,u.nom) AS nom,c.id AS cohorte_id,
               c.nom AS cohorte,
               (SELECT np.note FROM notes_participants np
                 WHERE np.inscription_id=i.id AND np.type='controle'
                 ORDER BY np.date_evaluation DESC,np.updated_at DESC LIMIT 1
               ) AS controle,
               (SELECT np.note FROM notes_participants np
                 WHERE np.inscription_id=i.id AND np.type='examen'
                 ORDER BY np.date_evaluation DESC,np.updated_at DESC LIMIT 1
               ) AS examen,
               coalesce(
                 (SELECT np.appreciation FROM notes_participants np
                   WHERE np.inscription_id=i.id
                   ORDER BY np.date_evaluation DESC,np.updated_at DESC LIMIT 1),
                 ''
               ) AS appreciation
          FROM intervenants iv
          JOIN cohortes c ON c.intervenant_id=iv.id
          JOIN formations f ON f.id=c.formation_id
          JOIN inscriptions i
            ON i.cohorte_id=c.id AND i.statut='confirmee'
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
         WHERE iv.user_id=$1 AND f.centre_id=$2
         ORDER BY c.nom,u.prenom,u.nom
        """,
        user_id,
        centre_id,
    )


async def get_intervenant_id(
    connection: asyncpg.Connection,
    user_id: UUID,
    centre_id: UUID,
) -> UUID | None:
    return await connection.fetchval(
        """
        SELECT id FROM intervenants
         WHERE user_id=$1 AND centre_id=$2 AND fonction='enseignant'
        """,
        user_id,
        centre_id,
    )


async def upsert_grade(
    connection: asyncpg.Connection,
    inscription_id: UUID,
    intervenant_id: UUID,
    user_id: UUID,
    note_type: str,
    libelle: str,
    note,
    appreciation: str | None,
) -> bool:
    item = await connection.fetchrow(
        """
        INSERT INTO notes_participants(
          inscription_id,intervenant_id,type,libelle,note,coefficient,
          appreciation,date_evaluation,created_by
        )
        SELECT i.id,$2,$4::note_type,$5,$6,1,$7,current_date,$3
          FROM inscriptions i
          JOIN cohortes c ON c.id=i.cohorte_id
         WHERE i.id=$1 AND c.intervenant_id=$2
        ON CONFLICT (inscription_id,type,libelle,date_evaluation) DO UPDATE
          SET note=excluded.note,appreciation=excluded.appreciation,
              updated_at=now()
        RETURNING id
        """,
        inscription_id,
        intervenant_id,
        user_id,
        note_type,
        libelle,
        note,
        appreciation,
    )
    return item is not None

from uuid import UUID

import asyncpg

from eduos.modules.participant.schemas import AccountInput


async def get_profile(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT u.id AS user_id,u.prenom,u.nom,u.email,u.telephone,u.statut,
               u.email_notifications,u.course_reminders,p.id AS participant_id,
               p.matricule,p.date_naissance,p.adresse,p.ville,
               centre.nom AS centre,active.id AS inscription_id,
               active.reference AS inscription_reference,
               active.cohorte_id,active.cohorte,active.formation,
               active.date_debut,active.date_fin_prevue,active.formateur
          FROM users u
          JOIN participants p ON p.user_id=u.id
          JOIN centres centre ON centre.id=u.centre_id
          LEFT JOIN LATERAL (
            SELECT i.id,i.reference,i.cohorte_id,i.date_debut,
                   i.date_fin_prevue,c.nom AS cohorte,f.titre AS formation,
                   concat_ws(' ',trainer.prenom,trainer.nom) AS formateur
              FROM inscriptions i
              JOIN cohortes c ON c.id=i.cohorte_id
              JOIN formations f ON f.id=c.formation_id
              LEFT JOIN intervenants iv ON iv.id=c.intervenant_id
              LEFT JOIN users trainer ON trainer.id=iv.user_id
             WHERE i.participant_id=p.id
               AND i.statut IN ('confirmee','suspendue')
             ORDER BY (i.statut='confirmee') DESC,i.date_debut DESC
             LIMIT 1
          ) active ON true
         WHERE u.id=$1 AND u.centre_id=$2 AND u.role='participant'
        """,
        user_id,
        centre_id,
    )


async def dashboard_stats(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        WITH participant AS (
          SELECT id FROM participants WHERE user_id=$1
        ), participant_sessions AS (
          SELECT DISTINCT s.id
            FROM participant p
            JOIN inscriptions i ON i.participant_id=p.id
            JOIN seances s ON s.cohorte_id=i.cohorte_id
           WHERE i.statut='confirmee' AND s.statut<>'annulee'
        )
        SELECT
          (SELECT coalesce(round(avg(rp.progression)),0)::int
             FROM resource_progress rp
            WHERE rp.participant_id=(SELECT id FROM participant)
          ) AS progression_ressources,
          (SELECT coalesce(round(100.0*count(*) FILTER(
                    WHERE pr.statut IN ('present','retard')
                  )/nullif(count(*),0)),0)::int
             FROM presences pr
            WHERE pr.participant_id=(SELECT id FROM participant)
              AND pr.seance_id IN (SELECT id FROM participant_sessions)
          ) AS taux_presence,
          (SELECT count(*)::int
             FROM factures fa
             JOIN inscriptions i ON i.id=fa.inscription_id
            WHERE i.participant_id=(SELECT id FROM participant)
              AND fa.statut IN ('en_attente','en_retard','partiellement_payee')
          ) AS paiements_en_attente,
          (SELECT count(*)::int
             FROM notifications n
            WHERE n.user_id=$1 AND n.read_at IS NULL
          ) AS notifications_non_lues
        """,
        user_id,
    )


async def list_sessions(
    pool: asyncpg.Pool,
    user_id: UUID,
    limit: int = 20,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT DISTINCT s.id,s.titre,s.description,s.starts_at,s.ends_at,
               s.salle,s.statut,c.nom AS cohorte,f.titre AS formation,
               concat_ws(' ',trainer.prenom,trainer.nom) AS formateur,
               pr.statut AS presence_statut
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN seances s ON s.cohorte_id=c.id
          LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
          LEFT JOIN users trainer ON trainer.id=iv.user_id
          LEFT JOIN presences pr
            ON pr.seance_id=s.id AND pr.participant_id=p.id
         WHERE p.user_id=$1 AND s.statut<>'annulee'
         ORDER BY s.starts_at DESC
         LIMIT $2
        """,
        user_id,
        limit,
    )


async def list_notifications(
    pool: asyncpg.Pool,
    user_id: UUID,
    limit: int = 100,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id,categorie,titre,message,action_url,read_at,created_at
          FROM notifications
         WHERE user_id=$1
         ORDER BY created_at DESC
         LIMIT $2
        """,
        user_id,
        limit,
    )


async def mark_notification_read(
    pool: asyncpg.Pool,
    user_id: UUID,
    notification_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE notifications SET read_at=coalesce(read_at,now())
         WHERE id=$1 AND user_id=$2
        RETURNING *
        """,
        notification_id,
        user_id,
    )


async def mark_all_notifications_read(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> int:
    result = await pool.execute(
        """
        UPDATE notifications SET read_at=coalesce(read_at,now())
         WHERE user_id=$1 AND read_at IS NULL
        """,
        user_id,
    )
    return int(result.split()[-1])


async def list_documents(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT d.id,d.type,d.nom,d.storage_key,d.mime_type,d.taille_octets,
               d.genere_automatiquement,d.created_at,i.reference AS inscription,
               fa.numero AS facture
          FROM participants p
          JOIN documents d ON d.participant_id=p.id
          LEFT JOIN inscriptions i ON i.id=d.inscription_id
          LEFT JOIN factures fa ON fa.id=d.facture_id
         WHERE p.user_id=$1 AND d.visible_participant
         ORDER BY d.created_at DESC,d.nom
        """,
        user_id,
    )


async def list_payments(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT fa.id,fa.numero,fa.periode,fa.date_emission,fa.date_echeance,
               fa.montant_ht,fa.taxe,fa.montant_ttc,fa.statut,
               coalesce(sum(pa.montant) FILTER(WHERE pa.statut='paye'),0)
                 AS montant_paye,
               max(pa.reference) FILTER(WHERE pa.statut='paye') AS reference,
               max(pa.methode::text) FILTER(WHERE pa.statut='paye') AS methode,
               max(pa.paid_at) FILTER(WHERE pa.statut='paye') AS paid_at,
               c.nom AS cohorte,f.titre AS formation
          FROM participants p
          JOIN inscriptions i ON i.participant_id=p.id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN factures fa ON fa.inscription_id=i.id
          LEFT JOIN paiements pa ON pa.facture_id=fa.id
         WHERE p.user_id=$1
         GROUP BY fa.id,c.nom,f.titre
         ORDER BY fa.periode DESC
        """,
        user_id,
    )


async def list_payment_methods(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id,methode::text AS methode,libelle,instructions,
               coordonnees->>'banque' AS banque,
               coordonnees->>'iban' AS iban,
               coordonnees->>'provider' AS provider
          FROM moyens_paiement
         WHERE centre_id=$1 AND actif
         ORDER BY ordre,libelle
        """,
        centre_id,
    )


async def list_reports(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.id,r.periode,r.score_global,r.taux_presence,r.appreciation,
               r.publie_at,c.nom AS cohorte,f.titre AS formation,
               concat_ws(' ',trainer.prenom,trainer.nom) AS formateur
          FROM participants p
          JOIN inscriptions i ON i.participant_id=p.id
          JOIN rapports_suivi r ON r.inscription_id=i.id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN intervenants iv ON iv.id=r.intervenant_id
          LEFT JOIN users trainer ON trainer.id=iv.user_id
         WHERE p.user_id=$1 AND r.publie_at IS NOT NULL
         ORDER BY r.periode DESC
        """,
        user_id,
    )


async def list_report_competencies(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT rc.id,rc.rapport_id,rc.competence,rc.score,rc.commentaire
          FROM participants p
          JOIN inscriptions i ON i.participant_id=p.id
          JOIN rapports_suivi r ON r.inscription_id=i.id
          JOIN rapport_competences rc ON rc.rapport_id=r.id
         WHERE p.user_id=$1 AND r.publie_at IS NOT NULL
         ORDER BY rc.competence
        """,
        user_id,
    )


async def list_resources(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT r.id,r.type,r.titre,r.description,r.storage_key,r.mime_type,
               r.taille_octets,r.duree_minutes,r.semaine,r.nouveau,
               r.created_at,c.nom AS cohorte,f.titre AS formation,
               coalesce(rp.progression,0)::int AS progression,
               rp.completed_at,rp.last_opened_at
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN ressources r ON r.cohorte_id=i.cohorte_id AND r.publie
          JOIN cohortes c ON c.id=r.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN resource_progress rp
            ON rp.resource_id=r.id AND rp.participant_id=p.id
         WHERE p.user_id=$1
         ORDER BY coalesce(r.semaine,0) DESC,r.created_at DESC
        """,
        user_id,
    )


async def get_resource_for_participant(
    pool: asyncpg.Pool,
    user_id: UUID,
    resource_id: UUID,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT r.id,r.storage_key,r.mime_type,r.titre
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN ressources r
            ON r.id=$2 AND r.cohorte_id=i.cohorte_id AND r.publie
         WHERE p.user_id=$1
         LIMIT 1
        """,
        user_id,
        resource_id,
    )


async def update_resource_progress(
    pool: asyncpg.Pool,
    user_id: UUID,
    resource_id: UUID,
    progression: int,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        INSERT INTO resource_progress(
          resource_id,participant_id,progression,completed_at,last_opened_at
        )
        SELECT r.id,p.id,$3::smallint,
               CASE WHEN $3::smallint=100 THEN now() END,now()
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN ressources r ON r.id=$2 AND r.cohorte_id=i.cohorte_id
           AND r.publie
         WHERE p.user_id=$1
        ON CONFLICT(resource_id,participant_id) DO UPDATE
          SET progression=excluded.progression,
              completed_at=CASE WHEN excluded.progression=100
                THEN coalesce(resource_progress.completed_at,now())
                ELSE NULL END,
              last_opened_at=now()
        RETURNING *
        """,
        user_id,
        resource_id,
        progression,
    )


async def list_evaluations(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT e.id,e.titre,e.description,e.duree_minutes,e.score_max,
               e.opens_at,e.closes_at,c.nom AS cohorte,f.titre AS formation,
               count(DISTINCT q.id)::int AS questions,
               ea.started_at,ea.submitted_at,ea.score
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN evaluations e ON e.cohorte_id=i.cohorte_id AND e.publiee
          JOIN cohortes c ON c.id=e.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN questions q ON q.evaluation_id=e.id
          LEFT JOIN evaluation_attempts ea
            ON ea.evaluation_id=e.id AND ea.participant_id=p.id
         WHERE p.user_id=$1
           AND (e.opens_at IS NULL OR e.opens_at<=now())
           AND (e.closes_at IS NULL OR e.closes_at>=now())
         GROUP BY e.id,c.nom,f.titre,ea.id
         ORDER BY e.created_at DESC
        """,
        user_id,
    )


async def get_evaluation(
    connection: asyncpg.Connection | asyncpg.Pool,
    user_id: UUID,
    evaluation_id: UUID,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        SELECT e.id,e.titre,e.description,e.duree_minutes,e.score_max,
               c.nom AS cohorte,f.titre AS formation,p.id AS participant_id,
               ea.id AS attempt_id,ea.submitted_at,ea.score
          FROM participants p
          JOIN inscriptions i
            ON i.participant_id=p.id AND i.statut='confirmee'
          JOIN evaluations e ON e.id=$2 AND e.cohorte_id=i.cohorte_id
           AND e.publiee
          JOIN cohortes c ON c.id=e.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          LEFT JOIN evaluation_attempts ea
            ON ea.evaluation_id=e.id AND ea.participant_id=p.id
         WHERE p.user_id=$1
           AND (e.opens_at IS NULL OR e.opens_at<=now())
           AND (e.closes_at IS NULL OR e.closes_at>=now())
        """,
        user_id,
        evaluation_id,
    )


async def list_evaluation_options(
    connection: asyncpg.Connection | asyncpg.Pool,
    evaluation_id: UUID,
) -> list[asyncpg.Record]:
    return await connection.fetch(
        """
        SELECT q.id AS question_id,q.texte,q.ordre,q.points,
               qo.id AS option_id,qo.texte AS option_texte,qo.ordre AS option_ordre
          FROM questions q
          JOIN question_options qo ON qo.question_id=q.id
         WHERE q.evaluation_id=$1
         ORDER BY q.ordre,qo.ordre
        """,
        evaluation_id,
    )


async def create_attempt(
    connection: asyncpg.Connection,
    evaluation_id: UUID,
    participant_id: UUID,
) -> UUID | None:
    return await connection.fetchval(
        """
        INSERT INTO evaluation_attempts(evaluation_id,participant_id)
        VALUES($1,$2)
        ON CONFLICT(evaluation_id,participant_id) DO NOTHING
        RETURNING id
        """,
        evaluation_id,
        participant_id,
    )


async def grade_answer(
    connection: asyncpg.Connection,
    evaluation_id: UUID,
    question_id: UUID,
    option_id: UUID,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        SELECT q.points,qo.correcte
          FROM questions q
          JOIN question_options qo
            ON qo.question_id=q.id AND qo.id=$3
         WHERE q.id=$2 AND q.evaluation_id=$1
        """,
        evaluation_id,
        question_id,
        option_id,
    )


async def create_evaluation_answer(
    connection: asyncpg.Connection,
    attempt_id: UUID,
    question_id: UUID,
    option_id: UUID,
    correcte: bool,
    points,
) -> None:
    await connection.execute(
        """
        INSERT INTO evaluation_answers(
          attempt_id,question_id,option_id,correcte,points_obtenus
        ) VALUES($1,$2,$3,$4,$5)
        """,
        attempt_id,
        question_id,
        option_id,
        correcte,
        points,
    )


async def total_evaluation_points(
    connection: asyncpg.Connection,
    evaluation_id: UUID,
) -> float:
    return float(
        await connection.fetchval(
            "SELECT coalesce(sum(points),0) FROM questions WHERE evaluation_id=$1",
            evaluation_id,
        )
    )


async def finish_attempt(
    connection: asyncpg.Connection,
    attempt_id: UUID,
    score: float,
) -> asyncpg.Record:
    return await connection.fetchrow(
        """
        UPDATE evaluation_attempts SET submitted_at=now(),score=$2
         WHERE id=$1
        RETURNING *
        """,
        attempt_id,
        score,
    )


async def update_account(
    connection: asyncpg.Connection,
    user_id: UUID,
    centre_id: UUID,
    payload: AccountInput,
) -> asyncpg.Record | None:
    return await connection.fetchrow(
        """
        WITH updated_user AS (
          UPDATE users SET prenom=$3,nom=$4,email=$5::citext,telephone=$6,
                 email_notifications=$10,course_reminders=$11,updated_at=now()
           WHERE id=$1 AND centre_id=$2 AND role='participant'
          RETURNING id
        )
        UPDATE participants p
           SET date_naissance=$7,adresse=$8,ville=$9
          FROM updated_user u
         WHERE p.user_id=u.id
        RETURNING p.*
        """,
        user_id,
        centre_id,
        payload.prenom,
        payload.nom,
        str(payload.email).lower(),
        payload.telephone,
        payload.date_naissance,
        payload.adresse,
        payload.ville,
        payload.email_notifications,
        payload.course_reminders,
    )


async def change_password(
    pool: asyncpg.Pool,
    user_id: UUID,
    current_password: str,
    new_password: str,
) -> bool:
    item = await pool.fetchval(
        """
        UPDATE users
           SET password_hash=crypt($3,gen_salt('bf')),updated_at=now()
         WHERE id=$1 AND password_hash=crypt($2,password_hash)
        RETURNING id
        """,
        user_id,
        current_password,
        new_password,
    )
    return item is not None

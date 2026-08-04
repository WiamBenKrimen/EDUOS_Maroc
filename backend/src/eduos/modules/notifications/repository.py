from uuid import UUID

import asyncpg


async def list_user_notifications(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id,categorie,titre,message,action_url,read_at,created_at
          FROM notifications
         WHERE user_id=$1
         ORDER BY created_at DESC
         LIMIT 30
        """,
        user_id,
    )


async def list_whatsapp_contacts(pool: asyncpg.Pool, centre_id: UUID) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT u.id,concat_ws(' ',u.prenom,u.nom) AS nom,u.telephone,u.role,
               coalesce(p.matricule,'') AS matricule
          FROM users u LEFT JOIN participants p ON p.user_id=u.id
         WHERE u.centre_id=$1 AND u.statut='actif' AND u.telephone IS NOT NULL AND btrim(u.telephone)<>''
         ORDER BY (u.role='participant') DESC,u.prenom,u.nom
        """, centre_id)


async def get_whatsapp_contact(pool: asyncpg.Pool, centre_id: UUID, recipient_id: UUID) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT u.id,concat_ws(' ',u.prenom,u.nom) AS nom,u.telephone FROM users u
         WHERE u.id=$2 AND u.centre_id=$1 AND u.statut='actif' AND u.telephone IS NOT NULL AND btrim(u.telephone)<>''
        """, centre_id, recipient_id)


async def get_user_by_phone(pool: asyncpg.Pool, centre_id: UUID, telephone: str) -> asyncpg.Record | None:
    # Match last 8-9 digits to handle +212 / 06 / 07 variations
    clean_num = "".join(c for c in telephone if c.isdigit())
    if len(clean_num) >= 8:
        suffix = clean_num[-8:]
        return await pool.fetchrow(
            """
            SELECT u.id, concat_ws(' ', u.prenom, u.nom) AS nom, u.telephone
              FROM users u
             WHERE u.centre_id = $1
               AND regexp_replace(u.telephone, '\\D', '', 'g') LIKE $2
             LIMIT 1
            """,
            centre_id,
            f"%{suffix}",
        )
    return None


async def save_whatsapp_message(
    pool: asyncpg.Pool,
    centre_id: UUID,
    recipient_id: UUID,
    direction: str,
    message: str,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO whatsapp_chat_messages (centre_id, recipient_id, direction, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, centre_id, recipient_id, direction, message, created_at
        """,
        centre_id,
        recipient_id,
        direction,
        message,
    )


async def list_whatsapp_chat_messages(
    pool: asyncpg.Pool,
    centre_id: UUID,
    recipient_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, centre_id, recipient_id, direction, message, created_at
          FROM whatsapp_chat_messages
         WHERE centre_id = $1 AND recipient_id = $2
         ORDER BY created_at ASC
         LIMIT 200
        """,
        centre_id,
        recipient_id,
    )


async def mark_all_read(pool: asyncpg.Pool, user_id: UUID) -> int:
    result = await pool.execute(
        """
        UPDATE notifications SET read_at=coalesce(read_at,now())
         WHERE user_id=$1 AND read_at IS NULL
        """,
        user_id,
    )
    return int(result.split()[-1])


async def list_reminder_rules(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT rr.id,rr.offset_days,rr.canal,
               rr.message_template,rr.actif,
               count(r.id)::int AS messages_envoyes
          FROM relance_rules rr
          LEFT JOIN relances r
            ON r.rule_id=rr.id AND r.sent_at >= date_trunc('month',now())
         WHERE rr.centre_id=$1
         GROUP BY rr.id
         ORDER BY rr.offset_days,rr.titre
        """,
        centre_id,
    )


async def update_reminder_rule(
    pool: asyncpg.Pool,
    centre_id: UUID,
    rule_id: UUID,
    actif: bool,
) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        UPDATE relance_rules
           SET actif=$3
         WHERE id=$1 AND centre_id=$2
        RETURNING *
        """,
        rule_id,
        centre_id,
        actif,
    )


async def create_overdue_reminders(
    pool: asyncpg.Pool,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        WITH selected_rule AS (
          SELECT id,canal,message_template
            FROM relance_rules
           WHERE centre_id=$1 AND actif
           ORDER BY offset_days DESC
           LIMIT 1
        )
        INSERT INTO relances(
          facture_id,rule_id,canal,destinataire,contenu,sent_at,statut
        )
        SELECT fa.id,rr.id,rr.canal,coalesce(u.telephone,u.email::text),
               replace(
                 replace(rr.message_template,'{prenom}',u.prenom),
                 '{montant}',fa.montant_ttc::text
               ),
               now(),'envoyee'
          FROM factures fa
          JOIN inscriptions i ON i.id=fa.inscription_id
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          CROSS JOIN selected_rule rr
         WHERE f.centre_id=$1
           AND fa.statut IN ('en_attente','en_retard')
           AND fa.date_echeance < current_date
           AND NOT EXISTS(
             SELECT 1 FROM relances existing
              WHERE existing.facture_id=fa.id
                AND existing.rule_id=rr.id
                AND existing.sent_at::date=current_date
           )
        RETURNING *
        """,
        centre_id,
    )

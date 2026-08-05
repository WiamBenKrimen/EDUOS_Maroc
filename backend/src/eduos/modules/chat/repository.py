from uuid import UUID

import asyncpg


async def find_user_by_id(
    pool: asyncpg.Pool,
    user_id: UUID,
) -> asyncpg.Record | None:
    """Trouve un utilisateur par son ID pour vérifier son centre et statut."""
    return await pool.fetchrow(
        "SELECT id, centre_id, statut FROM users WHERE id = $1",
        user_id,
    )



async def list_centre_users(
    pool: asyncpg.Pool,
    centre_id: UUID,
    exclude_id: UUID,
) -> list[asyncpg.Record]:
    """Liste tous les utilisateurs actifs du centre (hors l'appelant)."""
    return await pool.fetch(
        """
        SELECT id, nom, prenom, role, personnel_fonction,
               last_login_at
          FROM users
         WHERE centre_id = $1
           AND id != $2
           AND statut = 'actif'
         ORDER BY nom, prenom
        """,
        centre_id,
        exclude_id,
    )


async def list_conversations(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> list[asyncpg.Record]:
    """
    Pour chaque interlocuteur avec qui l'utilisateur a échangé,
    retourne le dernier message + le nombre de non-lus.
    """
    return await pool.fetch(
        """
        WITH partners AS (
            SELECT DISTINCT
                CASE WHEN sender_id = $1 THEN recipient_id
                     ELSE sender_id END AS partner_id
              FROM chat_messages
             WHERE centre_id = $2
               AND (sender_id = $1 OR recipient_id = $1)
        ),
        last_msg AS (
            SELECT DISTINCT ON (
                CASE WHEN sender_id = $1 THEN recipient_id
                     ELSE sender_id END
            )
                CASE WHEN sender_id = $1 THEN recipient_id
                     ELSE sender_id END AS partner_id,
                id,
                body,
                sender_id,
                created_at,
                read_at
              FROM chat_messages
             WHERE centre_id = $2
               AND (sender_id = $1 OR recipient_id = $1)
             ORDER BY
                CASE WHEN sender_id = $1 THEN recipient_id
                     ELSE sender_id END,
                created_at DESC
        ),
        unread_counts AS (
            SELECT sender_id AS partner_id, count(*) AS unread
              FROM chat_messages
             WHERE recipient_id = $1
               AND centre_id = $2
               AND read_at IS NULL
             GROUP BY sender_id
        )
        SELECT
            p.partner_id,
            u.nom,
            u.prenom,
            u.role,
            u.personnel_fonction,
            lm.id        AS last_message_id,
            lm.body      AS last_body,
            lm.sender_id AS last_sender_id,
            lm.created_at AS last_at,
            lm.read_at   AS last_read_at,
            COALESCE(uc.unread, 0)::int AS unread_count
          FROM partners p
          JOIN users u ON u.id = p.partner_id
          JOIN last_msg lm ON lm.partner_id = p.partner_id
          LEFT JOIN unread_counts uc ON uc.partner_id = p.partner_id
         ORDER BY lm.created_at DESC
        """,
        user_id,
        centre_id,
    )


async def list_messages(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
    partner_id: UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[asyncpg.Record]:
    """Retourne les messages entre deux utilisateurs (ordre chronologique)."""
    return await pool.fetch(
        """
        SELECT id, sender_id, recipient_id, body, read_at, created_at
          FROM chat_messages
         WHERE centre_id = $3
           AND (
               (sender_id = $1 AND recipient_id = $2)
            OR (sender_id = $2 AND recipient_id = $1)
           )
         ORDER BY created_at ASC
         LIMIT $4 OFFSET $5
        """,
        user_id,
        partner_id,
        centre_id,
        limit,
        offset,
    )


async def send_message(
    pool: asyncpg.Pool,
    centre_id: UUID,
    sender_id: UUID,
    recipient_id: UUID,
    body: str,
) -> asyncpg.Record:
    """Insère un message et retourne l'enregistrement."""
    return await pool.fetchrow(
        """
        INSERT INTO chat_messages (centre_id, sender_id, recipient_id, body)
        VALUES ($1, $2, $3, $4)
        RETURNING id, sender_id, recipient_id, body, read_at, created_at
        """,
        centre_id,
        sender_id,
        recipient_id,
        body.strip(),
    )


async def mark_conversation_read(
    pool: asyncpg.Pool,
    reader_id: UUID,
    partner_id: UUID,
    centre_id: UUID,
) -> int:
    """Marque comme lus tous les messages reçus de partner_id par reader_id."""
    result = await pool.execute(
        """
        UPDATE chat_messages
           SET read_at = now()
         WHERE recipient_id = $1
           AND sender_id = $2
           AND centre_id = $3
           AND read_at IS NULL
        """,
        reader_id,
        partner_id,
        centre_id,
    )
    # result is like "UPDATE 5"
    try:
        return int(result.split()[-1])
    except (IndexError, ValueError):
        return 0


async def count_unread(
    pool: asyncpg.Pool,
    user_id: UUID,
    centre_id: UUID,
) -> int:
    """Nombre total de messages non lus pour un utilisateur."""
    row = await pool.fetchrow(
        """
        SELECT count(*)::int AS total
          FROM chat_messages
         WHERE recipient_id = $1
           AND centre_id = $2
           AND read_at IS NULL
        """,
        user_id,
        centre_id,
    )
    return row["total"] if row else 0

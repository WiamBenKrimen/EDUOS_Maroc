"""Ajout de la table chat_messages pour le chat interne EDUOS.

Revision ID: 010_add_chat_messages
Revises: 009_store_resource_files_in_database
"""

from alembic import op

revision = "010_add_chat_messages"
down_revision = "009_resource_files_db"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            centre_id    uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
            sender_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            body         text NOT NULL CHECK (char_length(trim(body)) > 0),
            read_at      timestamptz,
            created_at   timestamptz NOT NULL DEFAULT now()
        )
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_centre_id
            ON chat_messages (centre_id)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_recipient
            ON chat_messages (sender_id, recipient_id)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient_unread
            ON chat_messages (recipient_id, read_at)
            WHERE read_at IS NULL
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS chat_messages CASCADE")

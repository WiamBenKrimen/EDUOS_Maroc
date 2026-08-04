"""Ajoute l'historique local des conversations WhatsApp.

Revision ID: 007_whatsapp_chat_messages
Revises: 006_online_sessions
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "007_whatsapp_chat_messages"
down_revision = "006_online_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "whatsapp_chat_messages",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "centre_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("centres.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "recipient_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "direction",
            sa.String(length=16),
            nullable=False,
        ),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "direction IN ('sent', 'received')",
            name="ck_whatsapp_chat_messages_direction",
        ),
    )
    op.create_index(
        "idx_whatsapp_chat_messages_conversation",
        "whatsapp_chat_messages",
        ["centre_id", "recipient_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "idx_whatsapp_chat_messages_conversation",
        table_name="whatsapp_chat_messages",
    )
    op.drop_table("whatsapp_chat_messages")

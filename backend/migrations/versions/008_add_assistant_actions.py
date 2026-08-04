"""Ajoute les actions confirmables de l'assistant IA.

Revision ID: 008_assistant_actions
Revises: 007_whatsapp_chat_messages
"""

from alembic import op

revision = "008_assistant_actions"
down_revision = "007_whatsapp_chat_messages"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE assistant_actions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
          director_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action varchar(80) NOT NULL,
          payload jsonb NOT NULL,
          summary jsonb NOT NULL,
          statut varchar(16) NOT NULL DEFAULT 'pending'
            CHECK (statut IN ('pending','executing','completed','failed','cancelled')),
          result jsonb,
          error text,
          expires_at timestamptz NOT NULL,
          confirmed_at timestamptz,
          completed_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX idx_assistant_actions_director_created
          ON assistant_actions(director_id, created_at DESC);
        CREATE INDEX idx_assistant_actions_pending_expiry
          ON assistant_actions(expires_at)
          WHERE statut='pending';
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS assistant_actions")

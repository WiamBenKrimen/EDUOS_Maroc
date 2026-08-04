"""Ajoute les séances en ligne.

Revision ID: 006_online_sessions
Revises: 005_google_drive_oauth
"""

from alembic import op

revision = "006_online_sessions"
down_revision = "005_google_drive_oauth"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE online_sessions (
          seance_id uuid PRIMARY KEY REFERENCES seances(id) ON DELETE CASCADE,
          meeting_url text NOT NULL,
          status varchar(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended')),
          started_at timestamptz NOT NULL DEFAULT now(),
          ended_at timestamptz
        )
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS online_sessions")

"""Ajoute la connexion OAuth Google Drive par centre.

Revision ID: 005_google_drive_oauth
Revises: 004_instructor_requests
"""

from alembic import op

revision = "005_google_drive_oauth"
down_revision = "004_instructor_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE google_drive_connections (
          centre_id uuid PRIMARY KEY REFERENCES centres(id) ON DELETE CASCADE,
          refresh_token bytea NOT NULL,
          folder_id text NOT NULL,
          account_email citext,
          connected_by uuid REFERENCES users(id) ON DELETE SET NULL,
          connected_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS google_drive_connections")

"""Stocke les fichiers des ressources dans PostgreSQL.

Revision ID: 009_resource_files_db
Revises: 008_assistant_actions
"""

from alembic import op

revision = "009_resource_files_db"
down_revision = "008_assistant_actions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE ressources
          ADD COLUMN file_name varchar(255),
          ADD COLUMN file_content bytea;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE ressources
          DROP COLUMN IF EXISTS file_content,
          DROP COLUMN IF EXISTS file_name;
        """
    )

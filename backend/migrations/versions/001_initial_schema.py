"""Schéma PostgreSQL initial d'EDUOS.

Revision ID: 001_initial_schema
Revises:
"""

from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "database" / "schema.sql"


def upgrade() -> None:
    bind = op.get_bind()
    if sa.inspect(bind).has_table("centres"):
        # La base peut provenir de l'ancien bootstrap schema.sql. Dans ce cas,
        # Alembic adopte le schéma existant avant d'appliquer les révisions
        # incrémentales suivantes.
        return

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8-sig")
    schema_sql = schema_sql.replace("BEGIN;", "", 1)
    schema_sql = schema_sql.rsplit("COMMIT;", 1)[0]

    raw_connection = bind.connection.driver_connection
    with raw_connection.cursor() as cursor:
        cursor.execute(schema_sql, prepare=False)


def downgrade() -> None:
    bind = op.get_bind()
    bind.exec_driver_sql("DROP SCHEMA public CASCADE")
    bind.exec_driver_sql("CREATE SCHEMA public AUTHORIZATION CURRENT_USER")

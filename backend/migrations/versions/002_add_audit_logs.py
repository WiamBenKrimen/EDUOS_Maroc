"""Ajoute le journal d'audit.

Revision ID: 002_add_audit_logs
Revises: 001_initial_schema
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "002_add_audit_logs"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "centre_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("centres.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "actor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column(
            "entity_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
        sa.Column(
            "metadata",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("ip_address", postgresql.INET(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "idx_audit_logs_centre_created",
        "audit_logs",
        ["centre_id", "created_at"],
    )
    op.create_index(
        "idx_audit_logs_entity",
        "audit_logs",
        ["entity_type", "entity_id"],
    )


def downgrade() -> None:
    op.drop_index("idx_audit_logs_entity", table_name="audit_logs")
    op.drop_index("idx_audit_logs_centre_created", table_name="audit_logs")
    op.drop_table("audit_logs")

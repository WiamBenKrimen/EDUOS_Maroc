"""Ajoute les index composites de facturation.

Revision ID: 003_add_payment_indexes
Revises: 002_add_audit_logs
"""

from alembic import op

revision = "003_add_payment_indexes"
down_revision = "002_add_audit_logs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "idx_factures_inscription_status",
        "factures",
        ["inscription_id", "statut"],
    )
    op.create_index(
        "idx_paiements_status_paid_at",
        "paiements",
        ["statut", "paid_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "idx_paiements_status_paid_at",
        table_name="paiements",
    )
    op.drop_index(
        "idx_factures_inscription_status",
        table_name="factures",
    )

"""Autorise l'intervenant affectÃ© Ã  demander un changement de sÃ©ance.

Revision ID: 004_instructor_requests
Revises: 003_add_payment_indexes
"""

from alembic import op

revision = "004_instructor_requests"
down_revision = "003_add_payment_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE OR REPLACE FUNCTION validate_session_change_request()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        DECLARE
          assigned_operator uuid;
          assigned_instructor_user uuid;
        BEGIN
          SELECT s.personnel_id,iv.user_id
            INTO assigned_operator,assigned_instructor_user
            FROM seances s
            LEFT JOIN intervenants iv ON iv.id=s.intervenant_id
           WHERE s.id=NEW.seance_id;

          IF NEW.personnel_id IS DISTINCT FROM assigned_operator
             AND NEW.personnel_id IS DISTINCT FROM assigned_instructor_user THEN
            RAISE EXCEPTION
              'change request operator must be assigned to the session';
          END IF;

          RETURN NEW;
        END;
        $$
        """
    )


def downgrade() -> None:
    op.execute(
        """
        CREATE OR REPLACE FUNCTION validate_session_change_request()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        DECLARE
          assigned_operator uuid;
        BEGIN
          SELECT personnel_id INTO assigned_operator
          FROM seances
          WHERE id=NEW.seance_id;

          IF assigned_operator IS NULL
             OR assigned_operator<>NEW.personnel_id THEN
            RAISE EXCEPTION
              'change request operator must be assigned to the session';
          END IF;

          RETURN NEW;
        END;
        $$
        """
    )

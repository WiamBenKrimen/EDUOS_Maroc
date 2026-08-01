"""Socle de métadonnées pour Alembic.

L'application utilise des repositories SQL explicites avec asyncpg. Les
migrations Alembic restent donc indépendantes d'un ORM.
"""

from sqlalchemy import MetaData

metadata = MetaData()

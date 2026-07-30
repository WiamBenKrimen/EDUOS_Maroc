# Installation PostgreSQL sur VPS sans Docker

## Installation

Sur Ubuntu ou Debian :

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Créez la base et son utilisateur :

```bash
sudo -u postgres psql
```

```sql
CREATE USER eduos_app WITH PASSWORD 'REMPLACER_PAR_UN_SECRET_FORT';
CREATE DATABASE eduos OWNER eduos_app;
\c eduos
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
\q
```

Installez le schéma depuis la racine du projet :

```bash
psql "postgresql://eduos_app:REMPLACER_PAR_UN_SECRET_FORT@127.0.0.1:5432/eduos" -f backend/database/schema.sql
```

Le seed est réservé au développement et à la démonstration :

```bash
psql "postgresql://eduos_app:REMPLACER_PAR_UN_SECRET_FORT@127.0.0.1:5432/eduos" -f backend/database/seed.sql
```

Ne jamais exécuter `seed.sql` sur la production : il vide les tables.

## Connexion FastAPI

Variables d’environnement recommandées :

```env
DATABASE_URL=postgresql+asyncpg://eduos_app:REMPLACER_PAR_UN_SECRET_FORT@127.0.0.1:5432/eduos
JWT_SECRET=REMPLACER_PAR_UN_SECRET_ALEATOIRE
FRONTEND_ORIGIN=https://app.votre-domaine.ma
```

Dépendances Python :

```bash
python -m pip install fastapi uvicorn sqlalchemy asyncpg alembic passlib bcrypt python-jose
```

Exemple SQLAlchemy asynchrone :

```python
import os
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

engine = create_async_engine(
    os.environ["DATABASE_URL"],
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
```

Architecture :

```text
Next.js -> API FastAPI -> PostgreSQL
```

Dans `front/.env.production` :

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.ma/api
```

## Sécurité VPS

- PostgreSQL doit écouter sur `127.0.0.1` si FastAPI tourne sur le même VPS.
- Ne pas ouvrir le port `5432` sur Internet.
- Utiliser un mot de passe différent du seed.
- Exécuter FastAPI avec un utilisateur système non privilégié.
- Utiliser HTTPS via Nginx ou Caddy.
- Gérer les futures migrations avec Alembic.

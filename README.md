# EDUOS MAROC

```text
EDUOS MAROC/
├── front/                  application Next.js
└── backend/
    ├── src/eduos/          API FastAPI
    ├── migrations/         migrations Alembic
    ├── database/           schéma et données PostgreSQL
    ├── tests/              tests unitaires, API et intégration
    ├── scripts/            administration et données initiales
    ├── pyproject.toml
    ├── Dockerfile
    └── compose.yaml
```

## Démarrage complet

Backend FastAPI et PostgreSQL :

```powershell
cd backend
Copy-Item .env.example .env
docker compose up --build
```

Frontend Next.js :

```powershell
cd front
npm install
npm run dev
```

Le flux local est `Next.js :3000 → FastAPI :3001 → PostgreSQL :5432`.

La documentation détaillée se trouve dans
[`backend/README.md`](backend/README.md).

# API FastAPI EDUOS

Cette API remplace progressivement le backend Fastify et utilise la même base PostgreSQL `eduos`.

## Démarrage

```powershell
cd backend\fastapi
Copy-Item .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET dans .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3001
```

Le frontend utilise déjà `http://localhost:3001/api` : arrêter d’abord le serveur Fastify, puis démarrer cette API FastAPI sur le port 3001.

## Modules direction

Toutes les routes suivantes exigent un JWT d’un utilisateur au rôle `directeur` et filtrent les données par centre :

- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/director/dashboard`
- personnel, prospects, formations, cohortes et planning
- factures/paiements (`/api/director/financial`, `/api/director/payments`)
- renouvellements, attestations et rapports.

Documentation interactive : `http://localhost:3001/docs`.

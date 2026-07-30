# EDUOS MAROC

```text
EDUOS MAROC/
├── front/                  application Next.js
│   └── app/
│       ├── directeur/      espace Directeur, séparé du personnel
│       └── personnel/
│           ├── coordinateur/
│           ├── commercial/
│           ├── formateur/
│           ├── enseignant/
│           └── participant/
└── backend/                API Fastify et PostgreSQL
    ├── src/
    └── database/
```

## Frontend

```powershell
cd front
npm run dev
```

## Backend

```powershell
cd backend
Copy-Item .env.example .env
docker compose up -d
npm run db:schema
npm run db:seed
npm run dev
```

Le frontend fonctionne aussi en mode démonstration lorsque le backend est arrêté.

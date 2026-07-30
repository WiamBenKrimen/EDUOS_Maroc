# API EDUOS

Backend TypeScript séparé du frontend Next.js.

## Architecture

```text
backend/src/
├── config/       variables d’environnement validées
├── database/     pool PostgreSQL, requêtes et exécution SQL
├── modules/      routes organisées par domaine
├── plugins/      authentification et autorisation
├── security/     matrice des permissions
└── types/        contrats partagés du backend
```

Le navigateur ne se connecte jamais directement à PostgreSQL :

```text
Next.js :3000 → API Fastify :3001 → PostgreSQL :5432
```

## Démarrage local

Depuis `backend/` :

```bash
cp .env.example .env
docker compose up -d
npm run db:schema
npm run db:seed
npm run dev
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
docker compose up -d
npm run db:schema
npm run db:seed
npm run dev
```

Puis démarrer le frontend depuis la racine :

```bash
npm run dev
```

## Routes initiales

- `GET /api/health` : état de l’API ;
- `GET /api/health/db` : test PostgreSQL ;
- `POST /api/auth/login` : connexion et création du JWT ;
- `GET /api/auth/me` : utilisateur connecté ;
- `GET /api/personnel` : liste du personnel, Directeur uniquement ;
- `POST /api/personnel` : création d’un compte Personnel, Directeur uniquement.

Toutes les requêtes métier doivent utiliser `request.user.centreId` pour isoler les centres.

## Modèle d’accès

- `directeur` : toutes les permissions ;
- `personnel/coordinateur` : planning, présences et organisation pédagogique ;
- `personnel/commercial` : prospects, inscriptions et suivi des paiements ;
- `personnel/formateur` et `personnel/enseignant` : séances affectées, présences, ressources et évaluations ;
- `participant` : uniquement ses propres données.

Le fichier `.env` ne doit jamais être versionné. En production, utiliser un secret JWT fort, une connexion PostgreSQL chiffrée et un gestionnaire de secrets.

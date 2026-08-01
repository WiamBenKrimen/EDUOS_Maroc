# Backend EDUOS

Le backend de référence est une API **FastAPI** organisée en monolithe
modulaire :

```text
Next.js :3000 → FastAPI :3001 → PostgreSQL :5432
```

## Structure

```text
backend/
├── pyproject.toml
├── alembic.ini
├── Dockerfile
├── compose.yaml
├── migrations/
│   └── versions/
├── src/
│   └── eduos/
│       ├── api/
│       ├── core/
│       ├── database/
│       ├── modules/
│       ├── integrations/
│       ├── workers/
│       └── main.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── api/
│   └── factories/
└── scripts/
```

Les règles de séparation sont les suivantes :

- `router.py` traite HTTP et délègue le travail ;
- `schemas.py` valide les payloads Pydantic ;
- `service.py` contient les règles métier et les transactions ;
- `repository.py` est le seul emplacement autorisé à exécuter les requêtes SQL ;
- `integrations/` définit les adaptateurs vers les services externes ;
- `workers/` contient les points d’entrée des tâches asynchrones.

Les modules `health` et `dashboard` complètent la liste métier demandée, car ils
sont nécessaires aux contrats déjà utilisés par le frontend.

## Démarrage avec Docker

```powershell
cd backend
Copy-Item .env.example .env
docker compose up --build
```

Le service `api` attend PostgreSQL, applique `alembic upgrade head`, puis lance
FastAPI sur `http://localhost:3001`. La documentation OpenAPI est disponible sur
`http://localhost:3001/docs`.

## Démarrage local

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e ".[dev]"
alembic upgrade head
python -m uvicorn eduos.main:app --app-dir src --reload --port 3001
```

## Tests

```powershell
cd backend
python -m pytest
```

## Google Drive pour les ressources pédagogiques

Les fichiers ajoutés par un formateur sont conservés dans un dossier Google
Drive privé. EDUOS enregistre seulement l'identifiant Drive en base et contrôle
la cohorte avant chaque téléchargement : un participant doit avoir une
inscription confirmée dans le groupe de la ressource.

1. Créer un compte de service Google Cloud et activer Google Drive API.
2. Créer un dossier dans un Shared Drive et donner au compte de service le rôle
   de gestionnaire de contenu sur ce dossier.
3. Renseigner `GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE` et
   `GOOGLE_DRIVE_FOLDER_ID` dans `.env`.
4. Installer les dépendances avec `pip install -e ".[dev]"`, puis redémarrer
   l'API.

La limite par défaut est de 50 Mo et peut être ajustée avec
`GOOGLE_DRIVE_MAX_UPLOAD_MB`.

Le JSON du compte de service ne doit jamais être versionné. Avec Docker,
montez-le en lecture seule dans le conteneur et utilisez son chemin interne dans
`GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE`.

### Compte Google sans Drive partagé

Dans ce cas, EDUOS utilise OAuth avec le scope limité `drive.file`. Créez un
client OAuth de type **Application Web** dans Google Cloud avec cette URI de
redirection autorisée :

```text
http://localhost:3001/api/personnel/resources/google/callback
```

Téléchargez le JSON du client dans `backend/secrets`, puis renseignez son chemin
dans `GOOGLE_DRIVE_OAUTH_CLIENT_FILE`. Le formateur pourra ensuite cliquer sur
« Connecter Google Drive ». Le jeton de renouvellement est chiffré dans
PostgreSQL et EDUOS crée son propre dossier dans « Mon Drive ».

## Scripts

Après installation du projet :

```powershell
python scripts\seed.py
python scripts\create_admin.py --email admin@eduos.ma --nom Admin --prenom EDUOS
```

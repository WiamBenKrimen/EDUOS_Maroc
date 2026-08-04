# Base PostgreSQL EDUOS

Ce dossier couvre l’administration EDUOS, les centres, le **directeur**, le
**personnel** et le **participant**. Le schéma PostgreSQL est utilisé par la
migration Alembic initiale du backend FastAPI.

Le personnel possède une fonction métier : **coordinateur**, **commercial**, **formateur** ou **enseignant**. Le directeur cumule et supervise toutes leurs permissions.

Le schéma cible **PostgreSQL 15 ou supérieur** (`UNIQUE NULLS NOT DISTINCT`) et active les extensions `pgcrypto` et `citext`.

## Installation

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python scripts\seed.py
```

Le seeder peut être rejoué en développement : il vide toutes les tables avant les insertions. **Ne jamais l’exécuter sur une base de production.**

## Compte de démonstration

- Administrateur : `admin@eduos.ma`
- Directeur : `directeur@eduos.ma`
- Coordinateur : `coordinateur@eduos.ma`
- Commercial : `commercial@eduos.ma`
- Formateur : `formateur@eduos.ma`
- Enseignant : `enseignant@eduos.ma`
- Participant : `participant@eduos.ma`
- Mot de passe commun : `demo1234`

Les mots de passe sont stockés avec `crypt(..., gen_salt('bf'))` fourni par l’extension PostgreSQL `pgcrypto`.

## Domaines couverts

- centres et utilisateurs ;
- candidatures des centres, décisions administrateur et création du directeur ;
- prospects et inscriptions ;
- formations, cohortes, séances et présences ;
- factures, paiements, moyens de paiement et relances ;
- intervenants pédagogiques et rémunérations ;
- documents et ressources pédagogiques ;
- évaluations, questions, tentatives et réponses ;
- notes sur 20, coefficients et appréciations des étudiants ;
- rapports de suivi et compétences ;
- notifications et tickets de support ;
- renouvellements ;
- affectation des séances aux opérateurs et demandes de changement ;
- les formateurs et enseignants reliés à leur compte Personnel.

## Garanties d’intégrité

- l’administrateur EDUOS est global et n’appartient à aucun centre ;
- tous les autres utilisateurs appartiennent obligatoirement à un centre ;
- seul l’administrateur peut accepter ou refuser une candidature ;
- le directeur peut créer le personnel et les participants de son centre ;
- le coordinateur peut créer uniquement des participants, formateurs et enseignants de son centre ;
- chaque compte Personnel possède exactement une fonction métier ;
- les profils participants doivent référencer un utilisateur du rôle correspondant ;
- une séance, son formateur et son opérateur doivent appartenir au même centre ;
- les dates, horaires, montants, remises, notes et progressions sont contrôlés en base ;
- une seule demande de changement en attente est autorisée par séance et opérateur ;
- les réponses d’évaluation ne peuvent pas utiliser une question ou une option provenant d’une autre évaluation ;
- les colonnes `updated_at` concernées sont maintenues automatiquement ;
- les clés étrangères utilisées dans les parcours principaux sont indexées.

## Sécurité applicative

Le schéma garantit l’intégrité structurelle, mais l’API doit encore :

- authentifier chaque requête ;
- appliquer les permissions définies par l’application ;
- filtrer toutes les requêtes métier par `centre_id` ;
- ne jamais renvoyer `password_hash`, `secret_reference` ou les secrets d’intégration ;
- journaliser les opérations sensibles dans le service applicatif prévu à cet effet.

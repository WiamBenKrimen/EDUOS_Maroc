# Base PostgreSQL EDUOS

Ce dossier couvre les espaces **directeur**, **opérateur**, **participant** et **formateur**. Le rôle administrateur est volontairement absent.

## Installation

```bash
createdb eduos
psql -d eduos -f database/schema.sql
psql -d eduos -f database/seed.sql
```

Le seeder peut être rejoué : il vide les tables métier avant les insertions.

## Compte de démonstration

- Directeur : `directeur@eduos.ma`
- Opérateur : `operateur@eduos.ma`
- Participant : `participant@eduos.ma`
- Formateur : `k.alaoui@eduos.ma`
- Mot de passe commun : `demo1234`

Les mots de passe sont stockés avec `crypt(..., gen_salt('bf'))` fourni par l’extension PostgreSQL `pgcrypto`.

## Domaines couverts

- centres et utilisateurs ;
- prospects et inscriptions ;
- formations, cohortes, séances et présences ;
- factures, paiements, moyens de paiement et relances ;
- formateurs et rémunérations ;
- documents et ressources pédagogiques ;
- évaluations, questions, tentatives et réponses ;
- rapports de suivi et compétences ;
- notifications et tickets de support ;
- renouvellements.

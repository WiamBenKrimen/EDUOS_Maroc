-- EDUOS MAROC — PostgreSQL schema
-- Scope: directeur, opérateur, participant and formateur. No admin role.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('directeur', 'operateur', 'participant', 'formateur');
CREATE TYPE record_status AS ENUM ('actif', 'inactif', 'archive');
CREATE TYPE prospect_status AS ENUM ('nouveau', 'en_cours', 'inscrit', 'perdu');
CREATE TYPE enrollment_status AS ENUM ('brouillon', 'confirmee', 'suspendue', 'terminee', 'annulee');
CREATE TYPE session_status AS ENUM ('planifiee', 'terminee', 'annulee', 'reportee');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'retard', 'excuse');
CREATE TYPE payment_status AS ENUM ('en_attente', 'paye', 'en_retard', 'annule', 'rembourse');
CREATE TYPE payment_method AS ENUM ('carte', 'virement', 'especes', 'cheque', 'tpe');
CREATE TYPE document_type AS ENUM ('contrat', 'attestation', 'certificat', 'recu', 'facture', 'inscription', 'identite', 'programme', 'reglement', 'autre');
CREATE TYPE resource_type AS ENUM ('dossier', 'pdf', 'video', 'document', 'exercice', 'qcm');
CREATE TYPE notification_category AS ENUM ('cours', 'paiement', 'ressource', 'document', 'rapport', 'systeme');
CREATE TYPE ticket_status AS ENUM ('ouvert', 'en_cours', 'resolu', 'ferme');
CREATE TYPE renewal_status AS ENUM ('a_venir', 'contacte', 'renouvele', 'perdu');

CREATE TABLE centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(30) NOT NULL UNIQUE,
  nom varchar(150) NOT NULL,
  adresse text,
  ville varchar(80) NOT NULL,
  telephone varchar(30),
  email citext,
  devise char(3) NOT NULL DEFAULT 'MAD',
  timezone varchar(60) NOT NULL DEFAULT 'Africa/Casablanca',
  statut record_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  nom varchar(80) NOT NULL,
  prenom varchar(80) NOT NULL,
  email citext NOT NULL UNIQUE,
  telephone varchar(30),
  password_hash text NOT NULL,
  avatar_url text,
  email_notifications boolean NOT NULL DEFAULT true,
  course_reminders boolean NOT NULL DEFAULT true,
  statut record_status NOT NULL DEFAULT 'actif',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  nom_complet varchar(160) NOT NULL,
  email citext,
  telephone varchar(30),
  formation_souhaitee varchar(160),
  source varchar(80),
  statut prospect_status NOT NULL DEFAULT 'nouveau',
  notes text,
  contacted_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  matricule varchar(40) NOT NULL UNIQUE,
  date_naissance date,
  adresse text,
  ville varchar(80),
  cin varchar(40),
  contact_urgence_nom varchar(160),
  contact_urgence_tel varchar(30),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE formateurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  code varchar(40) NOT NULL UNIQUE,
  specialite varchar(180) NOT NULL,
  taux_horaire numeric(10,2) NOT NULL CHECK (taux_horaire >= 0),
  note numeric(2,1) CHECK (note BETWEEN 0 AND 5),
  bio text,
  statut record_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE formations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  code varchar(40) NOT NULL,
  titre varchar(180) NOT NULL,
  categorie varchar(100),
  niveau varchar(60),
  description text,
  duree_heures integer NOT NULL DEFAULT 0 CHECK (duree_heures >= 0),
  prix_mensuel numeric(10,2) NOT NULL CHECK (prix_mensuel >= 0),
  frais_inscription numeric(10,2) NOT NULL DEFAULT 0 CHECK (frais_inscription >= 0),
  statut record_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (centre_id, code)
);

CREATE TABLE cohortes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL REFERENCES formations(id) ON DELETE RESTRICT,
  formateur_id uuid REFERENCES formateurs(id) ON DELETE SET NULL,
  code varchar(50) NOT NULL UNIQUE,
  nom varchar(160) NOT NULL,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  capacite integer NOT NULL CHECK (capacite > 0),
  salle varchar(80),
  jours_semaine smallint[] NOT NULL DEFAULT '{}',
  heure_debut time,
  heure_fin time,
  statut record_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (date_fin >= date_debut)
);

CREATE TABLE inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  cohorte_id uuid NOT NULL REFERENCES cohortes(id) ON DELETE RESTRICT,
  prospect_id uuid UNIQUE REFERENCES prospects(id) ON DELETE SET NULL,
  reference varchar(50) NOT NULL UNIQUE,
  date_inscription date NOT NULL DEFAULT CURRENT_DATE,
  date_debut date NOT NULL,
  date_fin_prevue date,
  montant_mensuel numeric(10,2) NOT NULL CHECK (montant_mensuel >= 0),
  remise numeric(10,2) NOT NULL DEFAULT 0 CHECK (remise >= 0),
  statut enrollment_status NOT NULL DEFAULT 'confirmee',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_id, cohorte_id)
);

CREATE TABLE seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohorte_id uuid NOT NULL REFERENCES cohortes(id) ON DELETE CASCADE,
  formateur_id uuid REFERENCES formateurs(id) ON DELETE SET NULL,
  titre varchar(180) NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  salle varchar(80),
  statut session_status NOT NULL DEFAULT 'planifiee',
  qr_token varchar(120) UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE presences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id uuid NOT NULL REFERENCES seances(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  statut attendance_status NOT NULL,
  check_in_at timestamptz,
  justification text,
  validated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  validated_at timestamptz,
  UNIQUE (seance_id, participant_id)
);

CREATE TABLE factures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE RESTRICT,
  numero varchar(50) NOT NULL UNIQUE,
  periode date NOT NULL,
  date_emission date NOT NULL DEFAULT CURRENT_DATE,
  date_echeance date NOT NULL,
  montant_ht numeric(10,2) NOT NULL CHECK (montant_ht >= 0),
  taxe numeric(10,2) NOT NULL DEFAULT 0 CHECK (taxe >= 0),
  montant_ttc numeric(10,2) GENERATED ALWAYS AS (montant_ht + taxe) STORED,
  statut payment_status NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inscription_id, periode)
);

CREATE TABLE paiements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid NOT NULL REFERENCES factures(id) ON DELETE RESTRICT,
  reference varchar(60) NOT NULL UNIQUE,
  montant numeric(10,2) NOT NULL CHECK (montant > 0),
  methode payment_method NOT NULL,
  statut payment_status NOT NULL DEFAULT 'paye',
  transaction_ref varchar(120),
  paid_at timestamptz,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE moyens_paiement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  methode payment_method NOT NULL,
  libelle varchar(100) NOT NULL,
  instructions text,
  coordonnees jsonb NOT NULL DEFAULT '{}',
  actif boolean NOT NULL DEFAULT true,
  ordre smallint NOT NULL DEFAULT 0,
  UNIQUE (centre_id, methode)
);

CREATE TABLE relance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  titre varchar(180) NOT NULL,
  offset_days integer NOT NULL,
  canal varchar(40) NOT NULL,
  message_template text NOT NULL,
  actif boolean NOT NULL DEFAULT true
);

CREATE TABLE relances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id uuid NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES relance_rules(id) ON DELETE SET NULL,
  canal varchar(40) NOT NULL,
  destinataire varchar(180),
  contenu text NOT NULL,
  sent_at timestamptz,
  statut varchar(30) NOT NULL DEFAULT 'planifiee'
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  inscription_id uuid REFERENCES inscriptions(id) ON DELETE SET NULL,
  facture_id uuid REFERENCES factures(id) ON DELETE SET NULL,
  type document_type NOT NULL,
  nom varchar(255) NOT NULL,
  storage_key text NOT NULL UNIQUE,
  mime_type varchar(120) NOT NULL,
  taille_octets bigint CHECK (taille_octets >= 0),
  visible_participant boolean NOT NULL DEFAULT true,
  genere_automatiquement boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ressources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  formation_id uuid REFERENCES formations(id) ON DELETE CASCADE,
  cohorte_id uuid REFERENCES cohortes(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES ressources(id) ON DELETE CASCADE,
  type resource_type NOT NULL,
  titre varchar(200) NOT NULL,
  description text,
  storage_key text,
  mime_type varchar(120),
  taille_octets bigint CHECK (taille_octets >= 0),
  duree_minutes integer CHECK (duree_minutes >= 0),
  semaine smallint CHECK (semaine > 0),
  publie boolean NOT NULL DEFAULT false,
  nouveau boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE resource_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  progression smallint NOT NULL DEFAULT 0 CHECK (progression BETWEEN 0 AND 100),
  completed_at timestamptz,
  last_opened_at timestamptz,
  UNIQUE (resource_id, participant_id)
);

CREATE TABLE evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohorte_id uuid NOT NULL REFERENCES cohortes(id) ON DELETE CASCADE,
  titre varchar(200) NOT NULL,
  description text,
  duree_minutes integer NOT NULL CHECK (duree_minutes > 0),
  score_max numeric(8,2) NOT NULL DEFAULT 100,
  publiee boolean NOT NULL DEFAULT false,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  texte text NOT NULL,
  ordre smallint NOT NULL,
  points numeric(6,2) NOT NULL DEFAULT 1 CHECK (points > 0),
  UNIQUE (evaluation_id, ordre)
);

CREATE TABLE question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  texte text NOT NULL,
  correcte boolean NOT NULL DEFAULT false,
  ordre smallint NOT NULL,
  UNIQUE (question_id, ordre)
);

CREATE TABLE evaluation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score numeric(8,2),
  UNIQUE (evaluation_id, participant_id)
);

CREATE TABLE evaluation_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES evaluation_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES question_options(id) ON DELETE SET NULL,
  correcte boolean,
  points_obtenus numeric(6,2) NOT NULL DEFAULT 0,
  UNIQUE (attempt_id, question_id)
);

CREATE TABLE rapports_suivi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  formateur_id uuid REFERENCES formateurs(id) ON DELETE SET NULL,
  periode date NOT NULL,
  score_global numeric(5,2) NOT NULL CHECK (score_global BETWEEN 0 AND 100),
  taux_presence numeric(5,2) NOT NULL CHECK (taux_presence BETWEEN 0 AND 100),
  appreciation text,
  publie_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inscription_id, periode)
);

CREATE TABLE rapport_competences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rapport_id uuid NOT NULL REFERENCES rapports_suivi(id) ON DELETE CASCADE,
  competence varchar(120) NOT NULL,
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  commentaire text,
  UNIQUE (rapport_id, competence)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categorie notification_category NOT NULL,
  titre varchar(180) NOT NULL,
  message text NOT NULL,
  action_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES participants(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  sujet varchar(200) NOT NULL,
  statut ticket_status NOT NULL DEFAULT 'ouvert',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE renouvellements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  nouvelle_cohorte_id uuid REFERENCES cohortes(id) ON DELETE SET NULL,
  date_expiration date NOT NULL,
  statut renewal_status NOT NULL DEFAULT 'a_venir',
  remise_proposee numeric(5,2) NOT NULL DEFAULT 0,
  contacted_at timestamptz,
  renewed_at timestamptz,
  notes text
);

CREATE TABLE remunerations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES formateurs(id) ON DELETE CASCADE,
  periode date NOT NULL,
  heures numeric(8,2) NOT NULL CHECK (heures >= 0),
  taux_horaire numeric(10,2) NOT NULL CHECK (taux_horaire >= 0),
  montant_total numeric(12,2) GENERATED ALWAYS AS (heures * taux_horaire) STORED,
  statut payment_status NOT NULL DEFAULT 'en_attente',
  paid_at timestamptz,
  UNIQUE (formateur_id, periode)
);

CREATE INDEX idx_users_centre_role ON users(centre_id, role);
CREATE INDEX idx_prospects_centre_status ON prospects(centre_id, statut);
CREATE INDEX idx_inscriptions_participant ON inscriptions(participant_id, statut);
CREATE INDEX idx_cohortes_formation ON cohortes(formation_id, statut);
CREATE INDEX idx_seances_cohorte_date ON seances(cohorte_id, starts_at);
CREATE INDEX idx_presences_participant ON presences(participant_id, statut);
CREATE INDEX idx_factures_status_due ON factures(statut, date_echeance);
CREATE INDEX idx_paiements_facture ON paiements(facture_id, paid_at DESC);
CREATE INDEX idx_documents_participant ON documents(participant_id, type, created_at DESC);
CREATE INDEX idx_ressources_formation ON ressources(formation_id, type, publie);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_rapports_inscription ON rapports_suivi(inscription_id, periode DESC);
CREATE INDEX idx_tickets_centre_status ON tickets(centre_id, statut, updated_at DESC);

COMMIT;

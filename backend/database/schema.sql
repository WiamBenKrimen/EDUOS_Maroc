-- EDUOS MAROC — PostgreSQL schema
-- Scope: administration EDUOS, centres, directeur, personnel and participant.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('admin', 'directeur', 'personnel', 'participant');
CREATE TYPE personnel_function AS ENUM ('coordinateur', 'commercial', 'formateur', 'enseignant');
CREATE TYPE candidature_status AS ENUM ('en_attente', 'acceptee', 'refusee');
CREATE TYPE note_type AS ENUM ('controle', 'examen', 'devoir', 'oral', 'projet', 'autre');
CREATE TYPE record_status AS ENUM ('actif', 'inactif', 'archive');
CREATE TYPE prospect_status AS ENUM ('nouveau', 'en_cours', 'inscrit', 'perdu');
CREATE TYPE enrollment_status AS ENUM ('brouillon', 'confirmee', 'suspendue', 'terminee', 'annulee');
CREATE TYPE session_status AS ENUM ('planifiee', 'terminee', 'annulee', 'reportee');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'retard', 'excuse');
CREATE TYPE invoice_status AS ENUM ('brouillon', 'emise', 'en_attente', 'partiellement_payee', 'payee', 'en_retard', 'annulee');
CREATE TYPE payment_status AS ENUM ('en_attente', 'paye', 'echoue', 'annule', 'rembourse', 'partiellement_rembourse');
CREATE TYPE remuneration_status AS ENUM ('en_attente', 'calculee', 'validee', 'payee', 'annulee');
CREATE TYPE payment_method AS ENUM ('carte', 'virement', 'especes', 'cheque', 'tpe');
CREATE TYPE document_type AS ENUM ('contrat', 'attestation', 'certificat', 'recu', 'facture', 'inscription', 'identite', 'programme', 'reglement', 'autre');
CREATE TYPE resource_type AS ENUM ('dossier', 'pdf', 'video', 'document', 'exercice', 'qcm');
CREATE TYPE notification_category AS ENUM ('cours', 'paiement', 'ressource', 'document', 'rapport', 'systeme');
CREATE TYPE ticket_status AS ENUM ('ouvert', 'en_cours', 'resolu', 'ferme');
CREATE TYPE renewal_status AS ENUM ('a_venir', 'contacte', 'renouvele', 'perdu');
CREATE TYPE change_request_status AS ENUM ('en_attente', 'approuvee', 'refusee', 'annulee');

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
  centre_id uuid REFERENCES centres(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  personnel_fonction personnel_function,
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
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (role = 'personnel' AND personnel_fonction IS NOT NULL)
    OR (role <> 'personnel' AND personnel_fonction IS NULL)
  ),
  CHECK (
    (role = 'admin' AND centre_id IS NULL)
    OR (role <> 'admin' AND centre_id IS NOT NULL)
  )
);

CREATE TABLE candidatures_centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference varchar(40) NOT NULL UNIQUE,
  centre_nom varchar(150) NOT NULL,
  responsable_nom varchar(160) NOT NULL,
  telephone varchar(30) NOT NULL,
  email citext,
  ville varchar(80) NOT NULL,
  taille_apprenants varchar(60),
  besoins text[] NOT NULL DEFAULT '{}',
  remarques text,
  statut candidature_status NOT NULL DEFAULT 'en_attente',
  motif_refus text,
  processed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  processed_at timestamptz,
  centre_created_id uuid REFERENCES centres(id) ON DELETE SET NULL,
  directeur_created_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (statut = 'en_attente' AND processed_by IS NULL AND processed_at IS NULL)
    OR (statut <> 'en_attente' AND processed_by IS NOT NULL AND processed_at IS NOT NULL)
  ),
  CHECK (
    statut <> 'acceptee'
    OR (centre_created_id IS NOT NULL AND directeur_created_id IS NOT NULL)
  ),
  CHECK (statut <> 'refusee' OR motif_refus IS NOT NULL)
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
  cin varchar(40) UNIQUE,
  contact_urgence_nom varchar(160),
  contact_urgence_tel varchar(30),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE intervenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  centre_id uuid NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  fonction personnel_function NOT NULL CHECK (fonction IN ('formateur', 'enseignant')),
  code varchar(40) NOT NULL,
  specialite varchar(180) NOT NULL,
  taux_horaire numeric(10,2) NOT NULL CHECK (taux_horaire >= 0),
  note numeric(2,1) CHECK (note BETWEEN 0 AND 5),
  bio text,
  statut record_status NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (centre_id, code)
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
  intervenant_id uuid REFERENCES intervenants(id) ON DELETE SET NULL,
  code varchar(50) NOT NULL,
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
  CHECK (date_fin >= date_debut),
  CHECK (heure_fin IS NULL OR heure_debut IS NULL OR heure_fin > heure_debut),
  CHECK (jours_semaine <@ ARRAY[1,2,3,4,5,6,7]::smallint[]),
  UNIQUE (formation_id, code)
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
  CHECK (date_fin_prevue IS NULL OR date_fin_prevue >= date_debut),
  CHECK (remise <= montant_mensuel),
  UNIQUE (participant_id, cohorte_id)
);

CREATE TABLE seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohorte_id uuid NOT NULL REFERENCES cohortes(id) ON DELETE CASCADE,
  intervenant_id uuid REFERENCES intervenants(id) ON DELETE SET NULL,
  personnel_id uuid REFERENCES users(id) ON DELETE SET NULL,
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

CREATE TABLE demandes_changement_seance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id uuid NOT NULL REFERENCES seances(id) ON DELETE CASCADE,
  personnel_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  starts_at_souhaite timestamptz NOT NULL,
  ends_at_souhaite timestamptz NOT NULL,
  motif text,
  statut change_request_status NOT NULL DEFAULT 'en_attente',
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at_souhaite > starts_at_souhaite),
  CHECK (
    (statut = 'en_attente' AND decided_by IS NULL AND decided_at IS NULL)
    OR (statut <> 'en_attente' AND decided_by IS NOT NULL AND decided_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX uq_demandes_changement_en_attente
  ON demandes_changement_seance(seance_id, personnel_id)
  WHERE statut = 'en_attente';

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
  statut invoice_status NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (date_echeance >= date_emission),
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
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((statut = 'paye' AND paid_at IS NOT NULL) OR statut <> 'paye')
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
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (score_max > 0),
  CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at > opens_at)
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
  CHECK (submitted_at IS NULL OR submitted_at >= started_at),
  CHECK (score IS NULL OR score >= 0),
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

CREATE TABLE notes_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  intervenant_id uuid NOT NULL REFERENCES intervenants(id) ON DELETE RESTRICT,
  type note_type NOT NULL,
  libelle varchar(160) NOT NULL,
  note numeric(5,2) NOT NULL CHECK (note BETWEEN 0 AND 20),
  coefficient numeric(5,2) NOT NULL DEFAULT 1 CHECK (coefficient > 0),
  appreciation text,
  date_evaluation date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inscription_id, type, libelle, date_evaluation)
);

CREATE TABLE rapports_suivi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  intervenant_id uuid REFERENCES intervenants(id) ON DELETE SET NULL,
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
  notes text,
  CHECK (remise_proposee BETWEEN 0 AND 100),
  CHECK (renewed_at IS NULL OR statut = 'renouvele'),
  UNIQUE (inscription_id, date_expiration)
);

CREATE TABLE remunerations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervenant_id uuid NOT NULL REFERENCES intervenants(id) ON DELETE CASCADE,
  periode date NOT NULL,
  heures numeric(8,2) NOT NULL CHECK (heures >= 0),
  taux_horaire numeric(10,2) NOT NULL CHECK (taux_horaire >= 0),
  montant_total numeric(12,2) GENERATED ALWAYS AS (heures * taux_horaire) STORED,
  statut remuneration_status NOT NULL DEFAULT 'en_attente',
  paid_at timestamptz,
  CHECK ((statut = 'payee' AND paid_at IS NOT NULL) OR statut <> 'payee'),
  UNIQUE (intervenant_id, periode)
);

CREATE OR REPLACE FUNCTION validate_account_creator()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  creator_role user_role;
  creator_function personnel_function;
  creator_centre uuid;
BEGIN
  IF NEW.created_by IS NULL THEN
    IF NEW.role <> 'admin' THEN
      RAISE EXCEPTION 'only the initial admin account may be created without created_by';
    END IF;
    RETURN NEW;
  END IF;

  SELECT role, personnel_fonction, centre_id
    INTO creator_role, creator_function, creator_centre
  FROM users
  WHERE id = NEW.created_by AND statut = 'actif';

  IF creator_role IS NULL THEN
    RAISE EXCEPTION 'account creator must be an active user';
  END IF;

  IF creator_role = 'admin' THEN
    IF NEW.role NOT IN ('admin', 'directeur') THEN
      RAISE EXCEPTION 'admin may create only admin or directeur accounts';
    END IF;
  ELSIF creator_role = 'directeur' THEN
    IF NEW.centre_id <> creator_centre OR NEW.role NOT IN ('personnel', 'participant') THEN
      RAISE EXCEPTION 'directeur may create personnel or participant accounts in the same centre';
    END IF;
  ELSIF creator_role = 'personnel' AND creator_function = 'coordinateur' THEN
    IF NEW.centre_id <> creator_centre OR NOT (
      NEW.role = 'participant'
      OR (
        NEW.role = 'personnel'
        AND NEW.personnel_fonction IN ('formateur', 'enseignant')
      )
    ) THEN
      RAISE EXCEPTION 'coordinateur may create participants, formateurs and enseignants in the same centre';
    END IF;
  ELSE
    RAISE EXCEPTION 'this user cannot create accounts';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_validate_creator
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION validate_account_creator();

CREATE OR REPLACE FUNCTION validate_candidature_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  processor_role user_role;
  director_role user_role;
  director_centre uuid;
BEGIN
  IF NEW.statut = 'en_attente' THEN
    RETURN NEW;
  END IF;

  SELECT role INTO processor_role FROM users WHERE id = NEW.processed_by;
  IF processor_role <> 'admin' THEN
    RAISE EXCEPTION 'only an admin may accept or reject a centre application';
  END IF;

  IF NEW.statut = 'acceptee' THEN
    SELECT role, centre_id INTO director_role, director_centre
    FROM users WHERE id = NEW.directeur_created_id;
    IF director_role <> 'directeur' OR director_centre <> NEW.centre_created_id THEN
      RAISE EXCEPTION 'accepted application must reference its centre director';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_candidatures_validate_decision
BEFORE INSERT OR UPDATE OF statut, processed_by, centre_created_id, directeur_created_id
ON candidatures_centres
FOR EACH ROW EXECUTE FUNCTION validate_candidature_decision();

CREATE OR REPLACE FUNCTION validate_profile_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_role user_role;
  linked_function personnel_function;
  linked_centre uuid;
BEGIN
  SELECT role, personnel_fonction, centre_id INTO linked_role, linked_function, linked_centre
  FROM users
  WHERE id = NEW.user_id;

  IF TG_TABLE_NAME = 'participants' AND linked_role <> 'participant' THEN
    RAISE EXCEPTION 'participant.user_id must reference a participant user';
  END IF;

  IF TG_TABLE_NAME = 'intervenants' THEN
    IF linked_role <> 'personnel' OR linked_function NOT IN ('formateur', 'enseignant') THEN
      RAISE EXCEPTION 'intervenant.user_id must reference pedagogical personnel';
    END IF;
    IF linked_function <> NEW.fonction OR linked_centre <> NEW.centre_id THEN
      RAISE EXCEPTION 'intervenant profile must match the user function and centre';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_participants_validate_user
BEFORE INSERT OR UPDATE OF user_id ON participants
FOR EACH ROW EXECUTE FUNCTION validate_profile_user();

CREATE TRIGGER trg_intervenants_validate_user
BEFORE INSERT OR UPDATE OF user_id, centre_id, fonction ON intervenants
FOR EACH ROW WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION validate_profile_user();

CREATE OR REPLACE FUNCTION validate_participant_note()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assigned_intervenant uuid;
  intervenant_user uuid;
  creator_role user_role;
BEGIN
  SELECT c.intervenant_id INTO assigned_intervenant
  FROM inscriptions i
  JOIN cohortes c ON c.id = i.cohorte_id
  WHERE i.id = NEW.inscription_id;

  IF assigned_intervenant IS DISTINCT FROM NEW.intervenant_id THEN
    RAISE EXCEPTION 'participant note must be entered by the assigned intervenant';
  END IF;

  SELECT user_id INTO intervenant_user
  FROM intervenants WHERE id = NEW.intervenant_id;
  SELECT role INTO creator_role FROM users WHERE id = NEW.created_by;

  IF NEW.created_by IS DISTINCT FROM intervenant_user AND creator_role <> 'directeur' THEN
    RAISE EXCEPTION 'only the assigned intervenant or centre director may enter this note';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notes_participants_validate
BEFORE INSERT OR UPDATE OF inscription_id, intervenant_id, created_by
ON notes_participants
FOR EACH ROW EXECUTE FUNCTION validate_participant_note();

CREATE OR REPLACE FUNCTION validate_seance_assignments()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  session_centre uuid;
  trainer_centre uuid;
  assigned_centre uuid;
  assigned_role user_role;
  assigned_function personnel_function;
BEGIN
  SELECT f.centre_id INTO session_centre
  FROM cohortes c
  JOIN formations f ON f.id = c.formation_id
  WHERE c.id = NEW.cohorte_id;

  IF NEW.intervenant_id IS NOT NULL THEN
    SELECT centre_id INTO trainer_centre FROM intervenants WHERE id = NEW.intervenant_id;
    IF trainer_centre <> session_centre THEN
      RAISE EXCEPTION 'session and intervenant must belong to the same centre';
    END IF;
  END IF;

  IF NEW.personnel_id IS NOT NULL THEN
    SELECT centre_id, role, personnel_fonction
      INTO assigned_centre, assigned_role, assigned_function
    FROM users WHERE id = NEW.personnel_id;
    IF assigned_centre <> session_centre
       OR NOT (
         assigned_role = 'directeur'
         OR (assigned_role = 'personnel' AND assigned_function = 'coordinateur')
       ) THEN
      RAISE EXCEPTION 'session coordinator must be a director or coordinator from the same centre';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seances_validate_assignments
BEFORE INSERT OR UPDATE OF cohorte_id, intervenant_id, personnel_id ON seances
FOR EACH ROW EXECUTE FUNCTION validate_seance_assignments();

CREATE OR REPLACE FUNCTION validate_session_change_request()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assigned_operator uuid;
BEGIN
  SELECT personnel_id INTO assigned_operator
  FROM seances
  WHERE id = NEW.seance_id;

  IF assigned_operator IS NULL OR assigned_operator <> NEW.personnel_id THEN
    RAISE EXCEPTION 'change request operator must be assigned to the session';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_demandes_changement_validate
BEFORE INSERT OR UPDATE OF seance_id, personnel_id ON demandes_changement_seance
FOR EACH ROW EXECUTE FUNCTION validate_session_change_request();

CREATE OR REPLACE FUNCTION validate_evaluation_answer()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  attempt_evaluation uuid;
  question_evaluation uuid;
  option_question uuid;
BEGIN
  SELECT evaluation_id INTO attempt_evaluation
  FROM evaluation_attempts WHERE id = NEW.attempt_id;
  SELECT evaluation_id INTO question_evaluation
  FROM questions WHERE id = NEW.question_id;

  IF attempt_evaluation <> question_evaluation THEN
    RAISE EXCEPTION 'answer question must belong to the attempted evaluation';
  END IF;

  IF NEW.option_id IS NOT NULL THEN
    SELECT question_id INTO option_question
    FROM question_options WHERE id = NEW.option_id;
    IF option_question <> NEW.question_id THEN
      RAISE EXCEPTION 'answer option must belong to the answered question';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluation_answers_validate
BEFORE INSERT OR UPDATE OF attempt_id, question_id, option_id ON evaluation_answers
FOR EACH ROW EXECUTE FUNCTION validate_evaluation_answer();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_centres_updated_at BEFORE UPDATE ON centres
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_candidatures_centres_updated_at BEFORE UPDATE ON candidatures_centres
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prospects_updated_at BEFORE UPDATE ON prospects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_intervenants_updated_at BEFORE UPDATE ON intervenants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notes_participants_updated_at BEFORE UPDATE ON notes_participants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_users_centre_role ON users(centre_id, role);
CREATE INDEX idx_users_status ON users(statut);
CREATE INDEX idx_users_created_by ON users(created_by);
CREATE INDEX idx_candidatures_status_date ON candidatures_centres(statut, created_at DESC);
CREATE INDEX idx_candidatures_processed_by ON candidatures_centres(processed_by);
CREATE INDEX idx_prospects_centre_status ON prospects(centre_id, statut);
CREATE INDEX idx_prospects_assigned_to ON prospects(assigned_to);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_inscriptions_participant ON inscriptions(participant_id, statut);
CREATE INDEX idx_inscriptions_cohorte ON inscriptions(cohorte_id, statut);
CREATE INDEX idx_inscriptions_created_by ON inscriptions(created_by);
CREATE INDEX idx_cohortes_formation ON cohortes(formation_id, statut);
CREATE INDEX idx_cohortes_intervenant ON cohortes(intervenant_id);
CREATE INDEX idx_seances_cohorte_date ON seances(cohorte_id, starts_at);
CREATE INDEX idx_seances_intervenant_date ON seances(intervenant_id, starts_at);
CREATE INDEX idx_seances_personnel_date ON seances(personnel_id, starts_at);
CREATE INDEX idx_demandes_changement_statut ON demandes_changement_seance(statut, created_at);
CREATE INDEX idx_presences_participant ON presences(participant_id, statut);
CREATE INDEX idx_presences_validated_by ON presences(validated_by);
CREATE INDEX idx_factures_status_due ON factures(statut, date_echeance);
CREATE INDEX idx_paiements_facture ON paiements(facture_id, paid_at DESC);
CREATE INDEX idx_paiements_recorded_by ON paiements(recorded_by);
CREATE INDEX idx_documents_participant ON documents(participant_id, type, created_at DESC);
CREATE INDEX idx_documents_inscription ON documents(inscription_id);
CREATE INDEX idx_documents_facture ON documents(facture_id);
CREATE INDEX idx_ressources_formation ON ressources(formation_id, type, publie);
CREATE INDEX idx_ressources_cohorte ON ressources(cohorte_id, type, publie);
CREATE INDEX idx_ressources_parent ON ressources(parent_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_rapports_inscription ON rapports_suivi(inscription_id, periode DESC);
CREATE INDEX idx_notes_inscription_date ON notes_participants(inscription_id, date_evaluation DESC);
CREATE INDEX idx_notes_intervenant_date ON notes_participants(intervenant_id, date_evaluation DESC);
CREATE INDEX idx_tickets_centre_status ON tickets(centre_id, statut, updated_at DESC);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);

COMMIT;

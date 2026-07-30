-- EDUOS MAROC — development seed
-- Password for every seeded user: demo1234
-- bcrypt hash below is compatible with PostgreSQL crypt()/gen_salt('bf').

BEGIN;

TRUNCATE TABLE
  notes_participants, candidatures_centres,
  demandes_changement_seance,
  evaluation_answers, evaluation_attempts, question_options, questions, evaluations,
  resource_progress, ressources, rapport_competences, rapports_suivi,
  ticket_messages, tickets, notifications, documents, relances, relance_rules,
  paiements, factures, presences, seances, renouvellements, remunerations,
  inscriptions, cohortes, formations, intervenants, participants, prospects,
  moyens_paiement, users, centres
RESTART IDENTITY CASCADE;

INSERT INTO centres (id, code, nom, adresse, ville, telephone, email)
VALUES ('00000000-0000-0000-0000-000000000001','RABAT-HASSAN','EDUOS Maroc — Rabat Hassan','12 avenue Mohammed V, Hassan','Rabat','+212 5 37 00 00 00','contact@eduos.ma');

INSERT INTO users (id, centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash, created_by)
VALUES ('f0000000-0000-0000-0000-000000000001',NULL,'admin',NULL,'EDUOS','Admin','admin@eduos.ma','+212 5 00 00 00 00',crypt('demo1234',gen_salt('bf')),NULL);

INSERT INTO users (id, centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash, created_by)
VALUES ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','directeur',NULL,'Bennani','Ahmed','directeur@eduos.ma','+212 6 10 10 10 10',crypt('demo1234',gen_salt('bf')),'f0000000-0000-0000-0000-000000000001');

INSERT INTO users (id, centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash, created_by) VALUES
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','personnel','coordinateur','Alaoui','Sara','coordinateur@eduos.ma','+212 6 20 20 20 20',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','participant',NULL,'Bennani','Yasmine','participant@eduos.ma','+212 6 12 34 56 78',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','personnel','commercial','Idrissi','Omar','commercial@eduos.ma','+212 6 30 30 30 30',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','participant',NULL,'Cherkaoui','Ahmed','ahmed.cherkaoui@email.ma','+212 6 61 12 34 56',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','participant',NULL,'El Idrissi','Fatima Zahra','fatima.elidrissi@email.ma','+212 6 62 45 67 89',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000001');

INSERT INTO users (id, centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash, created_by) VALUES
('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','personnel','formateur','Alaoui','Karim','formateur@eduos.ma','+212 6 61 22 33 44',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','personnel','enseignant','Alami','Nadia','enseignant@eduos.ma','+212 6 71 22 33 44',crypt('demo1234',gen_salt('bf')),'10000000-0000-0000-0000-000000000002');

INSERT INTO candidatures_centres (
  id, reference, centre_nom, responsable_nom, telephone, email, ville,
  taille_apprenants, besoins, remarques, statut, processed_by, processed_at,
  centre_created_id, directeur_created_id
) VALUES (
  'e0000000-0000-0000-0000-000000000001','CAND-2026-1042','EDUOS Maroc — Rabat Hassan',
  'Ahmed Bennani','+212 6 10 10 10 10','directeur@eduos.ma','Rabat','50 à 200 élèves',
  ARRAY['Planning & Salles','Paiements & Mensualités'],'Dossier accepté pour la démonstration.',
  'acceptee','f0000000-0000-0000-0000-000000000001',now()-interval '5 days',
  '00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'
), (
  'e0000000-0000-0000-0000-000000000002','CAND-2026-1088','Centre Horizon Formation',
  'Salma El Mansouri','+212 6 12 34 56 78','direction@horizon.ma','Casablanca','50 à 200 élèves',
  ARRAY['Planning & Salles','Relances WhatsApp auto'],'Souhaite démarrer avec deux cohortes.',
  'en_attente',NULL,NULL,NULL,NULL
);

INSERT INTO participants (id,user_id,matricule,ville,cin) VALUES
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','EDU-P-2025-084','Rabat','AB123456'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','EDU-P-2025-085','Rabat','AB234567'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000006','EDU-P-2025-086','Salé','AB345678');

INSERT INTO intervenants (id,user_id,centre_id,fonction,code,specialite,taux_horaire,note) VALUES
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','formateur','FOR-001','Langues — Anglais B1 / B2',120,4.8),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','enseignant','ENS-001','Mathématiques',110,4.7);

INSERT INTO prospects (id,centre_id,assigned_to,nom_complet,email,telephone,formation_souhaitee,source,statut,contacted_at) VALUES
('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','Yasmine Ait Ouali','y.aitouali@gmail.com','06 61 12 34 56','Anglais B1','Site web','nouveau',now()-interval '2 days'),
('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','Mehdi Bensouda','m.bensouda@gmail.com','06 62 45 67 89','Espagnol débutant','WhatsApp','en_cours',now()-interval '5 days');

INSERT INTO formations (id,centre_id,code,titre,categorie,niveau,duree_heures,prix_mensuel,frais_inscription) VALUES
('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','ANG-B2','Anglais B2 intermédiaire','Langues','B2',80,450,150),
('50000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','ANG-B1','Anglais B1','Langues','B1',60,450,150),
('50000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','FRA-B2','Français B2','Langues','B2',80,680,150);

INSERT INTO cohortes (id,formation_id,intervenant_id,code,nom,date_debut,date_fin,capacite,salle,jours_semaine,heure_debut,heure_fin) VALUES
('60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','ANG-B2-MAT-2025','Anglais B2 — Groupe du matin','2025-01-01','2025-06-30',18,'Salle 1','{1,3,5}','10:00','12:00'),
('60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','ANG-B1-MAT-2025','Anglais B1 — Matin','2025-01-01','2025-06-30',20,'Salle 2','{2,4}','09:00','11:00');

INSERT INTO inscriptions (id,participant_id,cohorte_id,reference,date_inscription,date_debut,date_fin_prevue,montant_mensuel,statut,created_by) VALUES
('70000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','INS-2025-0084','2025-01-01','2025-01-01','2025-06-30',450,'confirmee','10000000-0000-0000-0000-000000000002'),
('70000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000002','INS-2025-0085','2025-01-01','2025-01-01','2025-06-30',450,'confirmee','10000000-0000-0000-0000-000000000002');

INSERT INTO seances (id,cohorte_id,intervenant_id,personnel_id,titre,description,starts_at,ends_at,salle,statut) VALUES
('80000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Present perfect & conversation','Pratique guidée et conversation','2025-01-27 10:00+01','2025-01-27 12:00+01','Salle 1','planifiee'),
('80000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Compréhension orale','Écoute et restitution','2025-01-29 10:00+01','2025-01-29 12:00+01','Salle 1','planifiee'),
('80000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Expression écrite','Production écrite B2','2025-01-24 09:00+01','2025-01-24 11:00+01','Salle 1','terminee');

INSERT INTO presences (seance_id,participant_id,statut,check_in_at,validated_by,validated_at) VALUES
('80000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','present','2025-01-24 08:55+01','10000000-0000-0000-0000-000000000002','2025-01-24 11:05+01');

INSERT INTO factures (id,inscription_id,numero,periode,date_emission,date_echeance,montant_ht,statut) VALUES
('90000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','FAC-2025-0001','2025-01-01','2025-01-01','2025-01-05',450,'payee'),
('90000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000001','FAC-2025-0002','2025-02-01','2025-01-25','2025-02-01',450,'en_attente');

INSERT INTO paiements (facture_id,reference,montant,methode,statut,paid_at,recorded_by) VALUES
('90000000-0000-0000-0000-000000000001','EDU-2501-0842',450,'virement','paye','2025-01-01 11:30+01','10000000-0000-0000-0000-000000000002');

INSERT INTO moyens_paiement (centre_id,methode,libelle,instructions,coordonnees,ordre) VALUES
('00000000-0000-0000-0000-000000000001','virement','Virement bancaire','Indiquer le matricule participant dans le motif','{"banque":"CIH Bank","iban":"MA64 2307 8000 0012 3456 7890 1192"}',1),
('00000000-0000-0000-0000-000000000001','carte','Carte bancaire','Paiement sécurisé en ligne','{"provider":"CMI"}',2),
('00000000-0000-0000-0000-000000000001','especes','Espèces','Paiement à l’accueil du centre','{}',3);

INSERT INTO relance_rules (centre_id,titre,offset_days,canal,message_template,actif) VALUES
('00000000-0000-0000-0000-000000000001','Rappel 5 jours avant échéance',-5,'WhatsApp','Bonjour {prenom}, votre mensualité de {montant} DH est due dans 5 jours.',true),
('00000000-0000-0000-0000-000000000001','Relance J+3',3,'WhatsApp','Votre paiement de {montant} DH est en retard de 3 jours.',true);

INSERT INTO documents (centre_id,participant_id,inscription_id,facture_id,type,nom,storage_key,mime_type,taille_octets,genere_automatiquement,uploaded_by) VALUES
('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001',NULL,'attestation','Attestation_Formation_B1.pdf','participants/084/attestation-b1.pdf','application/pdf',286720,true,'10000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000001','recu','Recu_Paiement_Janvier.pdf','participants/084/recu-janvier.pdf','application/pdf',97280,true,'10000000-0000-0000-0000-000000000002');

INSERT INTO ressources (id,centre_id,formation_id,cohorte_id,type,titre,description,storage_key,mime_type,taille_octets,duree_minutes,semaine,publie,nouveau,created_by) VALUES
('a0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','video','Cours 3 — Le present perfect','Cours vidéo HD','resources/ang-b2/present-perfect.mp4','video/mp4',47185920,24,3,true,true,'10000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','pdf','Grammaire B2 — Récapitulatif','18 pages','resources/ang-b2/grammaire-b2.pdf','application/pdf',2516582,NULL,3,true,false,'10000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','exercice','Exercices — Present perfect','12 exercices','resources/ang-b2/exercices-present-perfect.pdf','application/pdf',838861,NULL,3,true,true,'10000000-0000-0000-0000-000000000002');

INSERT INTO resource_progress (resource_id,participant_id,progression,completed_at,last_opened_at) VALUES
('a0000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',100,now()-interval '2 days',now()-interval '2 days'),
('a0000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001',68,NULL,now()-interval '1 day');

INSERT INTO evaluations (id,cohorte_id,titre,duree_minutes,score_max,publiee,created_by) VALUES
('b0000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','QCM Semaine 3 — Évaluation',15,100,true,'10000000-0000-0000-0000-000000000002');
INSERT INTO questions (id,evaluation_id,texte,ordre,points) VALUES
('b1000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','Choisissez la bonne phrase au Present Perfect.',1,1),
('b1000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','Quel mot-clé est utilisé avec le Present Perfect ?',2,1);
INSERT INTO question_options (question_id,texte,correcte,ordre) VALUES
('b1000000-0000-0000-0000-000000000001','I have lived in Rabat for 3 years.',true,1),
('b1000000-0000-0000-0000-000000000001','I live in Rabat since 3 years.',false,2),
('b1000000-0000-0000-0000-000000000002','Already',true,1),
('b1000000-0000-0000-0000-000000000002','Yesterday',false,2);

INSERT INTO notes_participants (
  inscription_id, intervenant_id, type, libelle, note, coefficient,
  appreciation, date_evaluation, created_by
) VALUES
('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','controle','Contrôle continu 1',15,1,'Très bon travail, participation régulière.','2025-02-10','10000000-0000-0000-0000-000000000007'),
('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','examen','Examen de fin de module',16,2,'Objectifs du module maîtrisés.','2025-03-15','10000000-0000-0000-0000-000000000007'),
('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','controle','Contrôle continu 1',13,1,'Des progrès constants.','2025-02-10','10000000-0000-0000-0000-000000000007'),
('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','examen','Examen de fin de module',14,2,'Travail sérieux et régulier.','2025-03-15','10000000-0000-0000-0000-000000000007');

INSERT INTO rapports_suivi (id,inscription_id,intervenant_id,periode,score_global,taux_presence,appreciation,publie_at) VALUES
('c0000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','2025-06-01',78,83,'Yasmine progresse très bien. Sa compréhension orale s’améliore sensiblement.',now());
INSERT INTO rapport_competences (rapport_id,competence,score) VALUES
('c0000000-0000-0000-0000-000000000001','Compréhension orale',82),
('c0000000-0000-0000-0000-000000000001','Expression écrite',65),
('c0000000-0000-0000-0000-000000000001','Vocabulaire',79),
('c0000000-0000-0000-0000-000000000001','Grammaire',74);

INSERT INTO notifications (user_id,categorie,titre,message,action_url,created_at) VALUES
('10000000-0000-0000-0000-000000000003','cours','Rappel de cours','Votre cours d’Anglais B2 est prévu demain à 10h00 en Salle 1.','/participant/mon-espace',now()-interval '1 hour'),
('10000000-0000-0000-0000-000000000003','paiement','Prochaine mensualité','Votre prochaine mensualité de 450 DH arrive à échéance le 1er février 2025.','/participant/paiement',now()-interval '4 hours'),
('10000000-0000-0000-0000-000000000003','ressource','Nouveaux exercices disponibles','Les exercices de la semaine 4 sont disponibles.','/participant/ressources',now()-interval '1 day');

INSERT INTO tickets (id,centre_id,participant_id,created_by,assigned_to,sujet,statut) VALUES
('d0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','Absence au cours du 21 juillet','en_cours');
INSERT INTO ticket_messages (ticket_id,sender_id,message,created_at) VALUES
('d0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','Je n’ai pas pu assister au cours pour raison médicale.',now()-interval '2 hours'),
('d0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Nous allons organiser une session de rattrapage.',now()-interval '1 hour');

INSERT INTO renouvellements (inscription_id,date_expiration,statut,remise_proposee,notes) VALUES
('70000000-0000-0000-0000-000000000001','2025-06-30','a_venir',15,'Proposer le passage au niveau C1.');

INSERT INTO remunerations (intervenant_id,periode,heures,taux_horaire,statut) VALUES
('30000000-0000-0000-0000-000000000001','2025-07-01',48,120,'en_attente');

COMMIT;

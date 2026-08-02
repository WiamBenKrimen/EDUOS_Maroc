import asyncio
import asyncpg

SEED_SQL = """
-- 1. Ensure Nadia Alami exists in users table and intervenants table
-- User ID: 10000000-0000-0000-0000-000000000008
-- Intervenant ID: 30000000-0000-0000-0000-000000000002

-- Create additional Formations for Nadia if needed
INSERT INTO formations (id, centre_id, code, titre, categorie, niveau, duree_heures, prix_mensuel, frais_inscription)
VALUES 
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'MATH-BAC', 'Mathématiques Terminale Bac', 'Sciences', 'Terminale', 90, 500, 150),
  ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'MATH-SUP', 'Mathématiques Supérieur & Prépas', 'Sciences', 'Supérieur', 120, 650, 150)
ON CONFLICT (id) DO NOTHING;

-- Create Cohortes assigned to Nadia Alami (intervenant_id: 30000000-0000-0000-0000-000000000002)
INSERT INTO cohortes (id, formation_id, intervenant_id, code, nom, date_debut, date_fin, capacite, salle, jours_semaine, heure_debut, heure_fin, statut)
VALUES
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'MATH-BAC-2025', 'Maths Bac — Groupe Scientifique 1', '2025-01-01', '2025-06-30', 20, 'Salle 3', '{1,3}', '14:00', '16:00', 'actif'),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'MATH-SUP-2025', 'Maths Sup — Groupe Spécial', '2025-01-01', '2025-06-30', 15, 'Salle 4', '{2,4}', '16:00', '18:00', 'actif')
ON CONFLICT (id) DO NOTHING;

-- Enroll Participants into Nadia's Cohortes
INSERT INTO inscriptions (id, participant_id, cohorte_id, reference, date_inscription, date_debut, date_fin_prevue, montant_mensuel, statut, created_by)
VALUES
  ('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'INS-2025-0086', '2025-01-01', '2025-01-01', '2025-06-30', 500, 'confirmee', '10000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', 'INS-2025-0087', '2025-01-01', '2025-01-01', '2025-06-30', 500, 'confirmee', '10000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', 'INS-2025-0088', '2025-01-01', '2025-01-01', '2025-06-30', 500, 'confirmee', '10000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004', 'INS-2025-0089', '2025-01-01', '2025-01-01', '2025-06-30', 650, 'confirmee', '10000000-0000-0000-0000-000000000002'),
  ('70000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004', 'INS-2025-0090', '2025-01-01', '2025-01-01', '2025-06-30', 650, 'confirmee', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Create Séances for Nadia Alami
INSERT INTO seances (id, cohorte_id, intervenant_id, personnel_id, titre, description, starts_at, ends_at, salle, statut)
VALUES
  ('80000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Analyse & Dérivation', 'Étude des fonctions et calcul de dérivées', now() - interval '2 days' + interval '14 hours', now() - interval '2 days' + interval '16 hours', 'Salle 3', 'terminee'),
  ('80000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Intégrales et Primitives', 'Calcul d intégrales définies et méthodes de résolution', now() + interval '1 day' + interval '14 hours', now() + interval '1 day' + interval '16 hours', 'Salle 3', 'planifiee'),
  ('80000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Algèbre Linéaire & Matrices', 'Espaces vectoriels et réduction d endomorphismes', now() + interval '2 days' + interval '16 hours', now() + interval '2 days' + interval '18 hours', 'Salle 4', 'planifiee')
ON CONFLICT (id) DO NOTHING;

-- Presences records for past séance
INSERT INTO presences (seance_id, participant_id, statut, check_in_at, validated_by, validated_at)
VALUES
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'present', now() - interval '2 days' + interval '13 hours 55 min', '10000000-0000-0000-0000-000000000008', now() - interval '2 days' + interval '16 hours 05 min'),
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'present', now() - interval '2 days' + interval '13 hours 58 min', '10000000-0000-0000-0000-000000000008', now() - interval '2 days' + interval '16 hours 05 min'),
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'absent', NULL, '10000000-0000-0000-0000-000000000008', now() - interval '2 days' + interval '16 hours 05 min')
ON CONFLICT DO NOTHING;

-- Notes for Nadia's students
INSERT INTO notes_participants (inscription_id, intervenant_id, type, libelle, note, coefficient, appreciation, date_evaluation, created_by)
VALUES
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'controle', 'Contrôle 1 — Dérivations', 17.5, 1, 'Excellente maîtrise des calculs et rigueur mathématique.', '2025-02-05', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'examen', 'Examen Mi-Semestre', 18.0, 2, 'Travail parfait, très bonne méthode.', '2025-03-01', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'controle', 'Contrôle 1 — Dérivations', 14.0, 1, 'Bon travail, attention aux étourderies.', '2025-02-05', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'examen', 'Examen Mi-Semestre', 15.5, 2, 'Résultats satisfaisants en progression.', '2025-03-01', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'controle', 'Contrôle 1 — Dérivations', 11.5, 1, 'Des efforts à poursuivre, revoir la méthode.', '2025-02-05', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'examen', 'Examen Mi-Semestre', 12.0, 2, 'Moyenne correcte, persévérez.', '2025-03-01', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'controle', 'Contrôle 1 — Espaces Vectoriels', 16.0, 1, 'Très bonne assimilation du cours.', '2025-02-12', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'examen', 'Examen Algèbre', 16.5, 2, 'Très bon esprit d analyse.', '2025-03-10', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'controle', 'Contrôle 1 — Espaces Vectoriels', 13.5, 1, 'Correct, approfondir les démonstrations.', '2025-02-12', '10000000-0000-0000-0000-000000000008'),
  ('70000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'examen', 'Examen Algèbre', 14.0, 2, 'Bon ensemble, poursuivez les efforts.', '2025-03-10', '10000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- Ressources uploaded by Nadia Alami
INSERT INTO ressources (id, centre_id, formation_id, cohorte_id, type, titre, description, storage_key, mime_type, taille_octets, duree_minutes, semaine, publie, nouveau, created_by)
VALUES
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000003', 'pdf', 'Polycopié — Dérivation & Étude de Fonctions', 'Cours complet de 24 pages avec exemples corrigés', 'resources/math-bac/derivations.pdf', 'application/pdf', 3145728, NULL, 1, true, true, '10000000-0000-0000-0000-000000000008'),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000003', 'exercice', 'Fiche d Exercices — Calcul d Intégrales', '15 exercices avec corrigés détaillés', 'resources/math-bac/exercices-integrales.pdf', 'application/pdf', 1457280, NULL, 2, true, true, '10000000-0000-0000-0000-000000000008'),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000004', 'video', 'Vidéo — Réduction des Endomorphismes', 'Explication vidéo pas à pas (35 min)', 'resources/math-sup/reduction-video.mp4', 'video/mp4', 52428800, 35, 1, true, false, '10000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

-- Evaluations created by Nadia Alami
INSERT INTO evaluations (id, cohorte_id, titre, duree_minutes, score_max, publiee, created_by)
VALUES
  ('b0000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', 'QCM — Évaluation Fonctions & Dérivées', 20, 100, true, '10000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, evaluation_id, texte, ordre, points)
VALUES
  ('b1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Quelle est la dérivée de f(x) = ln(x) ?', 1, 50),
  ('b1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Quelle est l intégrale de f(x) = exp(2x) ?', 2, 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (question_id, texte, correcte, ordre)
VALUES
  ('b1000000-0000-0000-0000-000000000003', '1/x', true, 1),
  ('b1000000-0000-0000-0000-000000000003', 'x', false, 2),
  ('b1000000-0000-0000-0000-000000000004', '(1/2) exp(2x) + C', true, 1),
  ('b1000000-0000-0000-0000-000000000004', '2 exp(2x) + C', false, 2)
ON CONFLICT DO NOTHING;

-- Tickets for Nadia Alami
INSERT INTO tickets (id, centre_id, participant_id, created_by, assigned_to, sujet, statut)
VALUES
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 'Question sur le problème de l intégrale n°4', 'en_cours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ticket_messages (ticket_id, sender_id, message, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Bonjour Professeur Alami, pourriez-vous m éclairer sur l exercice 4 du polycopié ?', now() - interval '3 hours'),
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'Bonjour Yasmine, il faut utiliser l intégration par parties en posant u = x et v = exp(x).', now() - interval '1 hour')
ON CONFLICT DO NOTHING;
"""

async def seed():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/eduos')
    await conn.execute(SEED_SQL)
    print("✅ Seed script successfully executed for Nadia Alami!")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(seed())

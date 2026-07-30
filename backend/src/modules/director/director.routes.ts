import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { query } from '../../database/query.js'
import { authorize } from '../../plugins/authorize.js'

// ─── Schemas ────────────────────────────────────────────────────────────────

const prospectCreateSchema = z.object({
  nom_complet: z.string().trim().min(2).max(160),
  formation_souhaitee: z.string().trim().max(160).optional().nullable(),
  telephone: z.string().trim().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

const prospectStatusSchema = z.object({
  statut: z.enum(['nouveau', 'en_cours', 'inscrit', 'perdu']),
})

const enrollmentSchema = z.object({
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(8).max(200),
  telephone: z.string().trim().max(30).optional().nullable(),
  date_naissance: z.string().optional().nullable(),
  ville: z.string().trim().max(80).optional().nullable(),
  adresse: z.string().trim().optional().nullable(),
  cohorte_id: z.string().uuid(),
  plan: z.enum(['mensuel', 'trimestriel', 'annuel']).default('mensuel'),
})

const cohorteCreateSchema = z.object({
  nom: z.string().trim().min(2).max(160),
  formation_id: z.string().uuid(),
  intervenant_id: z.string().uuid().optional().nullable(),
  code: z.string().trim().min(1).max(50),
  date_debut: z.string(),
  date_fin: z.string(),
  capacite: z.number().int().positive(),
  salle: z.string().trim().max(80).optional().nullable(),
  prix_mensuel: z.number().nonnegative().optional(),
})

const personnelCreateSchema = z.object({
  nom: z.string().trim().min(2).max(80),
  prenom: z.string().trim().min(2).max(80),
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  telephone: z.string().trim().max(30).optional().nullable(),
  fonction: z.enum(['coordinateur', 'commercial', 'formateur', 'enseignant']),
  password: z.string().min(8).max(200),
  specialite: z.string().trim().max(180).optional().nullable(),
  taux_horaire: z.number().nonnegative().default(0),
})

const paiementCreateSchema = z.object({
  facture_id: z.string().uuid(),
  montant: z.number().positive(),
  methode: z.enum(['carte', 'virement', 'especes', 'cheque', 'tpe']),
  transaction_ref: z.string().trim().optional().nullable(),
})

// ─── Helper ──────────────────────────────────────────────────────────────────

function planMonths(plan: string): number {
  if (plan === 'trimestriel') return 3
  if (plan === 'annuel') return 12
  return 1
}

// ─── Routes ─────────────────────────────────────────────────────────────────

export const directorRoutes: FastifyPluginAsync = async app => {
  const auth = [app.authenticate, authorize('dashboard:view')]
  const manage = [app.authenticate, authorize('dashboard:view')]

  // ── Dashboard KPIs ────────────────────────────────────────────────────────
  app.get('/dashboard', { preHandler: auth }, async request => {
    const centreId = request.user.centreId

    const [kpiRow] = await query<{
      eleves_actifs: string
      taux_presence: string
      ca_encaisse: string
      paiements_retard: string
    }>(
      `SELECT
         (SELECT COUNT(*) FROM inscriptions i
            JOIN cohortes co ON co.id = i.cohorte_id
            JOIN formations f ON f.id = co.formation_id
           WHERE f.centre_id = $1 AND i.statut = 'confirmee') AS eleves_actifs,
         COALESCE(
           ROUND(
             (SELECT COUNT(*) FROM presences pr
                JOIN seances s ON s.id = pr.seance_id
                JOIN cohortes co ON co.id = s.cohorte_id
                JOIN formations f ON f.id = co.formation_id
               WHERE f.centre_id = $1 AND pr.statut = 'present')::numeric * 100 /
             NULLIF((SELECT COUNT(*) FROM presences pr
                JOIN seances s ON s.id = pr.seance_id
                JOIN cohortes co ON co.id = s.cohorte_id
                JOIN formations f ON f.id = co.formation_id
               WHERE f.centre_id = $1), 0), 1), 0) AS taux_presence,
         COALESCE((SELECT SUM(p.montant) FROM paiements p
            JOIN factures fa ON fa.id = p.facture_id
            JOIN inscriptions i ON i.id = fa.inscription_id
            JOIN cohortes co ON co.id = i.cohorte_id
            JOIN formations f ON f.id = co.formation_id
           WHERE f.centre_id = $1 AND p.statut = 'paye'
             AND date_trunc('month', p.paid_at) = date_trunc('month', now())), 0) AS ca_encaisse,
         (SELECT COUNT(*) FROM factures fa
            JOIN inscriptions i ON i.id = fa.inscription_id
            JOIN cohortes co ON co.id = i.cohorte_id
            JOIN formations f ON f.id = co.formation_id
           WHERE f.centre_id = $1 AND fa.statut IN ('en_retard', 'en_attente')
             AND fa.date_echeance < CURRENT_DATE) AS paiements_retard`,
      [centreId],
    )

    return {
      eleves_actifs: Number(kpiRow?.eleves_actifs ?? 0),
      taux_presence: Number(kpiRow?.taux_presence ?? 0),
      ca_encaisse: Number(kpiRow?.ca_encaisse ?? 0),
      paiements_retard: Number(kpiRow?.paiements_retard ?? 0),
    }
  })

  // ── Prospects ─────────────────────────────────────────────────────────────
  app.get('/prospects', { preHandler: auth }, async request => {
    return query(
      `SELECT id, nom_complet, email, telephone, formation_souhaitee, source, statut, notes, created_at
         FROM prospects
        WHERE centre_id = $1
        ORDER BY created_at DESC`,
      [request.user.centreId],
    )
  })

  app.post('/prospects', { preHandler: manage }, async (request, reply) => {
    const parsed = prospectCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Données invalides.', errors: z.flattenError(parsed.error).fieldErrors })
    }
    const d = parsed.data
    const rows = await query<{ id: string }>(
      `INSERT INTO prospects (centre_id, nom_complet, formation_souhaitee, telephone, email, source, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nom_complet, email, telephone, formation_souhaitee, source, statut, notes, created_at`,
      [request.user.centreId, d.nom_complet, d.formation_souhaitee ?? null, d.telephone ?? null, d.email ?? null, d.source ?? null, d.notes ?? null],
    )
    return reply.code(201).send(rows[0])
  })

  app.patch('/prospects/:id/statut', { preHandler: manage }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsed = prospectStatusSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Statut invalide.' })
    }
    const rows = await query(
      `UPDATE prospects SET statut = $1 WHERE id = $2 AND centre_id = $3
       RETURNING id, nom_complet, statut`,
      [parsed.data.statut, id, request.user.centreId],
    )
    if (!rows.length) return reply.code(404).send({ message: 'Prospect introuvable.' })
    return rows[0]
  })

  // ── Enrollment options (cohortes available) ───────────────────────────────
  app.get('/enrollment-options', { preHandler: auth }, async request => {
    return query(
      `SELECT co.id, co.nom, co.date_debut, co.date_fin, co.capacite,
              f.prix_mensuel,
              COALESCE(
                (SELECT display_name FROM (
                   SELECT CONCAT(u.prenom, ' ', u.nom) AS display_name
                   FROM intervenants iv
                   JOIN users u ON u.id = iv.user_id
                   WHERE iv.id = co.intervenant_id
                ) sq), 'Non affecté') AS formateur,
              (SELECT COUNT(*) FROM inscriptions i WHERE i.cohorte_id = co.id AND i.statut = 'confirmee') AS inscrits
         FROM cohortes co
         JOIN formations f ON f.id = co.formation_id
        WHERE f.centre_id = $1
          AND co.statut = 'actif'
          AND co.date_fin >= CURRENT_DATE
        ORDER BY co.date_debut`,
      [request.user.centreId],
    )
  })

  // ── Enrollment (inscription) ──────────────────────────────────────────────
  app.post('/enrollments', { preHandler: manage }, async (request, reply) => {
    const parsed = enrollmentSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Données d\'inscription invalides.', errors: z.flattenError(parsed.error).fieldErrors })
    }
    const d = parsed.data

    // Verify cohorte belongs to this centre
    const cohorteRows = await query<{ formation_id: string; prix_mensuel: string; centre_id: string }>(
      `SELECT co.id, f.centre_id, f.prix_mensuel
         FROM cohortes co
         JOIN formations f ON f.id = co.formation_id
        WHERE co.id = $1`,
      [d.cohorte_id],
    )
    if (!cohorteRows.length || cohorteRows[0]!.centre_id !== request.user.centreId) {
      return reply.code(403).send({ message: 'Cohorte introuvable ou accès refusé.' })
    }

    const prix = Number(cohorteRows[0]!.prix_mensuel)

    // 1. Create participant user account
    const userRows = await query<{ id: string }>(
      `INSERT INTO users (centre_id, role, nom, prenom, email, telephone, password_hash, created_by)
       VALUES ($1, 'participant', $2, $3, $4, $5, crypt($6, gen_salt('bf')), $7)
       RETURNING id`,
      [request.user.centreId, d.nom, d.prenom, d.email, d.telephone ?? null, d.password, request.user.sub],
    )
    const userId = userRows[0]!.id

    // 2. Generate matricule
    const year = new Date().getFullYear()
    const countRows = await query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM participants p
         JOIN users u ON u.id = p.user_id
        WHERE u.centre_id = $1 AND date_part('year', p.created_at) = $2`,
      [request.user.centreId, year],
    )
    const seq = String(Number(countRows[0]?.n ?? 0) + 1).padStart(4, '0')
    const matricule = `EDU-${year}-${seq}`

    // 3. Create participant profile
    const participantRows = await query<{ id: string }>(
      `INSERT INTO participants (user_id, matricule, date_naissance, adresse, ville)
       VALUES ($1, $2, $3::date, $4, $5)
       RETURNING id`,
      [userId, matricule, d.date_naissance || null, d.adresse ?? null, d.ville ?? null],
    )
    const participantId = participantRows[0]!.id

    // 4. Generate inscription reference
    const refRows = await query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM inscriptions i
         JOIN cohortes co ON co.id = i.cohorte_id
         JOIN formations f ON f.id = co.formation_id
        WHERE f.centre_id = $1 AND date_part('year', i.created_at) = $2`,
      [request.user.centreId, year],
    )
    const refSeq = String(Number(refRows[0]?.n ?? 0) + 1).padStart(4, '0')
    const reference = `INS-${year}-${refSeq}`

    const months = planMonths(d.plan)
    const dateFinPrevue = new Date()
    dateFinPrevue.setMonth(dateFinPrevue.getMonth() + months)

    // 5. Create inscription
    const inscriptionRows = await query<{ id: string; reference: string }>(
      `INSERT INTO inscriptions (participant_id, cohorte_id, reference, date_debut, date_fin_prevue, montant_mensuel, created_by)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6)
       RETURNING id, reference`,
      [participantId, d.cohorte_id, reference, dateFinPrevue.toISOString().split('T')[0], prix, request.user.sub],
    )

    return reply.code(201).send({
      inscription_id: inscriptionRows[0]!.id,
      reference: inscriptionRows[0]!.reference,
      matricule,
      user_id: userId,
      participant_id: participantId,
      email: d.email,
    })
  })

  // ── Cohortes ──────────────────────────────────────────────────────────────
  app.get('/cohortes', { preHandler: auth }, async request => {
    return query(
      `SELECT co.id, co.nom, co.code, co.date_debut, co.date_fin, co.capacite, co.salle, co.statut,
              f.titre AS formation_nom, f.prix_mensuel,
              COALESCE(
                (SELECT CONCAT(u.prenom, ' ', u.nom)
                 FROM intervenants iv JOIN users u ON u.id = iv.user_id
                 WHERE iv.id = co.intervenant_id), 'Non affecté') AS formateur,
              (SELECT COUNT(*) FROM inscriptions i WHERE i.cohorte_id = co.id AND i.statut = 'confirmee') AS inscrits
         FROM cohortes co
         JOIN formations f ON f.id = co.formation_id
        WHERE f.centre_id = $1
        ORDER BY co.date_debut DESC`,
      [request.user.centreId],
    )
  })

  app.post('/cohortes', { preHandler: manage }, async (request, reply) => {
    const parsed = cohorteCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Données de cohorte invalides.', errors: z.flattenError(parsed.error).fieldErrors })
    }
    const d = parsed.data
    const rows = await query(
      `INSERT INTO cohortes (formation_id, intervenant_id, code, nom, date_debut, date_fin, capacite, salle)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nom, code, date_debut, date_fin, capacite, salle, statut`,
      [d.formation_id, d.intervenant_id ?? null, d.code, d.nom, d.date_debut, d.date_fin, d.capacite, d.salle ?? null],
    )
    return reply.code(201).send(rows[0])
  })

  // ── Formations (for cohorte creation form) ────────────────────────────────
  app.get('/formations', { preHandler: auth }, async request => {
    return query(
      `SELECT id, code, titre, prix_mensuel, statut
         FROM formations
        WHERE centre_id = $1 AND statut = 'actif'
        ORDER BY titre`,
      [request.user.centreId],
    )
  })

  // ── Personnel ─────────────────────────────────────────────────────────────
  app.get('/personnel', { preHandler: auth }, async request => {
    return query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.personnel_fonction, u.statut, u.created_at,
              COALESCE(iv.taux_horaire, 0) AS taux_horaire,
              COALESCE(iv.specialite, '') AS specialite,
              COALESCE(iv.note, 0) AS note,
              iv.id AS intervenant_id,
              (SELECT COUNT(*) FROM cohortes co WHERE co.intervenant_id = iv.id AND co.statut = 'actif') AS groupes_actifs
         FROM users u
         LEFT JOIN intervenants iv ON iv.user_id = u.id
        WHERE u.centre_id = $1 AND u.role = 'personnel'
        ORDER BY u.prenom, u.nom`,
      [request.user.centreId],
    )
  })

  app.post('/personnel', { preHandler: manage }, async (request, reply) => {
    const parsed = personnelCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Données du personnel invalides.', errors: z.flattenError(parsed.error).fieldErrors })
    }
    const d = parsed.data

    // Create user
    const userRows = await query<{ id: string }>(
      `INSERT INTO users (centre_id, role, personnel_fonction, nom, prenom, email, telephone, password_hash, created_by)
       VALUES ($1, 'personnel', $2, $3, $4, $5, $6, crypt($7, gen_salt('bf')), $8)
       RETURNING id, nom, prenom, email, telephone, personnel_fonction, statut, created_at`,
      [request.user.centreId, d.fonction, d.nom, d.prenom, d.email, d.telephone ?? null, d.password, request.user.sub],
    )
    const user = userRows[0] as any

    // If formateur or enseignant, create intervenant profile
    if (d.fonction === 'formateur' || d.fonction === 'enseignant') {
      const code = `INT-${Date.now()}`
      await query(
        `INSERT INTO intervenants (user_id, centre_id, fonction, code, specialite, taux_horaire)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, request.user.centreId, d.fonction, code, d.specialite ?? 'Général', d.taux_horaire],
      )
    }

    return reply.code(201).send({
      ...user,
      specialite: d.specialite ?? '',
      taux_horaire: d.taux_horaire,
      note: 0,
      groupes_actifs: 0,
    })
  })

  // ── Paiements / Factures ──────────────────────────────────────────────────
  app.get('/paiements', { preHandler: auth }, async request => {
    return query(
      `SELECT fa.id, fa.numero, fa.periode, fa.date_emission, fa.date_echeance,
              fa.montant_ht, fa.montant_ttc, fa.statut AS facture_statut,
              CONCAT(u.prenom, ' ', u.nom) AS participant_nom,
              u.email AS participant_email,
              co.nom AS cohorte_nom,
              (SELECT json_agg(json_build_object('id', p.id, 'montant', p.montant, 'methode', p.methode, 'statut', p.statut, 'paid_at', p.paid_at, 'reference', p.reference))
               FROM paiements p WHERE p.facture_id = fa.id) AS paiements
         FROM factures fa
         JOIN inscriptions i ON i.id = fa.inscription_id
         JOIN participants pa ON pa.id = i.participant_id
         JOIN users u ON u.id = pa.user_id
         JOIN cohortes co ON co.id = i.cohorte_id
         JOIN formations f ON f.id = co.formation_id
        WHERE f.centre_id = $1
        ORDER BY fa.date_echeance DESC
        LIMIT 200`,
      [request.user.centreId],
    )
  })

  app.post('/paiements', { preHandler: manage }, async (request, reply) => {
    const parsed = paiementCreateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Données de paiement invalides.', errors: z.flattenError(parsed.error).fieldErrors })
    }
    const d = parsed.data
    const ref = `PAY-${Date.now()}`
    const rows = await query(
      `INSERT INTO paiements (facture_id, reference, montant, methode, statut, paid_at, recorded_by)
       VALUES ($1, $2, $3, $4, 'paye', now(), $5)
       RETURNING id, reference, montant, methode, statut, paid_at`,
      [d.facture_id, ref, d.montant, d.methode, request.user.sub],
    )

    // Update facture status
    await query(
      `UPDATE factures SET statut = CASE
         WHEN (SELECT SUM(p2.montant) FROM paiements p2 WHERE p2.facture_id = $1 AND p2.statut = 'paye') >= montant_ttc THEN 'payee'
         WHEN (SELECT SUM(p2.montant) FROM paiements p2 WHERE p2.facture_id = $1 AND p2.statut = 'paye') > 0 THEN 'partiellement_payee'
         ELSE statut
       END WHERE id = $1`,
      [d.facture_id],
    )

    return reply.code(201).send(rows[0])
  })

  // ── Intervenants (formateurs list for dropdowns) ──────────────────────────
  app.get('/intervenants', { preHandler: auth }, async request => {
    return query(
      `SELECT iv.id, iv.specialite, iv.taux_horaire, iv.note, iv.fonction,
              CONCAT(u.prenom, ' ', u.nom) AS nom
         FROM intervenants iv
         JOIN users u ON u.id = iv.user_id
        WHERE iv.centre_id = $1 AND iv.statut = 'actif'
        ORDER BY u.prenom, u.nom`,
      [request.user.centreId],
    )
  })
}

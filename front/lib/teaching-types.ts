export type Cohort = {
  id: string
  code: string
  nom: string
  formation: string
  participants: number
  seances_total: number
  seances_terminees: number
  prochaine_seance: string | null
}

export type TeachingSession = {
  id: string
  cohorte_id: string
  titre: string
  description: string | null
  starts_at: string
  ends_at: string
  salle: string | null
  statut: string
  qr_token: string | null
  cohorte: string
  formation: string
  request_id: string | null
  starts_at_souhaite: string | null
  ends_at_souhaite: string | null
  request_motif: string | null
  request_statut: string | null
}

export type TeachingDashboard = {
  nom: string
  fonction: 'formateur' | 'enseignant'
  formations_actives: number
  apprenants: number
  heures_mois: number
  evaluations_a_corriger: number
  seances_aujourdhui: number
  presences_a_valider: number
  cohortes: Cohort[]
  programme_du_jour: TeachingSession[]
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export type ParticipantProfile = {
  user_id: string
  participant_id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  statut: string
  email_notifications: boolean
  course_reminders: boolean
  matricule: string
  date_naissance: string | null
  adresse: string | null
  ville: string | null
  centre: string
  inscription_id: string | null
  inscription_reference: string | null
  cohorte_id: string | null
  cohorte: string | null
  formation: string | null
  date_debut: string | null
  date_fin_prevue: string | null
  formateur: string | null
}

export type ParticipantSession = {
  id: string; titre: string; description: string | null; starts_at: string; ends_at: string
  salle: string | null; statut: string; cohorte: string; formation: string
  formateur: string | null; presence_statut: string | null
}

export type ParticipantNotification = {
  id: string; categorie: string; titre: string; message: string
  action_url: string | null; read_at: string | null; created_at: string
}

export type ParticipantDocument = {
  id: string; type: string; nom: string; storage_key: string; mime_type: string
  taille_octets: number | null; genere_automatiquement: boolean; created_at: string
  inscription: string | null; facture: string | null
}

export type ParticipantReport = {
  id: string; periode: string; score_global: number; taux_presence: number
  appreciation: string | null; publie_at: string; cohorte: string; formation: string
  formateur: string | null
  competences: Array<{ id: string; competence: string; score: number; commentaire: string | null }>
}

export type ParticipantResource = {
  id: string; type: string; titre: string; description: string | null; storage_key: string | null
  mime_type: string | null; taille_octets: number | null; duree_minutes: number | null
  semaine: number | null; nouveau: boolean; created_at: string; cohorte: string
  formation: string; progression: number; completed_at: string | null; last_opened_at: string | null
}

export type ParticipantDashboard = {
  profile: ParticipantProfile
  stats: { progression_ressources: number; taux_presence: number; paiements_en_attente: number; notifications_non_lues: number }
  sessions: ParticipantSession[]
  notifications: ParticipantNotification[]
  documents: ParticipantDocument[]
  latest_report: ParticipantReport | null
}

export function formatBytes(value: number | null): string {
  if (value === null) return 'Taille inconnue'
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} Ko`
  return `${(value / 1024 / 1024).toFixed(1)} Mo`
}

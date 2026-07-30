export type UserRole = 'directeur' | 'personnel' | 'participant'
export type PersonnelFonction = 'coordinateur' | 'commercial' | 'formateur' | 'enseignant'

export interface AuthTokenPayload {
  sub: string
  role: UserRole
  personnelFonction: PersonnelFonction | null
  centreId: string
  email: string
}

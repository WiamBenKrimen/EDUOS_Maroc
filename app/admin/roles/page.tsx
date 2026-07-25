'use client'
import { useState } from 'react'

const PERMISSIONS = [
  { id: 'dashboard:view', label: 'Voir le tableau de bord', group: 'Direction' },
  { id: 'prospects:manage', label: 'Gérer les prospects', group: 'Direction' },
  { id: 'cohortes:manage', label: 'Gérer les cohortes', group: 'Direction' },
  { id: 'paiements:view', label: 'Voir les paiements', group: 'Paiements' },
  { id: 'paiements:manage', label: 'Gérer les paiements', group: 'Paiements' },
  { id: 'formateurs:manage', label: 'Gérer les formateurs', group: 'Direction' },
  { id: 'rapports:view', label: 'Voir les rapports', group: 'Rapports' },
  { id: 'inscription:manage', label: "Gérer les inscriptions", group: 'Opérations' },
  { id: 'planning:view', label: 'Voir le planning', group: 'Opérations' },
  { id: 'presence:manage', label: 'Gérer les présences', group: 'Opérations' },
  { id: 'attestations:generate', label: 'Générer les attestations', group: 'Opérations' },
  { id: 'ressources:view', label: 'Voir les ressources', group: 'Pédagogie' },
  { id: 'ressources:manage', label: 'Gérer les ressources', group: 'Pédagogie' },
  { id: 'evaluations:manage', label: 'Gérer les évaluations', group: 'Pédagogie' },
  { id: 'messages:send', label: 'Envoyer des messages', group: 'Communication' },
  { id: 'participant:view', label: 'Voir son espace apprenant', group: 'Apprenant' },
  { id: 'admin:users', label: 'Gérer les utilisateurs', group: 'Admin' },
  { id: 'admin:roles', label: 'Gérer les rôles', group: 'Admin' },
  { id: 'admin:integrations', label: 'Gérer les intégrations', group: 'Admin' },
  { id: 'admin:audit', label: "Voir le journal d'audit", group: 'Admin' },
]

const ROLES_DEFAULTS: Record<string, string[]> = {
  directeur: ['dashboard:view','prospects:manage','cohortes:manage','paiements:view','paiements:manage','formateurs:manage','rapports:view','inscription:manage','planning:view','presence:manage','attestations:generate','ressources:view','ressources:manage'],
  operateur: ['inscription:manage','planning:view','presence:manage','paiements:view','attestations:generate','ressources:view','ressources:manage','evaluations:manage','messages:send'],
  participant: ['participant:view','ressources:view','messages:send'],
  admin: ['dashboard:view','admin:users','admin:roles','admin:integrations','admin:audit','paiements:view','rapports:view'],
}

const ROLE_LABELS: Record<string, string> = { directeur: 'Directeur', operateur: 'Opérateur', participant: 'Participant', admin: 'Admin' }
const ROLE_COLORS: Record<string, string> = { directeur: '#1B3A6B', operateur: '#059669', participant: '#C9922A', admin: '#DC2626' }

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState('directeur')
  const [perms, setPerms] = useState<Record<string, string[]>>({ ...ROLES_DEFAULTS })

  function toggle(perm: string) {
    setPerms(prev => {
      const cur = prev[selectedRole]
      const next = cur.includes(perm) ? cur.filter(p => p !== perm) : [...cur, perm]
      return { ...prev, [selectedRole]: next }
    })
  }

  const groups = [...new Set(PERMISSIONS.map(p => p.group))]

  return (
    <div style={{ padding: '36px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Rôles & Permissions</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Configurez les droits d'accès pour chaque rôle</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Role selector */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', overflow: 'hidden', height: 'fit-content', boxShadow: '0 2px 10px rgba(27,58,107,.04)' }}>
          {Object.keys(ROLES_DEFAULTS).map(role => (
            <button key={role} onClick={() => setSelectedRole(role)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 18px', border: 'none', borderBottom: '1px solid #f1ede8', background: selectedRole === role ? `${ROLE_COLORS[role]}08` : 'transparent', borderLeft: `3px solid ${selectedRole === role ? ROLE_COLORS[role] : 'transparent'}`, cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[role], flexShrink: 0 }}/>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: selectedRole === role ? ROLE_COLORS[role] : '#1a1823' }}>{ROLE_LABELS[role]}</div>
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.7rem', color: '#94a3b8' }}>{perms[role].length} permissions</div>
              </div>
            </button>
          ))}
        </div>

        {/* Permission editor */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2D9CC', padding: '24px', boxShadow: '0 2px 12px rgba(27,58,107,.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1rem', color: '#1a1823' }}>
              Permissions — <span style={{ color: ROLE_COLORS[selectedRole] }}>{ROLE_LABELS[selectedRole]}</span>
            </h2>
            <button style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: '#1B3A6B', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.82rem', cursor: 'pointer' }}>Sauvegarder</button>
          </div>

          {groups.map(group => (
            <div key={group} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: '#f1ede8' }}/><span>{group}</span><div style={{ flex: 1, height: 1, background: '#f1ede8' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {PERMISSIONS.filter(p => p.group === group).map(perm => {
                  const checked = perms[selectedRole].includes(perm.id)
                  return (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${checked ? `${ROLE_COLORS[selectedRole]}30` : '#E2D9CC'}`, background: checked ? `${ROLE_COLORS[selectedRole]}06` : '#faf8f5', cursor: 'pointer', transition: 'all .15s' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(perm.id)} style={{ width: 16, height: 16, accentColor: ROLE_COLORS[selectedRole], cursor: 'pointer' }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: checked ? 600 : 500, fontSize: '.82rem', color: checked ? '#1a1823' : '#64748b' }}>{perm.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

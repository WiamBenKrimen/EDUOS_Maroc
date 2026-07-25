'use client'
import { useState } from 'react'

const USERS = [
  { nom: 'Youssef El Mansouri', email: 'y.mansouri@avenir-fes.ma', role: 'Directeur', centre: 'Avenir Fès', statut: 'Actif', login: 'Auj. 09:41', initials: 'YM' },
  { nom: 'Laila Bennouna', email: 'l.bennouna@avenir-fes.ma', role: 'Opérateur', centre: 'Avenir Fès', statut: 'Actif', login: 'Auj. 08:15', initials: 'LB' },
  { nom: 'Karim Alaoui', email: 'k.alaoui@avenir-fes.ma', role: 'Formateur', centre: 'Avenir Fès', statut: 'Actif', login: 'Hier 18:30', initials: 'KA' },
  { nom: 'Ahmed Cherkaoui', email: 'a.cherkaoui@gmail.com', role: 'Participant', centre: 'Avenir Fès', statut: 'Actif', login: 'Auj. 10:02', initials: 'AC' },
  { nom: 'Sara Benali', email: 's.benali@gmail.com', role: 'Participant', centre: 'Avenir Fès', statut: 'Actif', login: 'Il y a 2j', initials: 'SB' },
  { nom: 'Mohammed Idrissi', email: 'm.idrissi@lingua.ma', role: 'Directeur', centre: 'Lingua Rabat', statut: 'Actif', login: 'Auj. 07:55', initials: 'MI' },
  { nom: 'Nadia Chraibi', email: 'n.chraibi@lingua.ma', role: 'Opérateur', centre: 'Lingua Rabat', statut: 'Inactif', login: 'Il y a 5j', initials: 'NC' },
  { nom: 'Super Admin', email: 'admin@eduos.ma', role: 'Admin', centre: '—', statut: 'Actif', login: 'Auj. 11:00', initials: 'SA' },
]

const ROLE_BADGE: Record<string, string> = {
  Directeur: 'badge-navy',
  Opérateur: 'badge-green',
  Formateur: 'badge-purple',
  Participant: 'badge-gold',
  Admin: 'badge-red',
}

const FILTERS = ['Tous', 'Directeur', 'Opérateur', 'Formateur', 'Participant', 'Admin']

export default function UtilisateursPage() {
  const [filter, setFilter] = useState('Tous')
  const [search, setSearch] = useState('')

  const filtered = USERS.filter(u =>
    (filter === 'Tous' || u.role === filter) &&
    (u.nom.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>Admin</span>
            <span className="page-breadcrumb-sep">›</span>
            <span style={{ color: '#1B3A6B' }}>Utilisateurs</span>
          </div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Gérez tous les comptes de la plateforme · {USERS.length} comptes</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="card card-p" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="search-input"
              placeholder="Rechercher un utilisateur…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 8 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              >{f}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="card-meta">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Centre</th>
                <th>Statut</th>
                <th>Dernier accès</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div className="row">
                      <div className="avatar avatar-sm avatar-navy">{u.initials}</div>
                      <div>
                        <div className="list-item-title">{u.nom}</div>
                        <div className="list-item-sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] ?? 'badge-gray'}`}>{u.role}</span></td>
                  <td style={{ color: '#5A6B7D' }}>{u.centre}</td>
                  <td>
                    <span className={`badge ${u.statut === 'Actif' ? 'badge-green' : 'badge-gray'}`}>
                      {u.statut}
                    </span>
                  </td>
                  <td style={{ color: '#9AABBC', fontSize: '.78rem' }}>{u.login}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">Éditer</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(220,38,38,.07)', color: '#DC2626', border: 'none' }}>Désactiver</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

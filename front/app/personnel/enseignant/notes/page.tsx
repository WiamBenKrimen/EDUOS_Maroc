'use client'

import { useMemo, useState } from 'react'

type Student = {
  id: number
  nom: string
  groupe: string
  controle: string
  examen: string
  appreciation: string
}

const INITIAL_STUDENTS: Student[] = [
  { id: 1, nom: 'Youssef Amrani', groupe: 'Français professionnel', controle: '15', examen: '16', appreciation: 'Très bon travail, participation régulière.' },
  { id: 2, nom: 'Sara El Idrissi', groupe: 'Français professionnel', controle: '13', examen: '14', appreciation: 'Des progrès constants.' },
  { id: 3, nom: 'Mehdi Alaoui', groupe: 'Français professionnel', controle: '11', examen: '12', appreciation: 'Doit renforcer la communication écrite.' },
  { id: 4, nom: 'Imane Zahra', groupe: 'Communication écrite', controle: '17', examen: '18', appreciation: 'Excellente maîtrise des objectifs.' },
  { id: 5, nom: 'Omar Bennani', groupe: 'Communication écrite', controle: '12', examen: '13', appreciation: 'Travail sérieux et régulier.' },
]

export default function NotesPage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS)
  const [group, setGroup] = useState('Français professionnel')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 3

  const filtered = useMemo(() => students.filter(student =>
    student.groupe === group && student.nom.toLowerCase().includes(search.toLowerCase()),
  ), [students, group, search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedStudents = filtered.slice((page - 1) * pageSize, page * pageSize)

  function update(id: number, field: 'controle' | 'examen' | 'appreciation', value: string) {
    if ((field === 'controle' || field === 'examen') && value !== '' && (Number(value) < 0 || Number(value) > 20)) return
    setStudents(current => current.map(student => student.id === id ? { ...student, [field]: value } : student))
  }

  function save() {
    localStorage.setItem('eduos_enseignant_notes', JSON.stringify(students))
    setToast('Les notes et appréciations ont été enregistrées.')
    setTimeout(() => setToast(''), 3200)
  }

  const average = filtered.length
    ? (filtered.reduce((sum, student) => sum + (Number(student.controle || 0) + Number(student.examen || 0)) / 2, 0) / filtered.length).toFixed(1)
    : '0'

  return (
    <div>
      {toast && <div role="status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200, padding: '12px 18px', borderRadius: 10, background: '#0F2347', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 10px 28px rgba(15,35,71,.22)' }}>✓ {toast}</div>}

      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ color: '#94A3B8', fontSize: 12 }}>Enseignant / Suivi pédagogique</p>
          <h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Notes des étudiants</h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>Saisissez les notes sur 20 et l’appréciation individuelle de chaque étudiant.</p>
        </div>
        <button className="btn-navy" onClick={save}>Enregistrer les notes</button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr .55fr', gap: 14, marginBottom: 18, padding: 16, border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff' }}>
        <label style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>Groupe
          <select value={group} onChange={e => { setGroup(e.target.value); setPage(1) }} style={{ display: 'block', width: '100%', marginTop: 6, padding: 11, border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff' }}>
            <option>Français professionnel</option>
            <option>Communication écrite</option>
          </select>
        </label>
        <label style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>Rechercher un étudiant
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Nom de l’étudiant..." style={{ display: 'block', width: '100%', marginTop: 6, padding: 11, border: '1px solid #CBD5E1', borderRadius: 8, boxSizing: 'border-box' }} />
        </label>
        <div style={{ padding: 12, borderRadius: 9, background: '#EBF0FA', alignSelf: 'end' }}><small style={{ color: '#64748B' }}>Moyenne du groupe</small><strong style={{ display: 'block', color: '#1B3A6B', fontSize: 22, marginTop: 3 }}>{average}/20</strong></div>
      </section>

      <section style={{ border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .45fr .45fr 1.5fr', gap: 12, padding: '12px 16px', background: '#F8FAFC', color: '#64748B', fontSize: 11, fontWeight: 800 }}>
          <span>ÉTUDIANT</span><span>CONTRÔLE /20</span><span>EXAMEN /20</span><span>APPRÉCIATION</span>
        </div>
        {paginatedStudents.map(student => {
          const moyenne = ((Number(student.controle || 0) + Number(student.examen || 0)) / 2).toFixed(1)
          return <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .45fr .45fr 1.5fr', gap: 12, alignItems: 'center', padding: 16, borderTop: '1px solid #F1F5F9' }}>
            <span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{student.nom}</strong><small style={{ color: Number(moyenne) >= 10 ? '#047857' : '#B91C1C', fontWeight: 700 }}>Moyenne : {moyenne}/20</small></span>
            <input type="number" min="0" max="20" step=".25" value={student.controle} onChange={e => update(student.id, 'controle', e.target.value)} aria-label={`Note de contrôle de ${student.nom}`} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} />
            <input type="number" min="0" max="20" step=".25" value={student.examen} onChange={e => update(student.id, 'examen', e.target.value)} aria-label={`Note d’examen de ${student.nom}`} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} />
            <input value={student.appreciation} onChange={e => update(student.id, 'appreciation', e.target.value)} aria-label={`Appréciation de ${student.nom}`} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
        })}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <small style={{ color: '#64748B' }}>{filtered.length} étudiant{filtered.length > 1 ? 's' : ''} · Page {page} sur {pageCount}</small>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" disabled={page === 1} onClick={() => setPage(current => Math.max(1, current - 1))} style={{ padding: '7px 12px', opacity: page === 1 ? .45 : 1 }}>Précédent</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} onClick={() => setPage(number)} aria-label={`Page ${number}`} aria-current={page === number ? 'page' : undefined} style={{ width: 34, height: 34, borderRadius: 8, border: page === number ? '1px solid #1B3A6B' : '1px solid #CBD5E1', background: page === number ? '#1B3A6B' : '#fff', color: page === number ? '#fff' : '#1B3A6B', fontWeight: 800, cursor: 'pointer' }}>{number}</button>)}
            <button className="btn-outline" disabled={page === pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))} style={{ padding: '7px 12px', opacity: page === pageCount ? .45 : 1 }}>Suivant</button>
          </div>
        </footer>
      </section>
    </div>
  )
}

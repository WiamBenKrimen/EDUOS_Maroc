'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'

type GradeRow = {
  inscription_id: string; participant_id: string; nom: string; cohorte_id: string; cohorte: string
  controle: number | null; examen: number | null; appreciation: string
}

export default function NotesPage() {
  const [students, setStudents] = useState<GradeRow[]>([])
  const [group, setGroup] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.get<GradeRow[]>('/personnel/grades').then(items => { setStudents(items); setGroup(items[0]?.cohorte_id ?? '') }).catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les notes.'))
  }, [])

  const groups = useMemo(() => Array.from(new Map(students.map(student => [student.cohorte_id, student.cohorte])).entries()), [students])
  const filtered = useMemo(() => students.filter(student => (!group || student.cohorte_id === group) && student.nom.toLowerCase().includes(search.toLowerCase())), [students, group, search])
  const average = filtered.length ? (filtered.reduce((sum, student) => sum + (Number(student.controle ?? 0) + Number(student.examen ?? 0)) / 2, 0) / filtered.length).toFixed(1) : '0.0'

  function update(id: string, field: 'controle' | 'examen' | 'appreciation', value: string) {
    setStudents(current => current.map(student => student.inscription_id === id ? { ...student, [field]: field === 'appreciation' ? value : value === '' ? null : Number(value) } : student))
  }

  async function save() {
    setError('')
    try {
      const result = await api.put<{ updated: number }>('/personnel/grades', { entries: filtered.map(student => ({ inscription_id: student.inscription_id, controle: student.controle, examen: student.examen, appreciation: student.appreciation || null })) })
      setNotice(`${result.updated} note(s) enregistrée(s) dans PostgreSQL.`)
    } catch (error) { setError(error instanceof Error ? error.message : 'Impossible d’enregistrer les notes.') }
  }

  return <div>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}><div><p style={{ color: '#94A3B8', fontSize: 12 }}>Enseignant / Suivi pédagogique</p><h1 style={{ color: '#0F2347', fontSize: 26, margin: '5px 0' }}>Notes des étudiants</h1><p style={{ color: '#64748B', fontSize: 13 }}>Notes limitées aux inscriptions de vos cohortes.</p></div><button className="btn-navy" onClick={save} disabled={!filtered.length}>Enregistrer les notes</button></header>
    {error && <div className="auth-error" role="alert" style={{ marginBottom: 14 }}>{error}</div>}{notice && <div role="status" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#ECFDF5', color: '#047857' }}>{notice}</div>}
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr .55fr', gap: 14, marginBottom: 18, padding: 16, border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff' }}><label style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>Groupe<select value={group} onChange={event => setGroup(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 11, border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff' }}><option value="">Toutes les cohortes</option>{groups.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>Rechercher<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nom de l’étudiant…" style={{ display: 'block', width: '100%', marginTop: 6, padding: 11, border: '1px solid #CBD5E1', borderRadius: 8 }} /></label><div style={{ padding: 12, borderRadius: 9, background: '#EBF0FA', alignSelf: 'end' }}><small style={{ color: '#64748B' }}>Moyenne</small><strong style={{ display: 'block', color: '#1B3A6B', fontSize: 22, marginTop: 3 }}>{average}/20</strong></div></section>
    <section style={{ border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', overflow: 'hidden' }}><div style={{ display: 'grid', gridTemplateColumns: '1.2fr .45fr .45fr 1.5fr', gap: 12, padding: '12px 16px', background: '#F8FAFC', color: '#64748B', fontSize: 11, fontWeight: 800 }}><span>ÉTUDIANT</span><span>CONTRÔLE /20</span><span>EXAMEN /20</span><span>APPRÉCIATION</span></div>{filtered.length === 0 && <p style={{ padding: 24, color: '#64748B' }}>Aucun étudiant. Une cohorte doit d’abord être affectée à cet enseignant.</p>}{filtered.map(student => <div key={student.inscription_id} style={{ display: 'grid', gridTemplateColumns: '1.2fr .45fr .45fr 1.5fr', gap: 12, alignItems: 'center', padding: 16, borderTop: '1px solid #F1F5F9' }}><span><strong style={{ display: 'block', color: '#0F2347', fontSize: 13 }}>{student.nom}</strong><small style={{ color: '#64748B' }}>{student.cohorte}</small></span><input type="number" min="0" max="20" step=".25" value={student.controle ?? ''} onChange={event => update(student.inscription_id, 'controle', event.target.value)} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} /><input type="number" min="0" max="20" step=".25" value={student.examen ?? ''} onChange={event => update(student.inscription_id, 'examen', event.target.value)} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} /><input value={student.appreciation} onChange={event => update(student.inscription_id, 'appreciation', event.target.value)} style={{ width: '100%', padding: 9, border: '1px solid #CBD5E1', borderRadius: 8 }} /></div>)}</section>
  </div>
}

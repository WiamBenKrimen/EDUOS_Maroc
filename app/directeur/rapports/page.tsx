'use client'

const REPORTS = [
  { titre: 'Rapport mensuel complet', desc: 'Résumé de toutes les activités : présences, paiements, inscriptions et performances.', format: 'PDF', taille: '2.4 Mo', date: 'Juil. 2025', type: 'monthly' },
  { titre: 'Bilan des présences', desc: "Feuilles d'émargement signées et taux de présence par groupe et par formateur.", format: 'PDF', taille: '1.1 Mo', date: 'Juil. 2025', type: 'attendance' },
  { titre: 'Rapport financier', desc: "Encaissements, impayés, CA réalisé vs objectif et ventilation par formation.", format: 'Excel', taille: '890 Ko', date: 'Juil. 2025', type: 'finance' },
  { titre: 'Liste des apprenants actifs', desc: "Export complet de tous les apprenants avec leur statut, groupe et coordonnées.", format: 'Excel', taille: '340 Ko', date: 'Juil. 2025', type: 'students' },
  { titre: 'Rapport de certification', desc: "Attestations générées ce mois et taux de réussite aux évaluations finales.", format: 'PDF', taille: '760 Ko', date: 'Juil. 2025', type: 'cert' },
  { titre: 'Rapport pédagogique', desc: "Avancement des programmes par groupe, ressources consultées et évaluations.", format: 'PDF', taille: '1.8 Mo', date: 'Juil. 2025', type: 'pedagogy' },
  { titre: 'Analyse des renouvellements', desc: "Taux de renouvellement, motifs de départ et revenus récurrents projetés.", format: 'Excel', taille: '450 Ko', date: 'Juil. 2025', type: 'renewal' },
  { titre: 'Rapport personnalisé', desc: "Créez un rapport sur mesure en sélectionnant les données et la période souhaitées.", format: 'PDF / Excel', taille: '—', date: 'À générer', type: 'custom' },
]

const ICONS: Record<string, string> = {
  monthly: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  attendance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  finance: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 0V5m0 8v2m0 2v2',
  students: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  cert: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  pedagogy: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  renewal: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  custom: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
}

export default function RapportsPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Rapports</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Téléchargez et planifiez vos rapports de suivi</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <select style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E2D9CC', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.84rem', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option>Juillet 2025</option>
          <option>Juin 2025</option>
          <option>Mai 2025</option>
          <option>Toute l'année 2025</option>
        </select>
        <button style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, fontSize: '.84rem', color: '#1B3A6B', cursor: 'pointer' }}>
          Planifier un rapport automatique
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {REPORTS.map((r, i) => (
          <div key={i} style={{ background: r.type === 'custom' ? 'linear-gradient(135deg, #1B3A6B, #0F2347)' : '#fff', borderRadius: 16, padding: '26px', border: r.type === 'custom' ? 'none' : '1px solid #E2D9CC', boxShadow: '0 2px 12px rgba(27,58,107,.06)', display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(-2px)'; t.style.boxShadow = '0 10px 28px rgba(27,58,107,.12)' }}
            onMouseLeave={e => { const t = e.currentTarget as HTMLDivElement; t.style.transform = 'translateY(0)'; t.style.boxShadow = '0 2px 12px rgba(27,58,107,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: r.type === 'custom' ? 'rgba(255,255,255,.12)' : 'rgba(27,58,107,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.type === 'custom' ? '#fff' : '#1B3A6B' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[r.type]}/>
                </svg>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ padding: '3px 10px', borderRadius: 99, background: r.type === 'custom' ? 'rgba(255,255,255,.15)' : 'rgba(27,58,107,.07)', color: r.type === 'custom' ? '#fff' : '#1B3A6B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.65rem' }}>{r.format}</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1rem', color: r.type === 'custom' ? '#fff' : '#1a1823', marginBottom: 6 }}>{r.titre}</h3>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.82rem', color: r.type === 'custom' ? 'rgba(255,255,255,.65)' : '#64748b', lineHeight: 1.55 }}>{r.desc}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.72rem', color: r.type === 'custom' ? 'rgba(255,255,255,.4)' : '#94a3b8' }}>{r.date} · {r.taille}</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: r.type === 'custom' ? '1px solid rgba(255,255,255,.25)' : '1.5px solid #1B3A6B', background: r.type === 'custom' ? 'rgba(255,255,255,.1)' : '#1B3A6B', color: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.75rem', cursor: 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {r.type === 'custom'
                    ? <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                    : <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}
                </svg>
                {r.type === 'custom' ? 'Créer' : 'Télécharger'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

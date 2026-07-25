const RAPPORTS = [
  { titre: 'Rapport de suivi — Juin 2025', formateur: 'K. Alaoui', date: '01 juil. 2025', presences: '10/12', note: 78, commentaire: 'Ahmed progresse bien. Sa compréhension orale s\'améliore sensiblement. Travailler davantage l\'expression écrite.', competences: [{ label: 'Compréhension orale', val: 82 }, { label: 'Expression écrite', val: 65 }, { label: 'Vocabulaire', val: 79 }, { label: 'Grammaire', val: 74 }] },
  { titre: 'Rapport de suivi — Mai 2025', formateur: 'K. Alaoui', date: '01 juin 2025', presences: '11/12', note: 74, commentaire: 'Bonne participation en classe. Quelques difficultés avec les temps du passé. Des progrès notables depuis le début de la formation.', competences: [{ label: 'Compréhension orale', val: 76 }, { label: 'Expression écrite', val: 60 }, { label: 'Vocabulaire', val: 75 }, { label: 'Grammaire', val: 68 }] },
]

function CompBar({ label, val }: { label: string; val: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#374151' }}>{label}</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.78rem', color: '#1B3A6B' }}>{val}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#f1ede8', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, borderRadius: 4, background: val >= 75 ? '#059669' : val >= 60 ? '#1B3A6B' : '#C9922A', transition: 'width .6s ease' }}/>
      </div>
    </div>
  )
}

export default function RapportsParticipantPage() {
  return (
    <div style={{ padding: '36px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.6rem', color: '#1a1823', marginBottom: 4 }}>Mes rapports de suivi</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.88rem', color: '#64748b' }}>Rapports pédagogiques envoyés par vos formateurs</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {RAPPORTS.map((r, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2D9CC', overflow: 'hidden', boxShadow: '0 2px 14px rgba(27,58,107,.05)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(to right, #1B3A6B, #2a5298)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#fff', marginBottom: 4 }}>{r.titre}</h2>
                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: 'rgba(255,255,255,.65)' }}>Formateur : {r.formateur} · Généré le {r.date}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.8rem', color: '#C9922A' }}>{r.note}/100</div>
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.68rem', color: 'rgba(255,255,255,.6)' }}>Note globale</div>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                {/* Competences */}
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823', marginBottom: 16 }}>Compétences évaluées</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {r.competences.map(c => <CompBar key={c.label} label={c.label} val={c.val} />)}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823', marginBottom: 12 }}>Suivi de présence</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 900, fontSize: '1.4rem', color: '#1B3A6B' }}>{r.presences}</div>
                    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.78rem', color: '#64748b' }}>sessions<br/>ce mois</div>
                  </div>

                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#1a1823', marginBottom: 10 }}>Commentaire du formateur</h3>
                  <div style={{ background: '#faf8f5', borderRadius: 12, padding: '14px 16px', borderLeft: '3px solid #C9922A' }}>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.83rem', color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.commentaire}"</p>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '.72rem', color: '#94a3b8', marginTop: 8 }}>— {r.formateur}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: '1px solid #E2D9CC', background: '#fff', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700, fontSize: '.8rem', color: '#1B3A6B', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

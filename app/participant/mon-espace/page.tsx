'use client'

const NAVY = '#1B3A6B'
const NAVY_DARK = '#0F2347'
const GOLD = '#C9922A'

const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(27,58,107,.06)',
  border: '1px solid rgba(27,58,107,.07)',
}

const PLANNING = [
  { day: 'Lun', date: '20', label: 'Anglais B2', time: '10h–12h', today: true },
  { day: 'Mar', date: '21', label: '—', time: '', today: false },
  { day: 'Mer', date: '22', label: 'Anglais B2', time: '10h–12h', today: false },
  { day: 'Jeu', date: '23', label: '—', time: '', today: false },
  { day: 'Ven', date: '24', label: 'Anglais B2', time: '10h–12h', today: false },
  { day: 'Sam', date: '25', label: 'Atelier oral', time: '9h–11h', today: false },
]

const COMPETENCES = [
  { label: 'Grammaire', score: 4, max: 5 },
  { label: 'Compréhension', score: 5, max: 5 },
  { label: 'Expression', score: 3, max: 5 },
  { label: 'Écriture', score: 4, max: 5 },
]

const NOTIFS = [
  { icon: 'bell', text: 'Rappel : votre cours est demain à 10h — Salle 1', time: 'Il y a 1h', color: NAVY },
  { icon: 'credit', text: 'Prochain paiement : 450 DH le 1er Février 2025', time: 'Il y a 4h', color: GOLD },
  { icon: 'check', text: 'Nouveaux exercices disponibles : Semaine 4 — Présent perfect', time: 'Hier 14h', color: '#059669' },
]

function Dot({ filled }: { filled: boolean }) {
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: filled ? NAVY : 'rgba(27,58,107,.15)', margin: '0 2px' }} />
}

export default function MonEspacePage() {
  const progress = 68
  const r = 38
  const circ = 2 * Math.PI * r
  const strokeDash = (87 / 100) * circ

  return (
    <div>
      {/* Welcome card */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, borderRadius: 16, padding: '32px 36px', marginBottom: 22, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'rgba(201,146,42,.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 140, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>Bonjour,</p>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', marginBottom: 6, letterSpacing: '-0.4px' }}>Yasmine Bennani 👋</h1>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)' }}>Anglais B2 — Niveau intermédiaire · Groupe du matin</p>

              <div style={{ marginTop: 22, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>Progression du programme</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: GOLD }}>{progress}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.15)', overflow: 'hidden', width: 340 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(to right, ${GOLD}, #e8a83a)`, borderRadius: 4 }} />
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Prochain cours</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>Lundi 20 Jan</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 22, color: GOLD, marginTop: 2 }}>10h00</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>Salle 1 · M. Karimi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 — 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Présences */}
        <div style={{ ...CARD_STYLE }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Présences</h2>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,.1)', borderRadius: 99, padding: '2px 10px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>87%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Donut */}
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(27,58,107,.08)" strokeWidth="9" />
              <circle cx="45" cy="45" r={r} fill="none" stroke="#059669" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${strokeDash} ${circ}`} transform="rotate(-90 45 45)" />
              <text x="45" y="49" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="15" fill={NAVY_DARK}>87%</text>
            </svg>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 22, color: NAVY_DARK }}>42</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8' }}>séances sur 48</div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>6 absences<br />depuis septembre</div>
            </div>
          </div>
        </div>

        {/* Paiement */}
        <div style={{ ...CARD_STYLE }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY_DARK, marginBottom: 18 }}>Paiement</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'rgba(5,150,105,.06)', borderRadius: 9, border: '1px solid rgba(5,150,105,.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13.5, color: '#059669' }}>Statut : À jour ✓</div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>Dernière mens. payée : 1er Jan</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(201,146,42,.06)', borderRadius: 9, border: '1px solid rgba(201,146,42,.15)', marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 3 }}>Prochain paiement</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 20, color: GOLD }}>450 DH</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>1er Février 2025 · Dans 12 jours</div>
          </div>
          <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Payer en ligne →
          </button>
        </div>

        {/* Progression compétences */}
        <div style={{ ...CARD_STYLE }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY_DARK, marginBottom: 18 }}>Compétences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {COMPETENCES.map((c) => (
              <div key={c.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{c.label}</span>
                  <span>
                    {Array.from({ length: c.max }).map((_, i) => <Dot key={i} filled={i < c.score} />)}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(27,58,107,.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.score / c.max) * 100}%`, background: c.score === c.max ? GOLD : NAVY, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 — Planning de la semaine */}
      <div style={{ ...CARD_STYLE, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY_DARK }}>Planning de la semaine</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>20–25 Janvier 2025</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {PLANNING.map((p) => (
            <div key={p.day} style={{
              padding: '14px 12px',
              borderRadius: 10,
              textAlign: 'center',
              background: p.today ? NAVY : p.label !== '—' ? 'rgba(27,58,107,.04)' : '#F5F6F8',
              border: p.today ? 'none' : `1.5px solid ${p.label !== '—' ? 'rgba(27,58,107,.12)' : 'rgba(27,58,107,.06)'}`,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: p.today ? 'rgba(255,255,255,.7)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>{p.day}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: p.today ? '#fff' : '#1a1823', marginBottom: 6 }}>{p.date}</div>
              {p.label !== '—' ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: p.today ? 'rgba(255,255,255,.85)' : NAVY, lineHeight: 1.4 }}>{p.label}</div>
                  <div style={{ fontSize: 10.5, color: p.today ? GOLD : '#94a3b8', marginTop: 4, fontWeight: p.today ? 700 : 400 }}>{p.time}</div>
                </>
              ) : (
                <div style={{ fontSize: 11.5, color: '#cbd5e1' }}>Repos</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 4 — Notifications */}
      <div style={{ ...CARD_STYLE }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: NAVY_DARK, marginBottom: 18 }}>Notifications récentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NOTIFS.map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: i < NOTIFS.length - 1 ? '1px solid rgba(27,58,107,.06)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${n.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={n.color} strokeWidth="2" strokeLinecap="round">
                  {n.icon === 'bell' && <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}
                  {n.icon === 'credit' && <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>}
                  {n.icon === 'check' && <><polyline points="20 6 9 17 4 12"/></>}
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5, marginBottom: 4 }}>{n.text}</p>
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

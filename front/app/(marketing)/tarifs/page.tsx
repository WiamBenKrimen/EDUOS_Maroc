'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAVY = '#1B3A6B'
const GOLD = '#C9922A'

const NAV_LINKS = [
  { label: 'Formations', href: '/#formations' },
  { label: 'Plateforme', href: '/#plateforme' },
  { label: 'Fonctions', href: '/#fonctions' },
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Tarifs', href: '/tarifs', active: true },
  { label: 'Témoignages', href: '/#temoignages' },
  { label: 'Contact', href: '/#contact' },
]

export default function TarifsPage() {
  const [openNav, setOpenNav] = useState(false)
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: 'Starter',
      desc: 'Idéal pour un petit centre qui démarre son activité',
      priceMonthly: 299,
      priceAnnual: 249,
      currency: 'DH/mois',
      color: '#1B3A6B',
      bg: 'rgba(27,58,107,.04)',
      border: 'rgba(27,58,107,.12)',
      popular: false,
      features: [
        'Jusqu\'à 50 participants',
        '2 formateurs inclus',
        'Gestion des inscriptions',
        'Suivi des présences',
        'Tableau de bord directeur',
        'Espace participant web',
        'Support par email sous 24h',
      ],
      disabled: ['Relances WhatsApp automatiques', 'Rapports pédagogiques avancés', 'API & intégrations sur-mesure'],
    },
    {
      name: 'Pro',
      desc: 'La solution complète recommandée pour les centres actifs',
      priceMonthly: 599,
      priceAnnual: 499,
      currency: 'DH/mois',
      color: '#C9922A',
      bg: 'linear-gradient(135deg, rgba(27,58,107,.97) 0%, rgba(15,35,71,1) 100%)',
      border: 'transparent',
      popular: true,
      features: [
        'Jusqu\'à 200 participants',
        '10 formateurs inclus',
        'Toutes les fonctionnalités Starter',
        'Relances WhatsApp automatiques',
        'Rapports pédagogiques avancés',
        'Gestion des paiements & reçus PDF',
        'Espace opérateur complet',
        'Support WhatsApp prioritaire 7j/7',
      ],
      disabled: ['API & intégrations sur-mesure'],
    },
    {
      name: 'Entreprise',
      desc: 'Pour les réseaux de centres et grandes académies',
      priceMonthly: 0,
      priceAnnual: 0,
      currency: 'Sur devis',
      color: '#059669',
      bg: 'rgba(5,150,105,.04)',
      border: 'rgba(5,150,105,.15)',
      popular: false,
      features: [
        'Participants illimités',
        'Formateurs illimités',
        'Toutes les fonctionnalités Pro',
        'API & intégrations sur mesure',
        'Multi-centres & gestion multi-sites',
        'Tableau de bord analytique avancé',
        'Formation sur-mesure des équipes',
        'Account Manager dédié à Casablanca',
        'Garantie de service SLA 99.9%',
      ],
      disabled: [],
    },
  ]

  const cols: Record<string, string[]> = {
    'Plateforme': ['Formations', 'Analytics', 'Certifications', 'Live Sessions', 'Intégrations'],
    'Entreprises': ['PME & ETI', 'Grandes entreprises', 'Secteur public', 'Cas clients', 'Partenaires'],
    'Ressources': ['Blog', 'Guides PDF', 'Webinaires', 'Documentation', "Centre d'aide"],
    'Légal': ['CGU', 'Confidentialité', 'Cookies', 'RGPD', 'Sécurité'],
  }

  return (
    <div style={{ background: '#FFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      {/* ── HEADER NAVBAR ── */}
      <header className="navbar scrolled" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #EEF0F4' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/images/logo.png" alt="EDUOS MAROC" width={130} height={52} style={{ height: 52, width: 'auto', objectFit: 'contain', display: 'block' }} priority />
          </Link>

          <nav className="hide-mob" style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(({ label, href, active }) => (
              <Link key={label} href={href} className="nav-link" style={{ textDecoration: 'none', color: active ? NAVY : undefined, fontWeight: active ? 700 : undefined }}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="hide-mob" style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" className="btn-outline" style={{ padding: '9px 18px', textDecoration: 'none' }}>Se connecter</Link>
            <Link href="/" className="btn-navy" style={{ padding: '9px 18px', textDecoration: 'none' }}>Candidater</Link>
          </div>

          <button onClick={() => setOpenNav(o => !o)} className="show-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {openNav ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {openNav && (
          <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '16px 28px 24px' }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="nav-link" style={{ display: 'block', marginBottom: 6, textDecoration: 'none' }} onClick={() => setOpenNav(false)}>
                {label}
              </Link>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              <Link href="/login" className="btn-outline" style={{ textDecoration: 'none' }} onClick={() => setOpenNav(false)}>Se connecter</Link>
              <Link href="/" className="btn-navy" style={{ textDecoration: 'none', textAlign: 'center' }}>Candidater</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO TARIFS ── */}
      <section style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', padding: '80px 28px 40px', borderBottom: '1px solid #EEF0F4', textAlign: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', lineHeight: 1.12, letterSpacing: '-0.035em', color: '#0F2347', marginBottom: 20 }}>
            Une offre adaptée à chaque centre de formation
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Choisissez la formule taillée pour la croissance de votre établissement. Essai gratuit de 14 jours, sans engagement.
          </p>

          {/* TOGGLE MENSUEL / ANNUEL */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px', background: '#F1F5F9', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <button onClick={() => setAnnual(false)} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.86rem', cursor: 'pointer', background: !annual ? '#fff' : 'transparent', color: !annual ? NAVY : '#64748b', boxShadow: !annual ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .2s' }}>
              Facturation Mensuelle
            </button>
            <button onClick={() => setAnnual(true)} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.86rem', cursor: 'pointer', background: annual ? '#fff' : 'transparent', color: annual ? NAVY : '#64748b', boxShadow: annual ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}>
              Facturation Annuelle
              <span style={{ fontSize: '.7rem', fontWeight: 800, color: '#fff', background: '#059669', borderRadius: 99, padding: '2px 8px' }}>-17% Offerts</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── GRID DES PLANS ── */}
      <section style={{ padding: '70px 28px 100px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'stretch' }}>
            {plans.map((plan, i) => {
              const isPro = plan.popular
              const price = annual ? plan.priceAnnual : plan.priceMonthly
              return (
                <div key={i} style={{
                  borderRadius: 24,
                  padding: isPro ? '44px 36px' : '38px 30px',
                  border: isPro ? 'none' : `1.5px solid ${plan.border}`,
                  background: isPro ? plan.bg : '#fff',
                  boxShadow: isPro ? '0 24px 64px rgba(27,58,107,.25)' : '0 4px 20px rgba(27,58,107,.04)',
                  transform: isPro ? 'scale(1.03)' : 'scale(1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {isPro && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${GOLD}, #e8a83a)`, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.72rem', padding: '6px 20px', borderRadius: 99, letterSpacing: '.06em', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(201,146,42,.35)' }}>
                      ✦ RECOMMANDÉ PAR LES CENTRES
                    </div>
                  )}

                  <div>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: isPro ? '#fff' : '#0F2347', marginBottom: 8 }}>{plan.name}</div>
                      <div style={{ fontSize: '.86rem', color: isPro ? 'rgba(255,255,255,.7)' : '#64748B', lineHeight: 1.5 }}>{plan.desc}</div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                      {plan.priceMonthly === 0 ? (
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.9rem', color: isPro ? '#fff' : plan.color, letterSpacing: '-.04em' }}>{plan.currency}</div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', color: isPro ? GOLD : plan.color, letterSpacing: '-.05em', lineHeight: 1 }}>{price}</span>
                          <span style={{ fontSize: '.92rem', color: isPro ? 'rgba(255,255,255,.6)' : '#94a3b8', fontWeight: 600 }}>DH/mois</span>
                        </div>
                      )}
                      {annual && plan.priceMonthly > 0 && (
                        <div style={{ fontSize: '.75rem', color: isPro ? 'rgba(255,255,255,.5)' : '#94a3b8', marginTop: 6 }}>
                          Facturé {price * 12} DH/an (Économie de {(plan.priceMonthly - plan.priceAnnual) * 12} DH)
                        </div>
                      )}
                    </div>

                    <div style={{ height: 1, background: isPro ? 'rgba(255,255,255,.1)' : 'rgba(27,58,107,.08)', marginBottom: 28 }} />

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 0, marginBottom: 36 }}>
                      {plan.features.map((f, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: isPro ? 'rgba(201,146,42,.22)' : `${plan.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isPro ? GOLD : plan.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span style={{ fontSize: '.86rem', color: isPro ? 'rgba(255,255,255,.88)' : '#374151', lineHeight: 1.5 }}>{f}</span>
                        </li>
                      ))}
                      {plan.disabled && plan.disabled.map((f, fi) => (
                        <li key={`d${fi}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: .4 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </div>
                          <span style={{ fontSize: '.86rem', color: '#94a3b8', lineHeight: 1.5, textDecoration: 'line-through' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/" className="btn-navy" style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: isPro ? 'none' : `1.5px solid ${plan.color}25`,
                    background: isPro ? `linear-gradient(135deg, ${GOLD}, #e8a83a)` : plan.priceMonthly === 0 ? plan.color : '#fff',
                    color: isPro ? '#fff' : plan.priceMonthly === 0 ? '#fff' : plan.color,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer',
                    boxShadow: isPro ? '0 8px 24px rgba(201,146,42,.35)' : 'none',
                    textAlign: 'center', textDecoration: 'none', display: 'block'
                  }}>
                    {plan.priceMonthly === 0 ? 'Demander un devis' : 'Commencer l’essai gratuit'}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER COMPLET ── */}
      <footer id="contact" style={{ background: '#0F2347', color: '#fff', padding: '64px 28px 40px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 52 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ marginBottom: 16 }}>
                <Image src="/images/logo.png" alt="EDUOS MAROC" width={130} height={68} style={{ height: 68, width: 'auto', objectFit: 'contain', display: 'block', filter: 'brightness(1.08)' }} />
              </div>
              <p style={{ fontSize: '.86rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.65, marginBottom: 24, maxWidth: 280 }}>
                La plateforme de gestion des centres de formation au Maroc. Simple, puissante et conforme aux exigences métier.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { title: 'LinkedIn', path: <><rect x="2" y="2" width="20" height="20" rx="4" /><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" /></> },
                  { title: 'Facebook', path: <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></> },
                  { title: 'Instagram', path: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" /></> },
                ].map(s => (
                  <button key={s.title} title={s.title} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', cursor: 'pointer', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.path}</svg>
                  </button>
                ))}
              </div>
            </div>

            {Object.entries(cols).map(([title, links]) => (
              <div key={title}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.08em', color: GOLD, marginBottom: 18 }}>{title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {links.map(l => (
                    <li key={l} style={{ marginBottom: 10 }}>
                      <Link href="/" style={{ fontSize: '.86rem', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.35)', margin: 0 }}>© 2025 EDUOS Maroc — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Français', 'العربية', 'English'].map(l => (
                <button key={l} style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

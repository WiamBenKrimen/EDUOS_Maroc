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
  { label: 'Comment ça marche', href: '/comment-ca-marche', active: true },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Témoignages', href: '/#temoignages' },
  { label: 'Contact', href: '/#contact' },
]

export default function CommentCaMarchePage() {
  const [openNav, setOpenNav] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const steps = [
    {
      num: '01',
      phase: 'Étape 1',
      title: 'Candidature simplifiée de votre centre',
      desc: 'Remplissez notre formulaire en ligne en moins de 3 minutes. Notre équipe analyse votre dossier et vérifie l’éligibilité de votre centre sous 24h.',
      details: [
        'Prise de contact rapide par WhatsApp ou téléphone',
        'Analyse des besoins spécifiques de vos cohortes',
        'Accès de démonstration personnalisé offert'
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: '#1B3A6B',
      bg: 'rgba(27,58,107,.08)',
      image: '/images/step1.png',
    },
    {
      num: '02',
      phase: 'Étape 2',
      title: 'Configuration de l’espace en 24h',
      desc: 'Nos ingénieurs déploient votre instance EDUOS sécurisée aux couleurs de votre établissement avec l’ensemble de vos parcours de formation.',
      details: [
        'Importation facile de la liste des apprenants et formateurs',
        'Création des groupes, plannings et salles de cours',
        'Paramétrage des relances de paiement et alertes d’absence'
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
      color: '#C9922A',
      bg: 'rgba(201,146,42,.1)',
      image: '/images/step2.png',
    },
    {
      num: '03',
      phase: 'Étape 3',
      title: 'Formation & accompagnement des équipes',
      desc: 'Nous formons vos gestionnaires, opérateurs et professeurs lors d’un atelier interactif pour garantir une prise en main immédiate et sans friction.',
      details: [
        'Session de formation en visioconférence de 2 heures',
        'Guides d’utilisation en français et en arabe',
        'Canal WhatsApp direct dédié pour toute assistance'
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      color: '#059669',
      bg: 'rgba(5,150,105,.1)',
      image: '/images/step3.png',
    },
    {
      num: '04',
      phase: 'Étape 4',
      title: 'Lancement & pilotage en temps réel',
      desc: 'Votre centre fonctionne à plein régime. Suivez l’émargement, générez les bulletins et téléchargez vos bilans financiers en 1 clic.',
      details: [
        'Portail apprenant interactif disponible 24/7 sur mobile',
        'Suivi automatisé du taux de présence et d’assiduité',
        'Génération automatique des attestations et reçus'
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
      color: '#7C3AED',
      bg: 'rgba(124,58,237,.1)',
      image: '/images/step4.png',
    },
  ]

  const faqs = [
    {
      q: 'Combien de temps faut-il pour mettre en place EDUOS dans mon centre ?',
      a: 'Le déploiement complet prend moins de 24h à 48h. Une fois votre candidature validée, notre équipe s’occupe de toute la configuration initiale.',
    },
    {
      q: 'Mes formateurs et élèves ont-ils besoin d’installer une application ?',
      a: 'Non, EDUOS est une plateforme web moderne 100% cloud accessible depuis n’importe quel navigateur (Smartphones, Tablettes, PC/Mac) sans aucun téléchargement.',
    },
    {
      q: 'Est-ce que le support est disponible en langue arabe ?',
      a: 'Absolument. Toute la documentation, l’interface et notre équipe de support client à Casablanca sont bilingues en Arabe et Français.',
    },
    {
      q: 'Puis-je tester EDUOS gratuitement avant d’engager mon centre ?',
      a: 'Oui, nous offrons une période d’essai de 14 jours sans aucun engagement ni carte bancaire requise lors de votre candidature.',
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

      {/* ── HERO BANNER ── */}
      <section style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', padding: '80px 28px 60px', borderBottom: '1px solid #EEF0F4', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', lineHeight: 1.12, letterSpacing: '-0.035em', color: '#0F2347', marginBottom: 20 }}>
            Comment fonctionne EDUOS dans votre centre ?
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: 640, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Une expérience fluide de A à Z. Découvrez les 4 étapes simples pour numériser la gestion administrative, pédagogique et financière de vos cohortes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/" className="btn-navy" style={{ padding: '14px 32px', borderRadius: 11, fontSize: '1rem', textDecoration: 'none' }}>
              Candidater mon centre
            </Link>
            <Link href="/tarifs" className="btn-outline" style={{ padding: '14px 32px', borderRadius: 11, fontSize: '1rem', textDecoration: 'none' }}>
              Consulter nos tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── STEPS SECTION ── */}
      <section style={{ padding: '90px 28px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1150, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {steps.map((s, i) => {
              const isEven = i % 2 === 1
              return (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 40,
                  alignItems: 'center',
                  background: isEven ? '#FAFBFC' : '#FFFFFF',
                  borderRadius: 24,
                  padding: '40px 36px',
                  border: '1px solid rgba(27,58,107,.08)',
                  boxShadow: '0 4px 24px rgba(27,58,107,.04)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>{s.num}</span>
                      <span style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.08em', padding: '4px 12px', borderRadius: 99 }}>{s.phase}</span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#0F2347', marginBottom: 16, lineHeight: 1.25 }}>
                      {s.title}
                    </h2>
                    <p style={{ fontSize: '.98rem', color: '#64748B', lineHeight: 1.7, marginBottom: 24 }}>
                      {s.desc}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {s.details.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.88rem', color: '#374151', fontWeight: 500 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(5,150,105,.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 440, borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 40px rgba(27,58,107,.12), 0 2px 8px rgba(0,0,0,.04)', border: '1px solid rgba(27,58,107,.12)', background: '#fff', position: 'relative' }}>
                      <div style={{ position: 'relative', width: '100%', height: 260 }}>
                        <Image src={s.image} alt={s.title} fill style={{ objectFit: 'cover' }} priority={i === 0} />
                      </div>
                      <div style={{ padding: '16px 20px', background: '#fff', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(27,58,107,.06)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <div style={{ width: 18, height: 18 }}>{s.icon}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.9rem', color: '#0F2347' }}>{s.title}</div>
                          <div style={{ fontSize: '.75rem', color: '#64748B' }}>Inclus & configuré par EDUOS Maroc</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section style={{ padding: '80px 28px 100px', background: '#FAFBFC', borderTop: '1px solid #EEF0F4' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="label-pill-navy" style={{ marginBottom: 16, display: 'inline-flex' }}>Questions fréquentes</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: '#0F2347' }}>
              Tout ce que vous devez savoir
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.02)' }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{ width: '100%', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.02rem', color: '#0F2347' }}>{f.q}</span>
                    <span style={{ fontSize: '1.2rem', color: NAVY, fontWeight: 800 }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 22px', fontSize: '.92rem', color: '#64748B', lineHeight: 1.7, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                      {f.a}
                    </div>
                  )}
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

'use client'
// IMAGES: Copy your source images to frontend/public/images/ using these names:
//   logo.png       ← f433ef53-...-removebg-preview.png
//   dashboard.png  ← image-17.png
//   slide2.png     ← image-25.png
//   slide3.png     ← image-26.png

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ── Reveal hook ─────────────────────────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('on'), delay); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [delay])
  return ref
}

/* ── SVG icon library ────────────────────────────────────── */
const Icon = {
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Badge: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 004.5 7v0A2.5 2.5 0 002 9.5V10a2 2 0 002 2h1"/>
      <path d="M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7v0A2.5 2.5 0 0122 9.5V10a2 2 0 01-2 2h-1"/>
      <path d="M12 12v10M8 16H5a2 2 0 01-2-2v-1M16 16h3a2 2 0 002-2v-1"/>
      <circle cx="12" cy="7" r="3"/>
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  Kanban: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
      <path d="M21.5 5.5a10.5 10.5 0 010 13" strokeOpacity=".28" strokeWidth="1.4"/>
      <path d="M2.5 5.5a10.5 10.5 0 000 13" strokeOpacity=".28" strokeWidth="1.4"/>
    </svg>
  ),
  UserX: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="4"/>
      <path d="M2 21v-1.5a6.5 6.5 0 0110.3-5.3"/>
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M17 16l3 3M20 16l-3 3"/>
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path d="M3 11h18"/>
      <circle cx="17" cy="15" r="2"/>
      <path d="M7 3h10l2 4H5z" strokeOpacity=".35"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2"/>
      <line x1="3" y1="9" x2="17" y2="9"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <path d="M19.5 14a3.5 3.5 0 00-3.5-3.5" strokeOpacity=".5"/>
      <polyline points="21 17 19.5 14 16.5 15.5"/>
      <path d="M14.5 18a3.5 3.5 0 003.5 3.5" strokeOpacity=".5"/>
      <polyline points="13 15 14.5 18 17.5 16.5"/>
    </svg>
  ),
  UserCheck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0118 0v6"/>
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/>
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
      <path d="M12 6v2M12 6a3 3 0 013 3" strokeOpacity=".35"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Quote: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" style={{ opacity: .15 }}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  ),
}

/* ── Data ────────────────────────────────────────────────── */
const NOTIF_FEATURES = [
  {
    icon: Icon.Bell, color: '#1B3A6B', bg: 'rgba(27,58,107,.08)',
    title: 'Rappel avant le cours',
    desc: "Vos apprenants reçoivent automatiquement un rappel 24h et 1h avant chaque session pour garantir leur présence.",
    msg: "Bonjour Ahmed, votre session \"Gestion de projet\" commence dans 1 heure. Rejoindre : eduos.ma/session/42",
  },
  {
    icon: Icon.UserX, color: '#DC2626', bg: 'rgba(220,38,38,.08)',
    title: "Notification d'absence",
    desc: "En cas d'absence, une notification est envoyée au responsable et à l'apprenant avec un lien de rattrapage.",
    msg: "Absence détectée : Samira Alami n'a pas rejoint la session du 18/01. Un rattrapage lui a été proposé.",
  },
  {
    icon: Icon.CreditCard, color: '#C9922A', bg: 'rgba(201,146,42,.1)',
    title: 'Rappel de mensualité',
    desc: "Les relances de paiement sont envoyées automatiquement 5 jours avant et le jour de l'échéance.",
    msg: "Rappel : votre mensualité de 450 DH est due le 25/01/2025. Payer en ligne : eduos.ma/paiement",
  },
  {
    icon: Icon.RefreshCw, color: '#059669', bg: 'rgba(5,150,105,.08)',
    title: 'Demande de renouvellement',
    desc: "30 jours avant l'expiration, une demande de renouvellement est envoyée avec une offre personnalisée.",
    msg: "Votre accès expire le 15/02. Renouvelez maintenant et bénéficiez de 15% de réduction : eduos.ma/renew",
  },
  {
    icon: Icon.UserCheck, color: '#7C3AED', bg: 'rgba(124,58,237,.08)',
    title: 'Transfert vers un humain',
    desc: "Quand le chatbot ne peut pas répondre, la conversation est transférée à un conseiller pédagogique en temps réel.",
    msg: "Je vous mets en relation avec notre conseiller pédagogique Karim. Temps d'attente estimé : 2 minutes.",
  },
]

const TESTIMONIALS = [
  { rating: 5, text: '"Mise en place en 1 semaine. Nos formateurs gèrent les présences depuis leur téléphone et les parents reçoivent les rapports automatiquement."', company: 'Institut Al Fath, Casablanca' },
  { rating: 5, text: '"Les relances WhatsApp ont réduit nos impayés de 60%. EDUOS s\'est amorti en moins de 3 mois."', company: 'Centre Lingua, Rabat' },
  { rating: 5, text: '"Enfin une solution pensée pour les centres de formation marocains. Le support en arabe fait toute la différence."', company: 'Académie Réussite, Marrakech' },
]

const IMAGINE_SLIDES = [
  { src: '/images/dashboard.png', alt: 'Tableau de bord EDUOS' },
  { src: '/images/slide2.png',    alt: 'Centre de formation numérique' },
  { src: '/images/slide3.png',    alt: 'Pilotage analytique EDUOS' },
]

/* ── Navbar ──────────────────────────────────────────────── */
const NAV_LINKS: { label: string; target: string }[] = [
  { label: 'Formations',  target: 'formations'  },
  { label: 'Plateforme',  target: 'plateforme'  },
  { label: 'Fonctions',   target: 'fonctions'   },
  { label: 'Témoignages', target: 'temoignages' },
  { label: 'Contact',     target: 'contact'     },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Navbar({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 28px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }} onClick={() => scrollToSection('accueil')}>
          <Image src="/images/logo.png" alt="EDUOS MAROC" width={130} height={52} style={{ height: 52, width: 'auto', objectFit: 'contain', display: 'block' }} priority />
        </div>
        <nav className="hide-mob" style={{ display: 'flex', gap: 2 }}>
          {NAV_LINKS.map(({ label, target }) => (
            <a key={label} className="nav-link" style={{ cursor: 'pointer' }} onClick={() => scrollToSection(target)}>{label}</a>
          ))}
        </nav>
        <div className="hide-mob" style={{ display: 'flex', gap: 10 }}>
          <Link href="/login" className="btn-outline" style={{ padding: '9px 18px', textDecoration: 'none' }}>Se connecter</Link>
          <button className="btn-navy" onClick={() => scrollToSection('contact')}>Candidature simplifiée</button>
        </div>
        <button onClick={() => setOpen(o => !o)} className="show-mob" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '16px 28px 24px' }}>
          {NAV_LINKS.map(({ label, target }) => (
            <a key={label} className="nav-link" style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }} onClick={() => { scrollToSection(target); setOpen(false) }}>{label}</a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <Link href="/login" className="btn-outline" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>Se connecter</Link>
            <button className="btn-navy" onClick={() => { scrollToSection('contact'); setOpen(false) }}>Candidature simplifiée</button>
          </div>
        </div>
      )}
    </header>
  )
}

/* ── Hero ────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="accueil" style={{ paddingTop: 112, paddingBottom: 80, background: '#fff', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -80, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,146,42,.07) 0%, transparent 70%)' }}/>
        <div style={{ position: 'absolute', top: 60, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,58,107,.06) 0%, transparent 70%)' }}/>
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,146,42,.05) 0%, transparent 70%)' }}/>
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="anim-up" style={{ marginBottom: 28 }}>
          <span className="label-pill" style={{ fontSize: '.75rem', letterSpacing: '.06em' }}>La plateforme de gestion des centres de formation au Maroc</span>
        </div>
        <h1 className="anim-up d1" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.6rem, 6vw, 5rem)', lineHeight: 1.06, letterSpacing: '-0.035em', color: 'var(--text)', marginBottom: 0 }}>
          Pilotez votre centre<br/>de formation —
        </h1>
        <div className="anim-up d2" style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 'clamp(2.2rem, 5.2vw, 4.4rem)', lineHeight: 1.12, letterSpacing: '-0.01em', color: 'var(--navy)', marginBottom: 28, display: 'block' }}>
          de l'inscription à la{' '}<span className="squig" style={{ color: 'var(--gold)' }}>certification.</span>
        </div>
        <p className="anim-up d3" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--muted)', marginBottom: 40, lineHeight: 1.72, maxWidth: 560, margin: '0 auto 40px' }}>
          Simple pour vos équipes, rassurant pour les parents — une seule plateforme pour gérer élèves, paiements, présences et certifications.
        </p>
        <div className="anim-up d4" style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-navy" style={{ fontSize: '1rem', padding: '15px 32px', borderRadius: 10 }}>Commencer maintenant</button>
          <button className="btn-outline" style={{ fontSize: '1rem', padding: '15px 32px', borderRadius: 10 }}>Voir comment ça marche</button>
        </div>
        <p className="anim-up d5" style={{ marginTop: 20, fontSize: '.78rem', color: '#b0aab8', fontFamily: 'var(--font-body)' }}>
          Aucune carte bancaire · Déploiement en 24h · Support en arabe et français
        </p>
      </div>
    </section>
  )
}

/* ── FeatureStrip ────────────────────────────────────────── */
function FeatureStrip() {
  const features = [
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6.5" r="3.5"/><path d="M2 20.5v-1.5a5.5 5.5 0 0111 0v1.5"/><circle cx="17.5" cy="8" r="2.5"/><path d="M20.5 20.5v-1a3.5 3.5 0 00-5.2-3.1"/></svg>),
      title: 'Participants centralisés', desc: 'Toutes les données apprenants au même endroit.', accent: 'var(--navy)',
    },
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1.1" fill="currentColor"/><circle cx="12" cy="15" r="1.1" fill="currentColor"/><circle cx="16" cy="15" r="1.1" fill="currentColor"/></svg>),
      title: 'Cohortes & planning', desc: 'Organisez vos groupes et planifiez en toute simplicité.', accent: '#7C3AED',
    },
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z"/><polyline points="9 12 11 14 15 10"/></svg>),
      title: 'Paiements sécurisés', desc: 'Suivi des règlements et facturation fiable.', accent: '#059669',
    },
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1.5"/><path d="M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h3"/><polyline points="9 13 11 15 15 11"/></svg>),
      title: 'Présences fiables', desc: "Suivi en temps réel et feuilles d'émargement.", accent: 'var(--gold)',
    },
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.5 13.5L7 22l5-2 5 2-1.5-8.5"/></svg>),
      title: 'Évaluations complètes', desc: 'QCM, notes et compétences en un clic.', accent: '#DC2626',
    },
    {
      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><polyline points="13 9 11 12 14 12 12 15" strokeLinejoin="round"/></svg>),
      title: 'Relances intelligentes', desc: 'Automatisez les rappels, réduisez les abandons.', accent: '#0369A1',
    },
  ]
  const doubled = [...features, ...features]
  return (
    <section style={{ background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #fff, transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, #fff, transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div className="marquee-strip" style={{ display: 'flex', width: 'max-content' }}>
        {doubled.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 36px', borderRight: '1px solid var(--border)', minWidth: 260, flexShrink: 0, transition: 'background .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-soft)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${f.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.accent }}>
              <div style={{ width: 20, height: 20 }}>{f.icon}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.83rem', color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap' }}>{f.title}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.45, whiteSpace: 'nowrap' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── ImagineSection ──────────────────────────────────────── */
function ImagineSection() {
  const r1 = useReveal(0), r2 = useReveal(160)
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % IMAGINE_SLIDES.length), 3800)
    return () => clearInterval(t)
  }, [])
  return (
    <section id="plateforme" style={{ padding: '100px 28px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div ref={r1} className="reveal">
          <span className="label-pill-navy" style={{ marginBottom: 22, display: 'inline-flex' }}>Pourquoi EDUOS ?</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.7rem, 3vw, 2.6rem)', lineHeight: 1.2, letterSpacing: '-.025em', marginBottom: 20, color: 'var(--text)' }}>
            Une plateforme pensée pour<br/><span className="hl-gold">les centres de formation.</span>
          </h2>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.75, color: 'var(--muted)', marginBottom: 16 }}>
            De l'inscription à la certification, EDUOS centralise la gestion de votre centre : élèves, paiements, présences et communication avec les parents. Aucune complexité, aucune installation lourde.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.75, color: 'var(--muted)', marginBottom: 0 }}>
            Chaque module simplifie une tâche de votre équipe — inscriptions, présences, relances — pour que vous puissiez vous concentrer sur la qualité de vos formations, pas sur l'administratif.
          </p>
        </div>
        <div ref={r2} className="reveal" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 80px rgba(27,58,107,.18), 0 6px 20px rgba(0,0,0,.08)', aspectRatio: '4/3' }}>
            {IMAGINE_SLIDES.map((s, i) => (
              <Image key={i} src={s.src} alt={s.alt} fill style={{ objectFit: 'cover', opacity: i === slide ? 1 : 0, transition: 'opacity .9s ease' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 16 }}>
            {IMAGINE_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 22 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === slide ? 'var(--navy)' : 'rgba(27,58,107,.2)', transition: 'all .3s ease', padding: 0 }} />
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: 40, right: -18, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', gap: 10, animation: 'floatY 3s ease-in-out infinite' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(5,150,105,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
              <div style={{ width: 16, height: 16 }}><Icon.Check /></div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.72rem', color: 'var(--text)' }}>Certification obtenue</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Sara B. · Anglais niveau B2</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── PlatformDesc ────────────────────────────────────────── */
type BulletItem = string | { text: string; badge: string }
interface PlatformCard { icon: () => React.ReactElement; accent: string; title: string; label: string; bullets: BulletItem[]; hasVisual?: boolean }

function FileIcon({ type }: { type: string }) {
  if (type === 'folder') return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
  if (type === 'video') return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}

function PlatformCardEl({ item, delay }: { item: PlatformCard; delay: number }) {
  const rr = useReveal(delay)
  return (
    <div ref={rr} className="reveal" style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', border: '1px solid #e8e4de', boxShadow: '0 4px 20px rgba(27,58,107,.06), 0 1px 4px rgba(0,0,0,.04)', marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.68rem', color: item.accent, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>{item.label}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.18rem', color: 'var(--text)', marginBottom: 20, lineHeight: 1.3 }}>{item.title}</h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: item.hasVisual ? 22 : 0 }}>
        {item.bullets.map((b, bi) => {
          const isObj = typeof b === 'object'
          const label = isObj ? (b as { text: string; badge: string }).text : b as string
          const badge = isObj ? (b as { text: string; badge: string }).badge : null
          return (
            <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', flexShrink: 0, marginTop: 8 }}/>
              <span style={{ fontSize: '.87rem', color: '#475569', lineHeight: 1.55 }}>
                {label}
                {badge && <span style={{ marginLeft: 7, display: 'inline-block', fontSize: '.63rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 8px', borderRadius: 99, verticalAlign: 'middle' }}>{badge}</span>}
              </span>
            </li>
          )
        })}
      </ul>
      {item.hasVisual && (
        <div style={{ background: '#13111e', borderRadius: 10, padding: '14px 16px', marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }}/><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }}/><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }}/>
            <span style={{ marginLeft: 8, fontSize: '.62rem', color: '#475569', fontFamily: 'var(--font-body)' }}>Ressources / Anglais B2</span>
          </div>
          {[
            { type: 'folder', name: 'Groupe Anglais B2', meta: 'dossier' },
            { type: 'video',  name: 'Cours_01_Introduction.mp4', meta: 'vidéo' },
            { type: 'doc',    name: 'Exercices_Semaine1.pdf', meta: 'PDF' },
            { type: 'doc',    name: 'QCM_Compréhension.pdf', meta: 'PDF' },
          ].map((f, fi) => (
            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: fi < 3 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
              <FileIcon type={f.type} />
              <span style={{ flex: 1, fontSize: '.72rem', color: fi === 0 ? '#93c5fd' : '#cbd5e1', fontFamily: 'var(--font-body)' }}>{f.name}</span>
              <span style={{ fontSize: '.6rem', color: '#475569', fontFamily: 'var(--font-body)' }}>{f.meta}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlatformDesc() {
  const r = useReveal(0)
  const left: PlatformCard[] = [
    { icon: Icon.BarChart, accent: 'var(--navy)', title: 'Tableau de bord direction', label: 'DIRECTION & PILOTAGE', bullets: ["Nombre d'élèves inscrits et actifs","Chiffre d'affaires encaissé en temps réel","Mensualités en retard avec relance automatique","Absences du jour par groupe","Taux de remplissage des groupes (complets / incomplets)","Renouvellements d'inscription à venir"] },
    { icon: Icon.Users, accent: 'var(--navy)', title: 'Gestion opérationnelle complète', label: 'ADMINISTRATION', bullets: ["Inscription des élèves en quelques clics","Planification et gestion des groupes","Présence enregistrée par QR code ou code simple","Suivi des paiements mensuels par élève","Génération automatique des attestations de fin de formation","Rapports de suivi envoyés aux parents",{ text: "Calcul de la rémunération des formateurs", badge: "Bientôt disponible" }] },
  ]
  const right: PlatformCard[] = [
    { icon: Icon.FileText, accent: 'var(--gold)', title: 'Ressources pédagogiques centralisées', label: 'PÉDAGOGIE', hasVisual: true, bullets: ["Supports de cours, vidéos et exercices en un seul endroit","Intégration Google Drive ou équivalent","Accessible depuis n'importe quel appareil","Organisé par groupe et niveau"] },
    { icon: Icon.Chat, accent: 'var(--navy)', title: 'WhatsApp intégré — 5 automatisations clés', label: 'COMMUNICATION', bullets: ["Rappel avant chaque cours (24h et 1h avant)","Notification d'absence aux parents en temps réel","Rappel et relance des mensualités impayées","Demande de renouvellement d'inscription","Transfert vers un conseiller humain pour les cas sensibles"] },
  ]
  return (
    <section id="formations" style={{ padding: '100px 28px', background: '#F5F6F8' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="label-pill" style={{ marginBottom: 22, display: 'inline-flex' }}>Plateforme tout-en-un</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.18, letterSpacing: '-.028em', color: 'var(--text)', marginBottom: 4 }}>De l'inscription jusqu'à la certification,</h2>
          <div style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', color: 'var(--navy)', marginBottom: 22, lineHeight: 1.25 }}>
            tout est{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span className="hl-gold">piloté</span>
              <svg aria-hidden="true" style={{ position: 'absolute', left: '-12px', top: '-5px', width: 'calc(100% + 24px)', height: 'calc(100% + 10px)', pointerEvents: 'none', overflow: 'visible' }} viewBox="0 0 110 42" fill="none">
                <path d="M8 21 C10 6 30 1 55 1.5 C80 2 103 7 105 21 C107 34 84 41 55 41 C26 41 5 35 8 21Z" stroke="var(--gold)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {' '}en temps réel.
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '1.02rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.72 }}>EDUOS accompagne l'élève à chaque étape de son parcours tout en donnant à la direction un pilotage complet.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div>{left.map((item, i) => <PlatformCardEl key={item.title} item={item} delay={i * 80} />)}</div>
          <div>{right.map((item, i) => <PlatformCardEl key={item.title} item={item} delay={i * 80 + 60} />)}</div>
        </div>
      </div>
    </section>
  )
}

/* ── NotificationSection ─────────────────────────────────── */
function NotificationSection() {
  const [active, setActive] = useState(0)
  const r = useReveal(0)
  const current = NOTIF_FEATURES[active]
  return (
    <section style={{ padding: '100px 28px', background: 'var(--bg-soft)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="label-pill" style={{ marginBottom: 20, display: 'inline-flex' }}>Notifications intelligentes</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '-.025em', color: 'var(--text)', marginBottom: 14 }}>
            Gardez vos apprenants<br/><span className="hl-gold">toujours engagés.</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.02rem', maxWidth: 520, margin: '0 auto' }}>EDUOS envoie automatiquement les bons messages au bon moment, sans aucune intervention manuelle.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 56, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NOTIF_FEATURES.map((f, i) => {
              const IconCmp = f.icon
              const isActive = active === i
              return (
                <button key={f.title} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${isActive ? 'rgba(27,58,107,.2)' : 'transparent'}`, background: isActive ? '#fff' : 'transparent', boxShadow: isActive ? '0 4px 20px rgba(27,58,107,.08)' : 'none', textAlign: 'left', transition: 'all .2s' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                    <div style={{ width: 20, height: 20 }}><IconCmp /></div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.9rem', color: 'var(--text)', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55, display: isActive ? 'block' : 'none' }}>{f.desc}</div>
                  </div>
                  {isActive && <div style={{ marginLeft: 'auto', color: 'var(--navy)', flexShrink: 0, paddingTop: 2 }}><div style={{ width: 16, height: 16 }}><Icon.ArrowRight /></div></div>}
                </button>
              )
            })}
          </div>
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ maxWidth: 340, margin: '0 auto' }}>
              <div style={{ background: '#1a1823', borderRadius: 40, padding: 14, boxShadow: '0 32px 80px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.06)' }}>
                <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <div style={{ width: 80, height: 10, borderRadius: 5, background: '#2a2838' }}/>
                </div>
                <div style={{ background: '#f0ece7', borderRadius: 28, overflow: 'hidden', minHeight: 460 }}>
                  <div style={{ background: 'var(--navy)', padding: '12px 20px 20px', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.65rem', marginBottom: 10, opacity: .7, fontFamily: 'var(--font-body)' }}><span>9:41</span><span>●●● WiFi</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <div style={{ width: 18, height: 18 }}><current.icon /></div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.78rem', color: '#fff' }}>EDUOS</div>
                        <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.6)' }}>{current.title}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ textAlign: 'center', fontSize: '.62rem', color: '#aaa', fontFamily: 'var(--font-body)' }}>{"Aujourd'hui à 9:41"}</div>
                    <div key={`msg-${active}`} style={{ animation: 'slideIn .35s ease both' }}>
                      <div style={{ borderRadius: 14, padding: '12px 14px', background: '#fff', border: '1px solid var(--border)', fontSize: '.8rem', lineHeight: 1.55, color: 'var(--text)', fontFamily: 'var(--font-body)', maxWidth: '90%' }}>{current.msg}</div>
                      <div style={{ fontSize: '.6rem', color: '#bbb', fontFamily: 'var(--font-body)', marginTop: 4, marginLeft: 4 }}>EDUOS · Lu</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ borderRadius: 14, padding: '10px 14px', background: 'var(--navy)', color: '#fff', fontSize: '.8rem', lineHeight: 1.5, fontFamily: 'var(--font-body)', maxWidth: '78%', borderBottomRightRadius: 3 }}>Merci pour le rappel !</div>
                      <div style={{ fontSize: '.6rem', color: '#bbb', fontFamily: 'var(--font-body)', marginTop: 4, marginRight: 4 }}>Envoyé · 9:42</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: '#fff', borderRadius: 14, width: 'fit-content', border: '1px solid var(--border)' }}>
                      {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--navy)', opacity: .3, animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${j * .3}s` }}/>)}
                    </div>
                  </div>
                  <div style={{ margin: '8px 12px 14px', background: '#fff', borderRadius: 22, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)' }}>
                    <span style={{ flex: 1, fontSize: '.75rem', color: '#ccc', fontFamily: 'var(--font-body)' }}>Répondre…</span>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
                  <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── VideoSection ────────────────────────────────────────── */
function VideoSection() {
  const r = useReveal(0)
  const [playing, setPlaying] = useState(false)
  return (
    <section style={{ padding: '80px 28px', background: '#fff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="label-pill-navy" style={{ marginBottom: 18, display: 'inline-flex' }}>Découvrez la plateforme</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)', letterSpacing: '-.025em', color: 'var(--text)', marginBottom: 12 }}>
            Voyez EDUOS <span className="hl-gold">en action</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>Comment des centres de formation marocains gèrent inscriptions, présences, paiements et certifications depuis une seule plateforme.</p>
        </div>
        <div className="browser-frame" style={{ overflow: 'hidden' }}>
          <div className="browser-bar">
            <div className="bdot" style={{ background: '#ff5f57' }}/><div className="bdot" style={{ background: '#febc2e' }}/><div className="bdot" style={{ background: '#28c840' }}/>
            <div style={{ flex: 1, background: '#ede8e2', borderRadius: 5, height: 22, marginLeft: 8, padding: '0 10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '.68rem', color: '#999', fontFamily: 'var(--font-body)' }}>app.eduos.ma — Démonstration</span>
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
            {playing ? (
              <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allow="autoplay; fullscreen" allowFullScreen title="Démonstration EDUOS"/>
            ) : (
              <>
                <Image src="https://images.unsplash.com/photo-1763038311036-6d18805537e5?w=1200&h=675&fit=crop&auto=format" alt="Aperçu EDUOS" fill style={{ objectFit: 'cover' }}/>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,35,71,.38)' }}/>
                <div onClick={() => setPlaying(true)} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="var(--navy)" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>Regarder la démonstration</p>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-body)', fontSize: '.8rem', textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>2 min pour comprendre comment EDUOS transforme la gestion de votre centre</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 44, flexWrap: 'wrap' }}>
          {[{ val: '50 000+', label: 'Apprenants actifs' },{ val: '120+', label: 'Centres de formation' },{ val: '4.9 / 5', label: 'Note de satisfaction' },{ val: '98%', label: 'Taux de renouvellement' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--navy)', letterSpacing: '-.02em' }}>{s.val}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--muted)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FeaturesSection ─────────────────────────────────────── */
function FeaturesSection() {
  const [active, setActive] = useState(0)
  const r = useReveal(0)
  const tabs = [
    { label: 'Cours bien expliqués', icon: Icon.FileText, img: 'https://images.unsplash.com/photo-1558095625-f882e3436125?w=900&h=460&fit=crop', title: 'Des cours clairs, structurés et accessibles', desc: "Chaque formateur peut mettre en ligne ses supports, vidéos et exercices en quelques clics. Les élèves accèdent à leurs cours depuis n'importe quel appareil, à leur rythme." },
    { label: 'Sessions en direct', icon: Icon.Video, img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&h=460&fit=crop', title: 'Apprenez ensemble, partout', desc: "Organisez des sessions live intégrées, des ateliers collaboratifs et du mentorat en temps réel pour un apprentissage collectif et durable." },
  ]
  return (
    <section id="fonctions" style={{ padding: '100px 28px', background: 'var(--bg-soft)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="label-pill" style={{ marginBottom: 20, display: 'inline-flex' }}>Fonctionnalités clés</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)', lineHeight: 1.2, letterSpacing: '-.025em', color: 'var(--text)', marginBottom: 14 }}>
            <span className="hl-blue">Améliorez</span> la qualité<br/>de votre formation
          </h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {tabs.map((t, i) => {
            const IC = t.icon
            return (
              <button key={t.label} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.84rem', padding: '9px 18px', borderRadius: 9, cursor: 'pointer', border: 'none', background: active === i ? 'var(--navy)' : '#fff', color: active === i ? '#fff' : 'var(--muted)', boxShadow: active === i ? '0 4px 14px rgba(27,58,107,.28)' : '0 1px 4px rgba(0,0,0,.06)', transition: 'all .2s' }}>
                <div style={{ width: 16, height: 16 }}><IC /></div>{t.label}
              </button>
            )
          })}
        </div>
        <div className="browser-frame">
          <div className="browser-bar">
            <div className="bdot" style={{ background: '#ff5f57' }}/><div className="bdot" style={{ background: '#febc2e' }}/><div className="bdot" style={{ background: '#28c840' }}/>
            <div style={{ flex: 1, background: '#ede8e2', borderRadius: 5, height: 22, marginLeft: 8, padding: '0 10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '.68rem', color: '#aaa' }}>app.eduos.ma</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <Image key={active} src={tabs[active].img} alt={tabs[active].title} width={1060} height={360} style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block' }}/>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(15,35,71,.8))', padding: '40px 32px 28px' }}>
              <h3 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: 8 }}>{tabs[active].title}</h3>
              <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '.88rem', maxWidth: 500, lineHeight: 1.6 }}>{tabs[active].desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── DiffSection — DiffCard extracted to avoid hook-in-map ─ */
function DiffCard({ icon: IC, title, desc, dark, delay }: { icon: () => React.ReactElement; title: string; desc: string; dark: boolean; delay: number }) {
  const rr = useReveal(delay)
  return (
    <div ref={rr} className="reveal card" style={{ padding: '38px 34px', background: dark ? 'var(--navy-dark)' : '#fff', boxShadow: dark ? '0 8px 32px rgba(15,35,71,.5)' : '0 4px 24px rgba(27,58,107,.08)', border: dark ? '1px solid rgba(255,255,255,.08)' : '1px solid var(--border)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: dark ? 'rgba(147,197,253,.12)' : 'rgba(27,58,107,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? '#93c5fd' : 'var(--navy)', marginBottom: 22 }}>
        <div style={{ width: 24, height: 24 }}><IC /></div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, color: dark ? '#fff' : 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: '.93rem', lineHeight: 1.72, color: dark ? 'rgba(255,255,255,.65)' : 'var(--muted)' }}>{desc}</p>
    </div>
  )
}

function DiffSection() {
  const r = useReveal(0)
  const cards = [
    { icon: Icon.Shield, title: 'Sécurité & conformité', desc: 'Hébergement souverain au Maroc, conforme RGPD et aux réglementations locales. Vos données restent sous votre contrôle.', dark: true },
    { icon: Icon.Zap, title: 'Aucun frais de lock-in', desc: 'Pas de format propriétaire. Exportez vos données à tout moment en CSV, Excel ou via notre API REST documentée.', dark: false },
    { icon: Icon.Users, title: 'Support en arabe, français', desc: "Une équipe dédiée, disponible en arabe et en français, pour vous accompagner de l'intégration jusqu'au déploiement.", dark: false },
    { icon: Icon.BarChart, title: 'Prix transparent', desc: 'Tarification simple et prévisible. Vous payez par apprenant actif — pas de frais cachés, pas de surprises en fin de mois.', dark: false },
  ]
  return (
    <section style={{ padding: '100px 28px', background: '#fff' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)', lineHeight: 1.25 }}>
            Un logiciel conçu pour<br/><span style={{ color: 'var(--navy)' }}>faire la différence.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {cards.map((c, i) => <DiffCard key={c.title} icon={c.icon} title={c.title} desc={c.desc} dark={c.dark} delay={i * 90} />)}
        </div>
      </div>
    </section>
  )
}

/* ── SocialProof ─────────────────────────────────────────── */
function SocialProof() {
  const r = useReveal(0)
  const photos = [
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1562337404-3044c84ac061?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
  ]
  const NAVY = 'var(--navy)', GOLD = 'var(--gold)', SOFT = '#e8e3ec'
  const rows = [
    [{ type:'square',size:64,color:SOFT},{type:'photo',size:72,photoIdx:0},{type:'square',size:56,color:NAVY},{type:'empty',size:40},{type:'circle',size:60,color:SOFT},{type:'photo',size:68,photoIdx:1},{type:'photo',size:76,photoIdx:2},{type:'circle',size:52,color:SOFT},{type:'photo',size:64,photoIdx:3},{type:'circle',size:60,color:SOFT},{type:'square',size:56,color:GOLD}],
    [{type:'empty',size:30},{type:'square',size:52,color:SOFT},{type:'photo',size:64,photoIdx:4},{type:'circle',size:48,color:NAVY},{type:'photo',size:56,photoIdx:5},{type:'empty',size:40},{type:'photo',size:60,photoIdx:6},{type:'empty',size:36}],
    [{type:'photo',size:68,photoIdx:7},{type:'empty',size:28},{type:'circle',size:52,color:SOFT},{type:'photo',size:64,photoIdx:8},{type:'square',size:44,color:GOLD},{type:'circle',size:60,color:SOFT},{type:'photo',size:72,photoIdx:9},{type:'square',size:48,color:NAVY},{type:'circle',size:56,color:SOFT}],
  ]
  return (
    <section style={{ padding: '80px 0 100px', background: '#faf8f5', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', marginBottom: 0 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
            {row.map((item, ci) => {
              const br = item.type === 'circle' ? '50%' : item.type === 'square' ? '12px' : '14px'
              if (item.type === 'empty') return <div key={ci} style={{ width: item.size }}/>
              if (item.type === 'photo') return <Image key={ci} src={photos[item.photoIdx ?? 0]} alt="" width={item.size} height={item.size} style={{ width: item.size, height: item.size, borderRadius: br, objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}/>
              return <div key={ci} style={{ width: item.size, height: item.size, borderRadius: br, background: item.color, flexShrink: 0, opacity: item.color === SOFT ? 0.55 : 1 }}/>
            })}
          </div>
        ))}
      </div>
      <div ref={r} className="reveal" style={{ textAlign: 'center', marginTop: -60, position: 'relative', zIndex: 2, padding: '0 28px' }}>
        <div style={{ background: 'rgba(250,248,245,.85)', backdropFilter: 'blur(8px)', display: 'inline-block', padding: '28px 48px', borderRadius: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)', color: 'var(--text)', marginBottom: 8 }}>
            Rejoignez <span style={{ color: 'var(--navy)' }}>50 000 apprenants</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '.95rem', color: 'var(--muted)', marginBottom: 24 }}>qui développent leurs compétences avec EDUOS Maroc</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 24 }}>
            {[{val:'50 000+',label:'Apprenants'},{val:'120+',label:'Centres de formation'},{val:'4.9',label:'Note / 5'},{val:'98%',label:'Satisfaction'}].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--navy)' }}>{s.val}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn-navy" style={{ padding: '12px 28px' }}>Rejoindre la communauté</button>
        </div>
      </div>
    </section>
  )
}

/* ── TestimonialSection ──────────────────────────────────── */
function TestimonialSection() {
  const r = useReveal(0)
  return (
    <section id="temoignages" style={{ padding: '100px 28px', background: '#fff' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--gold)' }}><Icon.Quote /></div>
          <blockquote className="quote-text" style={{ marginBottom: 36, fontStyle: 'italic' }}>
            "Avant EDUOS, je passais 2 heures par jour à gérer les absences et relancer les parents par WhatsApp manuellement. Aujourd'hui tout est automatique — je me concentre sur la pédagogie, pas sur l'administratif."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 44 }}>
            <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="Directeur de centre" width={54} height={54} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}/>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '.92rem' }}>Youssef El Mansouri</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Directeur · Centre de langues Avenir, Fès</div>
            </div>
            <div style={{ marginLeft: 14, padding: '5px 14px', background: 'var(--bg-soft)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '.95rem', color: 'var(--navy)' }}>Avenir Fès</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.company} style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 14, border: '1px solid var(--border)', textAlign: 'left', flex: '1 1 190px', maxWidth: 230 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {Array.from({ length: t.rating }).map((_, i) => <div key={i} style={{ width: 12, height: 12, color: 'var(--gold)' }}><Icon.Star /></div>)}
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--text)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.5 }}>{t.text}</p>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{t.company}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTASection ──────────────────────────────────────────── */
function CTASection() {
  const r = useReveal(0)
  return (
    <section style={{ padding: '80px 28px', background: 'var(--bg-soft)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div ref={r} className="reveal" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i / 16) * 2 * Math.PI
                return <line key={i} x1={55 + 28 * Math.cos(a)} y1={55 + 28 * Math.sin(a)} x2={55 + 50 * Math.cos(a)} y2={55 + 50 * Math.sin(a)} stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
              })}
              <circle cx="55" cy="55" r="26" fill="var(--gold-light)" stroke="var(--gold)" strokeWidth="1.5"/>
              <text x="55" y="51" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--navy)" fontFamily="var(--font-display)">ESSAI</text>
              <text x="55" y="64" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--navy)" fontFamily="var(--font-display)">GRATUIT</text>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.6rem)', color: 'var(--text)', lineHeight: 1.18, marginBottom: 16 }}>
            Libérez votre<br/><span style={{ color: 'var(--navy)' }}>potentiel de croissance</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: 36, maxWidth: 440, margin: '0 auto 36px' }}>Rejoignez 120+ centres de formation marocains qui pilotent mieux, perdent moins de temps et fidélisent davantage leurs élèves.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <button className="btn-navy" style={{ fontSize: '1.02rem', padding: '14px 30px' }}>Commencer maintenant</button>
            <button className="btn-outline" style={{ fontSize: '1.02rem', padding: '14px 30px' }}>Parler à un expert</button>
          </div>
          <p style={{ fontSize: '.78rem', color: '#bbb', fontFamily: 'var(--font-body)' }}>Aucune carte bancaire · 14 jours d'essai · Annulation à tout moment</p>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  const cols: Record<string, string[]> = {
    'Plateforme':  ['Formations', 'Analytics', 'Certifications', 'Live Sessions', 'Intégrations'],
    'Entreprises': ['PME & ETI', 'Grandes entreprises', 'Secteur public', 'Cas clients', 'Partenaires'],
    'Ressources':  ['Blog', 'Guides PDF', 'Webinaires', 'Documentation', "Centre d'aide"],
    'Légal':       ['CGU', 'Confidentialité', 'Cookies', 'RGPD', 'Sécurité'],
  }
  return (
    <footer id="contact" style={{ background: 'var(--navy-dark)', color: '#fff', padding: '64px 28px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: 40, marginBottom: 52 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <Image src="/images/logo.png" alt="EDUOS MAROC" width={130} height={68} style={{ height: 68, width: 'auto', objectFit: 'contain', display: 'block', filter: 'brightness(1.08)' }} />
            </div>
            <p style={{ fontSize: '.86rem', color: 'rgba(255,255,255,.45)', lineHeight: 1.65, marginBottom: 24, maxWidth: 210 }}>La plateforme e-learning des entreprises marocaines. Simple, puissante, abordable.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { title: 'LinkedIn', path: <><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/></> },
                { title: 'Facebook', path: <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></> },
                { title: 'Instagram', path: <><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></> },
                { title: 'X / Twitter', path: <><path d="M4 4l16 16M20 4 4 20"/></> },
              ].map(s => (
                <button key={s.title} title={s.title} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', color: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s, color .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.16)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.55)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.path}</svg>
                </button>
              ))}
            </div>
          </div>
          {Object.entries(cols).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gold)', marginBottom: 18 }}>{title}</h4>
              <ul style={{ listStyle: 'none' }}>
                {links.map(l => (
                  <li key={l} style={{ marginBottom: 10 }}>
                    <a style={{ fontSize: '.86rem', color: 'rgba(255,255,255,.42)', cursor: 'pointer', transition: 'color .15s', textDecoration: 'none' }}
                       onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                       onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.42)')}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.28)' }}>© 2025 EDUOS Maroc — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Français', 'العربية', 'English'].map(l => (
              <button key={l} style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Page root ───────────────────────────────────────────── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <div>
      <Navbar scrolled={scrolled} />
      <main>
        <Hero />
        <FeatureStrip />
        <ImagineSection />
        <PlatformDesc />
        <NotificationSection />
        <VideoSection />
        <FeaturesSection />
        <DiffSection />
        <SocialProof />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

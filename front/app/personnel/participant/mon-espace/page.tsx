'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ParticipantOverview from '../participant-overview'

type Detail = {
  eyebrow: string
  title: string
  description: string
  icon: 'calendar' | 'chart' | 'bell' | 'document'
  facts: { label: string; value: string }[]
  action?: { label: string; href: string }
}

const SEANCES = [
  { jour: 'Lun', date: '20', status: 'Présent', done: true, time: '10h00 – 12h00' },
  { jour: 'Mer', date: '22', status: 'Présent', done: true, time: '10h00 – 12h00' },
  { jour: 'Ven', date: '24', status: 'Présent', done: true, time: '09h00 – 11h00' },
  { jour: 'Lun', date: '27', status: 'À venir', done: false, time: '10h00 – 12h00' },
  { jour: 'Mer', date: '29', status: 'À venir', done: false, time: '10h00 – 12h00' },
]

const PROGRESS = [
  { label: 'Grammaire', pct: 78, note: 'Très bon niveau' },
  { label: 'Vocabulaire', pct: 65, note: 'En progression' },
  { label: 'Expression écrite', pct: 72, note: 'Objectif presque atteint' },
  { label: 'Compréhension orale', pct: 55, note: 'À renforcer' },
]

const NOTIFS = [
  { id: 1, title: 'Rappel de cours', text: 'Votre cours est demain à 10h — Salle 1', time: 'Il y a 1h', tone: 'blue', read: false },
  { id: 2, title: 'Paiement à venir', text: 'Prochaine mensualité : 450 DH le 1er février 2025', time: 'Il y a 4h', tone: 'gold', read: false },
  { id: 3, title: 'Nouveau contenu', text: 'Exercices disponibles : Semaine 4 — Present perfect', time: 'Hier à 14h', tone: 'green', read: true },
]

const DOCS = [
  { name: 'Attestation de présence.pdf', type: 'Attestation', date: '10 Jan 2025', size: '284 Ko' },
  { name: 'Programme Anglais B2.pdf', type: 'Programme', date: '2 Jan 2025', size: '1,2 Mo' },
  { name: 'Règlement intérieur.pdf', type: 'Administratif', date: '1 Jan 2025', size: '620 Ko' },
]

const ICONS = {
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="m9 16 2 2 4-5"/></>,
  chart: <><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M14 21h-4"/></>,
  document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
}

function DetailPage({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <section className="part-detail-page" aria-label={detail.title}>
      <div className="part-detail-toolbar">
        <button className="part-back-button" onClick={onClose}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Retour à mon espace
        </button>
        <span>Dernière mise à jour : aujourd’hui</span>
      </div>

      <div className="part-detail-hero">
        <div className="part-detail-head">
          <div className="part-detail-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[detail.icon]}
            </svg>
          </div>
          <div>
            <span className="part-detail-eyebrow">{detail.eyebrow}</span>
            <h1>{detail.title}</h1>
            <p>{detail.description}</p>
          </div>
          <span className="part-detail-status"><i /> Information à jour</span>
        </div>
      </div>

      <div className="part-detail-layout">
        <article className="part-detail-main-card">
          <div className="part-detail-card-title">
            <div><span>Détails</span><h2>Informations principales</h2></div>
            <span className="part-detail-card-icon">i</span>
          </div>
        <div className="part-detail-facts">
          {detail.facts.map((fact) => (
            <div className="part-detail-fact" key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
        </article>

        <aside className="part-detail-side-card">
          <span className="part-section-kicker">Actions rapides</span>
          <h2>Que souhaitez-vous faire ?</h2>
        {detail.action && (
          <Link href={detail.action.href} className="part-detail-action">
            {detail.action.label}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        )}
        <div className="part-detail-help">
          <span className="part-help-icon">?</span>
          <div><strong>Besoin d’aide ?</strong><small>Contactez l’administration depuis votre espace participant.</small></div>
        </div>
        </aside>
      </div>
    </section>
  )
}

export default function MonEspacePage() {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [notifList, setNotifList] = useState(NOTIFS)
  const [toast, setToast] = useState<string | null>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2600)
  }

  const showCourse = () => setDetail({
    eyebrow: 'Prochaine séance',
    title: 'Present perfect & conversation',
    description: 'Une séance pratique pour consolider le Present Perfect et gagner en fluidité à l’oral.',
    icon: 'calendar',
    facts: [
      { label: 'Date', value: 'Lundi 27 janvier 2025' },
      { label: 'Horaire', value: '10h00 – 12h00' },
      { label: 'Salle', value: 'Salle 1 · 1er étage' },
      { label: 'Formateur', value: 'M. Karimi' },
      { label: 'À préparer', value: 'Exercices de la semaine 4' },
    ],
    action: { label: 'Ouvrir les ressources du cours', href: '/personnel/participant/ressources' },
  })

  const showProgress = (item?: typeof PROGRESS[number]) => setDetail({
    eyebrow: item ? 'Détail de compétence' : 'Votre parcours',
    title: item?.label || 'Progression Anglais B2',
    description: item ? `${item.note}. Consultez vos résultats et les ressources recommandées pour continuer à progresser.` : 'Votre progression est calculée à partir des cours suivis, exercices terminés et évaluations.',
    icon: 'chart',
    facts: item ? [
      { label: 'Progression', value: `${item.pct}%` },
      { label: 'Dernière évaluation', value: item.pct >= 70 ? 'Très satisfaisant' : 'En cours d’acquisition' },
      { label: 'Objectif du module', value: '80%' },
      { label: 'Conseil', value: item.pct < 60 ? '2 exercices recommandés' : 'Continuez ainsi' },
    ] : [
      { label: 'Programme complété', value: '68%' },
      { label: 'Séances suivies', value: '24 sur 28' },
      { label: 'Exercices terminés', value: '18 sur 24' },
      { label: 'Prochain objectif', value: 'Atteindre 75%' },
    ],
    action: { label: 'Voir mes rapports détaillés', href: '/personnel/participant/rapports' },
  })

  const openNotification = (notification: typeof NOTIFS[number]) => {
    setNotifList((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item))
    setDetail({
      eyebrow: 'Notification',
      title: notification.title,
      description: notification.text,
      icon: 'bell',
      facts: [
        { label: 'Reçue', value: notification.time },
        { label: 'Statut', value: 'Lue' },
        { label: 'Formation', value: 'Anglais B2 · Groupe matin' },
      ],
      action: notification.id === 2
        ? { label: 'Consulter mes paiements', href: '/personnel/participant/paiement' }
        : { label: 'Consulter les ressources', href: '/personnel/participant/ressources' },
    })
  }

  const openDocument = (document: typeof DOCS[number]) => setDetail({
    eyebrow: document.type,
    title: document.name,
    description: 'Ce document officiel est disponible dans votre espace personnel. Vous pouvez le consulter ou le télécharger à tout moment.',
    icon: 'document',
    facts: [
      { label: 'Ajouté le', value: document.date },
      { label: 'Format', value: 'PDF' },
      { label: 'Taille', value: document.size },
      { label: 'Accès', value: 'Privé · Compte participant' },
    ],
    action: { label: 'Voir tous mes documents', href: '/personnel/participant/documents' },
  })

  return (
    <div className="part-dashboard">
      {toast && <div className="part-toast"><span>✓</span>{toast}</div>}
      {detail && <DetailPage detail={detail} onClose={() => setDetail(null)} />}

      {!detail && <ParticipantOverview onCourse={showCourse} onProgress={()=>showProgress()} onNotice={openNotification} notices={notifList} />}

      {false && <div className="participant-editorial mx-auto space-y-7">
        <section className="editorial-hero relative overflow-hidden bg-[#0f2347] px-8 py-12 text-white md:px-14 md:py-16">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[55px] border-white/[0.035]" />
          <div className="relative z-10 max-w-4xl">
            <div className="max-w-2xl">
              <div className="mb-9 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400"><span>EDUOS</span><span className="text-amber-400">/</span><span>Mon espace</span></div>
              <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-amber-400">Lundi 27 janvier · Bonjour Yasmine</span>
              <h1 className="editorial-title mt-4 text-4xl font-black leading-[1.08] tracking-[-.04em] md:text-5xl">Votre apprentissage,<br/><span className="text-amber-400">en un seul regard.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">Retrouvez votre prochaine séance, votre progression et les dernières informations utiles de votre parcours Anglais B2.</p>
            </div>
            <button onClick={showCourse} className="group mt-12 block w-full border-0 border-t border-white/20 bg-transparent pt-7 text-left text-white">
              <span className="text-[10px] font-black tracking-[.16em] text-amber-400">PROCHAINE SÉANCE · DANS 2 JOURS</span>
              <span className="mt-5 block text-sm font-bold text-slate-300">Lundi 27 janvier · 10:00 — 12:00</span>
              <h2 className="mt-2 text-2xl font-black leading-tight">Present perfect & conversation</h2>
              <span className="mt-4 block text-xs text-slate-400">Salle 1 · M. Karimi · 2 heures</span>
              <span className="mt-6 inline-flex items-center gap-3 text-xs font-bold text-amber-400">Voir la séance <i className="font-normal not-italic">→</i></span>
            </button>
          </div>
        </section>

        <section className="editorial-links bg-white px-7 py-3 md:px-10">
          {[
            {n:'01',title:'Continuer à apprendre',sub:'9 ressources disponibles',href:'/personnel/participant/ressources'},
            {n:'02',title:'Ma présence',sub:'87% de participation',href:'#presence'},
            {n:'03',title:'Gérer mes paiements',sub:'450 DH · 1er février',href:'/personnel/participant/paiement'},
            {n:'04',title:'Mes documents',sub:'3 nouveaux fichiers',href:'/personnel/participant/documents'},
          ].map((item,index)=>index===1?
            <button key={item.n} onClick={()=>showProgress()} className="group flex w-full items-start gap-5 border-0 border-b border-slate-200 bg-transparent py-5 text-left"><span className="pt-1 text-xs font-black text-amber-600">{item.n}</span><span className="flex-1"><strong className="block text-sm text-[#0f2347]">{item.title}</strong><small className="mt-1 block text-xs text-slate-400">{item.sub}</small></span><span className="text-slate-300 group-hover:text-amber-600">→</span></button>:
            <Link key={item.n} href={item.href} className="group flex items-start gap-5 border-0 border-b border-slate-200 py-5 text-left no-underline"><span className="pt-1 text-xs font-black text-amber-600">{item.n}</span><span className="flex-1"><strong className="block text-sm text-[#0f2347]">{item.title}</strong><small className="mt-1 block text-xs text-slate-400">{item.sub}</small></span><span className="text-slate-300 group-hover:text-amber-600">→</span></Link>
          )}
        </section>

        <section className="editorial-body space-y-12 bg-white px-7 py-10 md:px-10">
          <article className="border-0 bg-transparent">
            <div className="flex items-start justify-between"><div><span className="text-[10px] font-black tracking-[.14em] text-slate-400">ACTIVITÉ RÉCENTE</span><h2 className="mt-2 text-xl font-black text-[#0f2347]">Ce qui s’est passé</h2></div><Link href="/personnel/participant/notifications" className="text-xs font-bold text-[#1b3a6b] no-underline">Tout voir →</Link></div>
            <div className="mt-8 space-y-1">
              {notifList.map((notification,index)=><button key={notification.id} onClick={()=>openNotification(notification)} className="group grid w-full grid-cols-[18px_1fr_auto] gap-4 border-0 border-b border-slate-100 bg-transparent py-5 text-left last:border-0 hover:bg-slate-50">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${index===0?'bg-blue-500':index===1?'bg-amber-500':'bg-emerald-500'}`}/><span><small className="text-[10px] text-slate-400">{notification.time}</small><strong className="mt-1 block text-sm text-[#0f2347]">{notification.title}</strong><span className="mt-1 block text-xs text-slate-500">{notification.text}</span></span><span className="self-center text-slate-300 group-hover:text-[#0f2347]">→</span>
              </button>)}
            </div>
          </article>

          <div className="space-y-12 border-t border-slate-200 pt-10">
            <article className="bg-transparent">
              <div><span className="text-[10px] font-black tracking-[.14em] text-slate-400">PROGRESSION</span><h2 className="mt-2 text-lg font-black text-[#0f2347]">Anglais B2 · 68%</h2><button onClick={()=>showProgress()} className="mt-2 border-0 bg-transparent p-0 text-xs font-bold text-amber-700">Voir le détail →</button></div>
              <div className="mt-7 space-y-5">{PROGRESS.slice(0,3).map(item=><button key={item.label} onClick={()=>showProgress(item)} className="block w-full border-0 bg-transparent p-0 text-left"><span className="flex justify-between text-xs font-bold text-slate-600"><span>{item.label}</span><span>{item.pct}%</span></span><span className="mt-2 block h-1 bg-slate-200"><i className="block h-full bg-[#1b4d85]" style={{width:`${item.pct}%`}}/></span></button>)}</div>
            </article>
            <article className="border-t border-slate-200 pt-10"><span className="text-[10px] font-black tracking-[.14em] text-slate-400">CETTE SEMAINE</span><div className="mt-5 space-y-0">{SEANCES.map((s,i)=><button key={s.date} onClick={showCourse} className="flex w-full items-center justify-between border-0 border-b border-slate-100 bg-transparent py-4 text-left text-xs text-slate-600"><span>{s.jour} {s.date} janvier</span><strong className={i===3?'text-amber-700':'text-slate-400'}>{i===3?'Prochaine séance':s.status}</strong></button>)}</div></article>
          </div>
        </section>
      </div>}

      {false && <div className="part-new-dashboard">
        <section className="part-new-hero">
          <div className="part-new-greeting">
            <div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Mon espace</span></div>
            <span className="part-new-overline">Lundi 27 janvier</span>
            <h1>Prête pour votre<br /><em>prochain cours ?</em></h1>
            <p>Bonjour Yasmine, votre parcours Anglais B2 avance très bien.</p>
            <button onClick={showCourse}>Voir la séance <span>→</span></button>
          </div>
          <button className="part-new-course" onClick={showCourse}>
            <span className="part-new-course-top"><i>PROCHAINE SÉANCE</i><em>Dans 2 jours</em></span>
            <span className="part-new-course-time">10:00</span>
            <strong>Present perfect<br />& conversation</strong>
            <span className="part-new-course-meta">Salle 1 <i /> M. Karimi <i /> 2 heures</span>
            <span className="part-new-course-arrow">↗</span>
          </button>
          <button className="part-new-score" onClick={() => showProgress()}>
            <span className="part-new-score-ring"><strong>68</strong><small>%</small></span>
            <span><small>PROGRESSION GLOBALE</small><strong>Anglais B2</strong><em>+8% ce mois</em></span>
          </button>
        </section>

        <nav className="part-new-shortcuts" aria-label="Accès rapides">
          <Link href="/personnel/participant/ressources"><span>01</span><strong>Continuer à apprendre</strong><small>9 ressources disponibles</small><i>→</i></Link>
          <button onClick={() => setDetail({
            eyebrow: 'Assiduité', title: 'Ma présence', description: 'Votre assiduité depuis le début de la formation.',
            icon: 'calendar', facts: [{ label: 'Taux actuel', value: '87%' }, { label: 'Présences', value: '24 séances' }, { label: 'Absences', value: '2 justifiées' }, { label: 'Évolution', value: '+5% ce mois' }],
          })}><span>02</span><strong>Voir ma présence</strong><small>87% de participation</small><i>→</i></button>
          <Link href="/personnel/participant/paiement"><span>03</span><strong>Gérer mes paiements</strong><small>450 DH · 1er février</small><i>→</i></Link>
          <Link href="/personnel/participant/documents"><span>04</span><strong>Mes documents</strong><small>3 nouveaux fichiers</small><i>→</i></Link>
        </nav>

        <section className="part-new-content">
          <div className="part-new-timeline">
            <div className="part-new-section-head">
              <div><span>ACTIVITÉ RÉCENTE</span><h2>Ce qui s’est passé</h2></div>
              <span className="part-new-unread">{notifList.filter((n) => !n.read).length} nouveau</span>
            </div>
            <div className="part-new-feed">
              {notifList.map((notification, index) => (
                <button key={notification.id} onClick={() => openNotification(notification)}>
                  <span className={`part-new-feed-dot ${notification.tone}`} />
                  <span className="part-new-feed-line" />
                  <span className="part-new-feed-copy"><small>{notification.time}</small><strong>{notification.title}</strong><p>{notification.text}</p></span>
                  <span className="part-new-feed-arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="part-new-week">
            <div className="part-new-section-head">
              <div><span>MON RYTHME</span><h2>Cette semaine</h2></div>
              <button onClick={() => showProgress()}>Voir le bilan</button>
            </div>
            <div className="part-new-week-days">
              {SEANCES.map((session, index) => (
                <button key={session.date} className={index === 3 ? 'active' : ''} onClick={() => setDetail({
                  eyebrow: session.done ? 'Séance terminée' : 'Séance à venir',
                  title: `${session.jour} ${session.date} janvier · ${session.time}`,
                  description: session.done ? 'Votre présence à cette séance a bien été enregistrée.' : 'Cette séance est planifiée dans votre calendrier.',
                  icon: 'calendar',
                  facts: [{ label: 'Statut', value: session.status }, { label: 'Horaire', value: session.time }, { label: 'Salle', value: 'Salle 1' }, { label: 'Formateur', value: 'M. Karimi' }],
                })}>
                  <small>{session.jour}</small><strong>{session.date}</strong><i className={session.done ? 'done' : ''} />
                </button>
              ))}
            </div>
            <div className="part-new-skills">
              {PROGRESS.slice(0, 3).map((item) => (
                <button key={item.label} onClick={() => showProgress(item)}>
                  <span><strong>{item.label}</strong><em>{item.pct}%</em></span>
                  <i><span style={{ width: `${item.pct}%` }} /></i>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="part-new-footer">
          <span>DERNIERS DOCUMENTS</span>
          {DOCS.slice(0, 2).map((document) => (
            <button key={document.name} onClick={() => openDocument(document)}>
              <span className="part-new-file-icon">PDF</span>
              <span><strong>{document.name}</strong><small>{document.date} · {document.size}</small></span>
              <i>↗</i>
            </button>
          ))}
          <Link href="/personnel/participant/documents">Tout voir →</Link>
        </footer>
      </div>}
    </div>
  )
}

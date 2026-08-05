'use client'

import {
  ArrowClockwise,
  CalendarBlank,
  CalendarPlus,
  CaretRight,
  ChartBar,
  ChartLineUp,
  Check,
  CheckCircle,
  ClipboardText,
  CornersIn,
  CornersOut,
  FileText,
  GraduationCap,
  Lightning,
  MagnifyingGlass,
  PaperPlaneRight,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkle,
  Trash,
  UserPlus,
  UsersThree,
  Wallet,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api-client'
import RichAssistantMessage from './assistant-rich-message'
import styles from './assistant-panel.module.css'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  tone?: 'default' | 'error' | 'success'
}

type PendingAction = {
  id: string
  action: string
  title: string
  description: string
  details: Array<{ label: string; value: string }>
  expires_at: string
}

type AssistantStatus = {
  configured: boolean
  provider: string
  model: string
  capabilities: string[]
}

type ChatResponse = {
  reply: string
  pending_action: PendingAction | null
}

type ActionResult = {
  action: string
  message: string
  result: Record<string, unknown>
}

const COMMANDS = [
  {
    label: 'Briefing du jour',
    hint: 'Priorités, alertes et prochaines séances',
    prompt: 'Fais-moi un briefing du centre avec les priorités du jour',
    icon: ChartLineUp,
  },
  {
    label: 'Retrouver une personne',
    hint: 'Nom, téléphone, e-mail ou matricule',
    prompt: 'Aide-moi à retrouver un apprenant',
    icon: MagnifyingGlass,
  },
  {
    label: 'Traiter les impayés',
    hint: 'Factures, soldes et règles de relance',
    prompt: 'Analyse les factures en retard et propose la prochaine action',
    icon: Wallet,
  },
  {
    label: 'Piloter le planning',
    hint: 'Créer, modifier ou déplacer une séance',
    prompt: 'Aide-moi à organiser le planning des prochaines séances',
    icon: CalendarPlus,
  },
  {
    label: 'Inscrire un apprenant',
    hint: 'Compte, cohorte, plan et contrat',
    prompt: 'Je veux inscrire un nouvel apprenant',
    icon: UserPlus,
  },
  {
    label: 'Préparer les attestations',
    hint: 'Éligibilité et génération contrôlée',
    prompt: 'Montre-moi les attestations qui peuvent être générées',
    icon: FileText,
  },
]

const CAPABILITY_GROUPS = [
  { icon: ChartBar, title: 'Pilotage', description: 'Synthèses, indicateurs et priorités de direction.', example: 'Résume la situation du centre.' },
  { icon: GraduationCap, title: 'Scolarité', description: 'Apprenants, inscriptions, cohortes et attestations.', example: 'Inscris Amine dans la cohorte du soir.' },
  { icon: UsersThree, title: 'Équipe et prospects', description: 'Recherche, création et suivi des contacts.', example: 'Passe ce prospect au statut en cours.' },
  { icon: CalendarBlank, title: 'Planning', description: 'Séances, modifications et demandes de changement.', example: 'Déplace la séance de demain à 15 h.' },
  { icon: Receipt, title: 'Finance', description: 'Factures, paiements, impayés et relances.', example: 'Enregistre le paiement de cette facture.' },
  { icon: Wallet, title: 'Rémunérations', description: 'Contrôle et validation du statut des rémunérations.', example: 'Montre les rémunérations encore en attente.' },
  { icon: PaperPlaneRight, title: 'Communication', description: 'Recherche de contacts et messages WhatsApp confirmés.', example: 'Prépare un message WhatsApp pour un apprenant.' },
  { icon: ClipboardText, title: 'Rapports', description: 'Recherche, lecture et aide à la décision.', example: 'Compare les rapports de cette cohorte.' },
]

const PAGE_TITLES: Record<string, string> = {
  '/directeur': 'Tableau de bord',
  '/directeur/prospects': 'Prospects',
  '/directeur/inscription': 'Inscription',
  '/directeur/cohortes': 'Cohortes',
  '/directeur/paiements': 'Paiements',
  '/directeur/paiements/factures': 'Factures',
  '/directeur/paiements/relances': 'Relances',
  '/directeur/renouvellements': 'Renouvellements',
  '/directeur/formateurs': 'Personnel',
  '/directeur/planning': 'Planning',
  '/directeur/attestations': 'Attestations',
  '/directeur/rapports': 'Rapports',
  '/directeur/messages': 'Messages WhatsApp',
}

function messageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function pageTitle(pathname: string) {
  return PAGE_TITLES[pathname]
    ?? Object.entries(PAGE_TITLES).find(([path]) => path !== '/directeur' && pathname.startsWith(path))?.[1]
    ?? 'Espace Directeur'
}

export default function DirectorAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [view, setView] = useState<'assistant' | 'capabilities'>('assistant')
  const [status, setStatus] = useState<AssistantStatus | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [acting, setActing] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open || status) return
    api.get<AssistantStatus>('/director/assistant/status')
      .then(setStatus)
      .catch(() => setStatus({ configured: false, provider: 'NVIDIA NIM', model: '', capabilities: [] }))
  }, [open, status])

  useEffect(() => {
    if (!open) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.clearTimeout(focusTimer)
    }
  }, [open])

  useEffect(() => {
    if (view === 'assistant') endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, pendingAction, sending, view])

  async function sendMessage(text: string) {
    const clean = text.trim()
    if (!clean || sending || pendingAction || !status?.configured) return
    const history = messages
      .filter(message => message.tone !== 'error')
      .map(({ role, content }) => ({ role, content }))
    setView('assistant')
    setMessages(current => [...current, { id: messageId(), role: 'user', content: clean }])
    setInput('')
    setSending(true)
    try {
      const response = await api.post<ChatResponse>('/director/assistant/chat', {
        message: clean,
        history,
        page_path: pathname,
        page_title: pageTitle(pathname),
      })
      setMessages(current => [...current, { id: messageId(), role: 'assistant', content: response.reply }])
      setPendingAction(response.pending_action)
    } catch (error) {
      setMessages(current => [...current, {
        id: messageId(),
        role: 'assistant',
        content: error instanceof Error ? error.message : "Le copilote n'a pas pu répondre.",
        tone: 'error',
      }])
    } finally {
      setSending(false)
    }
  }

  async function confirmAction() {
    if (!pendingAction || acting) return
    setActing(true)
    try {
      const response = await api.post<ActionResult>(`/director/assistant/actions/${pendingAction.id}/confirm`, {})
      const password = typeof response.result.temporary_password === 'string'
        ? `\nMot de passe temporaire : ${response.result.temporary_password}`
        : ''
      setMessages(current => [...current, {
        id: messageId(),
        role: 'assistant',
        content: `${response.message}${password}`,
        tone: 'success',
      }])
      setPendingAction(null)
      window.dispatchEvent(new CustomEvent('eduos:assistant-action-completed', {
        detail: { action: response.action, result: response.result },
      }))
    } catch (error) {
      setMessages(current => [...current, {
        id: messageId(),
        role: 'assistant',
        content: error instanceof Error ? error.message : "L'action n'a pas pu être exécutée.",
        tone: 'error',
      }])
    } finally {
      setActing(false)
    }
  }

  async function cancelAction() {
    if (!pendingAction || acting) return
    setActing(true)
    try {
      await api.post(`/director/assistant/actions/${pendingAction.id}/cancel`, {})
      setPendingAction(null)
      setMessages(current => [...current, {
        id: messageId(),
        role: 'assistant',
        content: "L'action a été annulée. Aucune donnée n'a été modifiée.",
      }])
    } catch (error) {
      setMessages(current => [...current, {
        id: messageId(),
        role: 'assistant',
        content: error instanceof Error ? error.message : "L'action n'a pas pu être annulée.",
        tone: 'error',
      }])
    } finally {
      setActing(false)
    }
  }

  function clearConversation() {
    if (pendingAction) return
    setMessages([])
    setInput('')
    setView('assistant')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void sendMessage(input)
  }

  const isReady = status?.configured === true
  const capabilityCount = status?.capabilities?.length ?? 0

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(current => !current)}
        aria-label={open ? 'Fermer le Copilote Direction' : 'Ouvrir le Copilote Direction'}
        aria-expanded={open}
        aria-controls="director-ai-panel"
      >
        <span className={styles.triggerIcon}><Sparkle size={19} weight="fill" /></span>
        <span className={styles.triggerCopy}><strong>EDU IA</strong><small>Copilote Direction</small></span>
      </button>

      {open && <>
      <button
        type="button"
        className={`${styles.backdrop} ${styles.backdropOpen}`}
        onClick={() => setOpen(false)}
        aria-label="Fermer le copilote"
        tabIndex={0}
      />

      <section
        id="director-ai-panel"
        className={`${styles.panel} ${styles.panelOpen} ${maximized ? styles.panelMaximized : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Copilote Direction EDUOS"
        aria-hidden={false}
      >
        <header className={styles.header}>
          <div className={styles.brandmark}><Sparkle size={21} weight="fill" /></div>
          <div className={styles.heading}>
            <div className={styles.titleRow}>
              <strong>EDU IA</strong>
              <span className={`${styles.connection} ${isReady ? styles.connectionReady : ''}`}>
                {isReady ? <Check size={11} weight="bold" /> : <ArrowClockwise size={11} />}
                {isReady ? 'Opérationnel' : 'Vérification'}
              </span>
            </div>
            <span>Poste de commande du directeur</span>
          </div>
          <div className={styles.headerContext}>
            <span>Vous consultez</span>
            <strong>{pageTitle(pathname)}</strong>
          </div>
          <div className={styles.headerActions}>
            <button type="button" onClick={() => setMaximized(current => !current)} aria-label={maximized ? 'Réduire' : 'Agrandir'} title={maximized ? 'Réduire' : 'Agrandir'}>
              {maximized ? <CornersIn size={19} /> : <CornersOut size={19} />}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" title="Fermer"><X size={20} /></button>
          </div>
        </header>

        <div className={styles.workspace}>
          <aside className={styles.rail}>
            <button type="button" className={styles.newTask} onClick={clearConversation} disabled={!!pendingAction}>
              <Plus size={17} weight="bold" /> Nouvelle mission
            </button>
            <nav aria-label="Navigation du copilote">
              <button type="button" className={view === 'assistant' ? styles.navActive : ''} onClick={() => setView('assistant')}>
                <Sparkle size={18} weight={view === 'assistant' ? 'fill' : 'regular'} />
                <span><strong>Assistant</strong><small>Analyser et agir</small></span>
              </button>
              <button type="button" className={view === 'capabilities' ? styles.navActive : ''} onClick={() => setView('capabilities')}>
                <Lightning size={18} weight={view === 'capabilities' ? 'fill' : 'regular'} />
                <span><strong>Compétences</strong><small>Ce que l'IA maîtrise</small></span>
              </button>
            </nav>
            <div className={styles.railStatus}>
              <span className={styles.securityIcon}><ShieldCheck size={18} weight="fill" /></span>
              <div><strong>Contrôle directeur</strong><p>Toute modification exige votre confirmation.</p></div>
            </div>
            <div className={styles.coverage}>
              <span>Couverture métier</span>
              <strong>{capabilityCount || 8} domaines</strong>
              <small>Données limitées à votre centre</small>
            </div>
          </aside>

          <main className={styles.main}>
            {view === 'assistant' ? (
              <>
                <div className={styles.contextBar}>
                  <span><GraduationCap size={16} /> Contexte actif : <strong>{pageTitle(pathname)}</strong></span>
                  <span><ShieldCheck size={15} weight="fill" /> Actions sécurisées</span>
                </div>

                <div className={styles.messages} aria-live="polite">
                  {status === null && (
                    <div className={styles.systemState}>
                      <div className={styles.stateSkeleton}><span /><span /><span /></div>
                      <strong>Connexion aux outils EDUOS</strong>
                      <p>Vérification des données et des autorisations du centre.</p>
                    </div>
                  )}

                  {status?.configured === false && (
                    <div className={`${styles.systemState} ${styles.systemError}`}>
                      <WarningCircle size={30} weight="fill" />
                      <strong>Le moteur IA n'est pas configuré</strong>
                      <p>Ajoutez la clé NVIDIA au serveur pour activer le Copilote Direction.</p>
                    </div>
                  )}

                  {isReady && messages.length === 0 && (
                    <div className={styles.welcome}>
                      <div className={styles.welcomeCopy}>
                        <span className={styles.welcomeIcon}><Sparkle size={22} weight="fill" /></span>
                        <div>
                          <span className={styles.welcomeLabel}>Prêt à piloter</span>
                          <h2>Quelle mission voulez-vous accomplir ?</h2>
                          <p>Posez une question, demandez une analyse ou confiez une action. Le copilote travaille avec les données réelles du centre.</p>
                        </div>
                      </div>
                      <div className={styles.commandGrid}>
                        {COMMANDS.map(({ label, hint, prompt, icon: Icon }) => (
                          <button key={label} type="button" onClick={() => void sendMessage(prompt)}>
                            <span className={styles.commandIcon}><Icon size={20} /></span>
                            <span><strong>{label}</strong><small>{hint}</small></span>
                            <CaretRight size={16} className={styles.commandArrow} />
                          </button>
                        ))}
                      </div>
                      <button type="button" className={styles.discoverButton} onClick={() => setView('capabilities')}>
                        Voir toutes les compétences <CaretRight size={15} />
                      </button>
                    </div>
                  )}

                  {messages.map(message => (
                    <article key={message.id} className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage} ${message.tone === 'error' ? styles.errorMessage : ''} ${message.tone === 'success' ? styles.successMessage : ''}`}>
                      {message.role === 'assistant' && <span className={styles.messageIcon}><Sparkle size={13} weight="fill" /></span>}
                      {message.role === 'assistant' ? <RichAssistantMessage content={message.content} /> : <p>{message.content}</p>}
                    </article>
                  ))}

                  {sending && (
                    <div className={styles.thinking} aria-label="Analyse en cours">
                      <span className={styles.messageIcon}><Sparkle size={13} weight="fill" /></span>
                      <div><strong>Analyse des données du centre</strong><span /><span /><span /></div>
                    </div>
                  )}

                  {pendingAction && (
                    <article className={styles.actionCard}>
                      <header>
                        <span><ShieldCheck size={23} weight="fill" /></span>
                        <div><small>Votre validation est requise</small><h3>{pendingAction.title}</h3></div>
                      </header>
                      <p>{pendingAction.description}</p>
                      <dl>
                        {pendingAction.details.map(detail => (
                          <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>
                        ))}
                      </dl>
                      <footer>
                        <button type="button" className={styles.secondaryButton} onClick={() => void cancelAction()} disabled={acting}>Annuler</button>
                        <button type="button" className={styles.primaryButton} onClick={() => void confirmAction()} disabled={acting}>
                          {acting ? <ArrowClockwise size={17} className={styles.spin} /> : <CheckCircle size={17} weight="fill" />}
                          Confirmer l'action
                        </button>
                      </footer>
                    </article>
                  )}
                  <div ref={endRef} />
                </div>

                <form className={styles.composer} onSubmit={submit}>
                  <label htmlFor="director-ai-input">Confiez une mission au copilote</label>
                  <div className={styles.composerField}>
                    <textarea
                      ref={inputRef}
                      id="director-ai-input"
                      value={input}
                      onChange={event => setInput(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          if (input.trim()) void sendMessage(input)
                        }
                      }}
                      placeholder={pendingAction ? "Confirmez ou annulez l'action en attente" : 'Exemple : analyse les impayés et propose les priorités de relance'}
                      rows={2}
                      disabled={!isReady || sending || !!pendingAction}
                    />
                    <button type="submit" disabled={!isReady || !input.trim() || sending || !!pendingAction} aria-label="Envoyer la demande">
                      <PaperPlaneRight size={19} weight="fill" />
                    </button>
                  </div>
                  <div className={styles.composerMeta}>
                    <span>Entrée pour envoyer, Maj + Entrée pour une nouvelle ligne</span>
                    <span>Les actions restent sous votre contrôle</span>
                  </div>
                </form>
              </>
            ) : (
              <section className={styles.capabilityPage}>
                <header>
                  <span className={styles.capabilityMark}><Lightning size={22} weight="fill" /></span>
                  <div><span>Compétences connectées</span><h2>Un copilote formé au métier de directeur</h2><p>Il consulte les données réelles, prépare les opérations disponibles et vous demande toujours confirmation avant une modification.</p></div>
                </header>
                <div className={styles.capabilityGrid}>
                  {CAPABILITY_GROUPS.map(({ icon: Icon, title, description, example }) => (
                    <article key={title}>
                      <span><Icon size={21} /></span>
                      <div><h3>{title}</h3><p>{description}</p><button type="button" onClick={() => void sendMessage(example)}>{example}<CaretRight size={14} /></button></div>
                    </article>
                  ))}
                </div>
                <div className={styles.capabilityFooter}>
                  <ShieldCheck size={20} weight="fill" />
                  <div><strong>Une IA utile, mais jamais hors contrôle</strong><p>Elle ne fabrique pas de données, ne mélange pas les centres et n'exécute aucune modification sans votre accord.</p></div>
                </div>
              </section>
            )}
          </main>
        </div>
      </section>
      </>}
    </>
  )
}

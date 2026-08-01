'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api-client'
import type { ParticipantProfile } from '@/lib/participant-types'

type Invoice = { id: string; numero: string; periode: string; date_emission: string; date_echeance: string; montant_ht: number; taxe: number; montant_ttc: number; statut: string; montant_paye: number; reference: string | null; methode: string | null; paid_at: string | null; cohorte: string; formation: string }
type PaymentMethod = { id: string; methode: string; libelle: string; instructions: string | null; banque: string | null; iban: string | null; provider: string | null }
type PaymentData = { items: Invoice[]; methods: PaymentMethod[] }

const statusLabels: Record<string, string> = { payee: 'Confirmé', en_attente: 'À venir', en_retard: 'En retard', partiellement_payee: 'Partiel', annulee: 'Annulée', brouillon: 'Brouillon', emise: 'Émise' }
const methodLabels: Record<string, string> = { virement: 'Virement bancaire', carte: 'Carte bancaire', especes: 'Espèces', cheque: 'Chèque', autre: 'Autre' }

function formatPeriod(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function methodIcon(method: string) {
  if (method === 'virement') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M2 21h20M12 3 2 8h20z"/></svg>
  if (method === 'carte') return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg>
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

export default function PaiementPage() {
  const [data, setData] = useState<PaymentData>({ items: [], methods: [] })
  const [profile, setProfile] = useState<ParticipantProfile | null>(null)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('Tous')
  const [page, setPage] = useState(1)
  const perPage = 4

  useEffect(() => {
    Promise.all([api.get<PaymentData>('/participant/payments'), api.get<ParticipantProfile>('/participant/account')])
      .then(([payments, account]) => { setData(payments); setProfile(account) })
      .catch(error => setError(error instanceof Error ? error.message : 'Impossible de charger les paiements.'))
  }, [])

  const filteredPayments = useMemo(() => data.items.filter(invoice => {
    const method = methodLabels[invoice.methode ?? ''] ?? invoice.methode ?? 'Non réglé'
    return `${invoice.numero} ${invoice.periode} ${invoice.reference ?? ''} ${method}`.toLowerCase().includes(query.toLowerCase()) && (methodFilter === 'Tous' || method === methodFilter)
  }), [data.items, query, methodFilter])
  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / perPage))
  const visiblePayments = filteredPayments.slice((page - 1) * perPage, page * perPage)
  const nextInvoice = data.items.find(invoice => !['payee', 'annulee'].includes(invoice.statut)) ?? null
  const paidInvoices = data.items.filter(invoice => invoice.statut === 'payee')

  const timeline = useMemo(() => {
    const anchorValue = data.items[0]?.periode ?? new Date().toISOString()
    const anchor = new Date(anchorValue)
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(anchor.getFullYear(), anchor.getMonth() - (5 - index), 1)
      const invoice = data.items.find(item => {
        const period = new Date(item.periode)
        return period.getFullYear() === date.getFullYear() && period.getMonth() === date.getMonth()
      })
      return { label: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(), invoice }
    })
  }, [data.items])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  const download = (invoice: Invoice) => {
    const text = `EDUOS MAROC — REÇU\nRéférence : ${invoice.reference ?? invoice.numero}\nPériode : ${formatPeriod(invoice.periode)}\nMontant : ${invoice.montant_ttc} DH\nMontant payé : ${invoice.montant_paye} DH\nDate : ${new Date(invoice.paid_at ?? invoice.date_emission).toLocaleDateString('fr-FR')}\nMode : ${methodLabels[invoice.methode ?? ''] ?? invoice.methode ?? 'Non renseigné'}\nParticipant : ${profile ? `${profile.prenom} ${profile.nom}` : ''}`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = `Recu_${invoice.numero}.txt`; link.click(); URL.revokeObjectURL(url)
    notify('Votre reçu a été téléchargé.')
  }

  const exportAll = () => {
    const rows = data.items.map(invoice => `${formatPeriod(invoice.periode)} | ${invoice.montant_ttc} DH | ${statusLabels[invoice.statut] ?? invoice.statut} | ${invoice.reference ?? invoice.numero}`).join('\n')
    const url = URL.createObjectURL(new Blob([`RELEVÉ EDUOS\n\n${rows}`], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'Releve_paiements_EDUOS.txt'; link.click(); URL.revokeObjectURL(url)
    notify('Le relevé complet a été exporté.')
  }

  const paymentMethods = Array.from(new Set(data.items.map(invoice => methodLabels[invoice.methode ?? ''] ?? invoice.methode).filter(Boolean))) as string[]
  const dueDate = nextInvoice ? new Date(nextInvoice.date_echeance) : null

  return <div className="pay-pro-page">
    {toast && <div className="part-toast"><span>✓</span>{toast}</div>}
    {error && <div className="auth-error" role="alert">{error}</div>}
    <header className="pay-pro-header"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Paiements</span></div><h1>Situation financière</h1><p>Consultez vos échéances et gérez vos règlements.</p></div><button onClick={exportAll} disabled={!data.items.length}>↓ Exporter le relevé</button></header>

    <section className="pay-ledger">
      <main className="pay-ledger-main">
        <div className="pay-ledger-intro"><span>RELEVÉ DE FORMATION</span><h2>Vos mensualités</h2><p>Une lecture simple de tous les règlements liés à votre formation {profile?.formation ?? ''}.</p></div>
        <div className="pay-ledger-track" aria-label="Progression des mensualités">{timeline.map(({ label, invoice }, index) => <div key={`${label}-${index}`} className={invoice?.statut === 'payee' ? 'complete' : invoice?.id === nextInvoice?.id ? 'current' : ''}><i>{invoice?.statut === 'payee' ? '✓' : index + 1}</i><span>{label}</span></div>)}</div>
        <div className="pay-ledger-title"><div><span>OPÉRATIONS ENREGISTRÉES</span><h3>Historique des règlements</h3></div><span>{paidInvoices.length} reçu{paidInvoices.length > 1 ? 's' : ''} disponible{paidInvoices.length > 1 ? 's' : ''}</span></div>
        <div className="pay-ledger-tools"><label><span>⌕</span><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Rechercher une période ou référence..." /></label><select value={methodFilter} onChange={event => { setMethodFilter(event.target.value); setPage(1) }}><option>Tous</option>{paymentMethods.map(method => <option key={method}>{method}</option>)}</select></div>
        <div className="pay-ledger-rows">{visiblePayments.map(invoice => {
          const date = new Date(invoice.paid_at ?? invoice.date_emission)
          return <button key={invoice.id} onClick={() => setSelected(invoice)}><time><strong>{String(date.getDate()).padStart(2, '0')}</strong><span>{date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span></time><span className="pay-ledger-row-copy"><strong>{formatPeriod(invoice.periode)}</strong><small>{methodLabels[invoice.methode ?? ''] ?? invoice.methode ?? 'Non réglé'} · {invoice.reference ?? invoice.numero}</small></span><span className="pay-ledger-row-status">{statusLabels[invoice.statut] ?? invoice.statut}</span><strong className="pay-ledger-row-amount">{invoice.montant_ttc} DH</strong><span className="pay-ledger-row-action">Voir le détail →</span></button>
        })}{visiblePayments.length === 0 && <div className="pay-ledger-empty">Aucun règlement ne correspond à votre recherche.</div>}</div>
        <div className="pay-ledger-pagination"><span>Page {page} sur {pageCount}</span><div><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>←</button>{Array.from({ length: pageCount }, (_, index) => <button className={page === index + 1 ? 'active' : ''} key={index} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pageCount} onClick={() => setPage(value => value + 1)}>→</button></div></div>
      </main>

      <aside className="pay-ledger-side">
        <div className="pay-ledger-next"><div className="pay-ledger-next-head"><span>PROCHAINE MENSUALITÉ</span><i>{nextInvoice ? 'À VENIR' : 'À JOUR'}</i></div>{nextInvoice && dueDate ? <><div className="pay-ledger-next-body"><div className="pay-ledger-calendar"><strong>{String(dueDate.getDate()).padStart(2, '0')}</strong><span>{dueDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase()}<small>{dueDate.getFullYear()}</small></span></div><div className="pay-ledger-price"><span>{nextInvoice.formation} · {formatPeriod(nextInvoice.periode)}</span><strong>{Math.max(0, Number(nextInvoice.montant_ttc) - Number(nextInvoice.montant_paye))} DH</strong></div></div><button onClick={() => data.methods[0] && setSelectedMethod(data.methods[0])}>Voir les options de règlement <span>→</span></button></> : <div className="pay-ledger-done">✓ Aucun paiement en attente</div>}</div>
        <div className="pay-ledger-method"><span>MOYENS DE PAIEMENT</span>{data.methods.map(method => <button key={method.id} onClick={() => setSelectedMethod(method)}><i>{methodIcon(method.methode)}</i><p><strong>{method.libelle}</strong><small>{method.instructions ?? 'Afficher les instructions de paiement'}</small></p><em>→</em></button>)}</div>
        <div className="pay-ledger-help"><span>BESOIN D’AIDE ?</span><p>Une anomalie sur un reçu ou une date de paiement ?</p><button onClick={() => notify('Contactez l’administration de votre centre pour cette demande.')}>Écrire à l’administration</button></div>
      </aside>
    </section>

    {selected && <div className="pay-pro-overlay" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}><article className="pay-pro-receipt"><div className="pay-pro-receipt-head"><span>DÉTAIL DU PAIEMENT</span><button onClick={() => setSelected(null)}>×</button></div><div className="pay-pro-receipt-brand"><strong>EDUOS</strong><span>MAROC</span></div><h2>{selected.montant_ttc} DH</h2><span className="pay-pro-paid">{statusLabels[selected.statut] ?? selected.statut}</span><dl><div><dt>Période</dt><dd>{formatPeriod(selected.periode)}</dd></div><div><dt>Échéance</dt><dd>{new Date(selected.date_echeance).toLocaleDateString('fr-FR')}</dd></div><div><dt>Méthode</dt><dd>{methodLabels[selected.methode ?? ''] ?? selected.methode ?? 'Non renseignée'}</dd></div><div><dt>Référence</dt><dd>{selected.reference ?? selected.numero}</dd></div><div><dt>Participant</dt><dd>{profile ? `${profile.prenom} ${profile.nom}` : ''}</dd></div></dl>{selected.statut === 'payee' && <button className="pay-pro-download" onClick={() => download(selected)}>Télécharger le reçu</button>}</article></div>}

    {selectedMethod && <div className="pay-pro-overlay" onMouseDown={event => event.target === event.currentTarget && setSelectedMethod(null)}><article className="pay-pro-receipt pay-bank-details"><div className="pay-pro-receipt-head"><span>MOYEN DE PAIEMENT</span><button onClick={() => setSelectedMethod(null)}>×</button></div><div className="pay-pro-receipt-brand"><strong>EDUOS</strong><span>MAROC</span></div><h2>{selectedMethod.libelle}</h2><p>{selectedMethod.instructions}</p><dl>{selectedMethod.banque && <div><dt>Banque</dt><dd>{selectedMethod.banque}</dd></div>}{selectedMethod.iban && <div><dt>IBAN</dt><dd>{selectedMethod.iban}</dd></div>}<div><dt>Motif</dt><dd>{profile?.matricule ?? 'Votre matricule'}</dd></div></dl>{selectedMethod.iban && <button className="pay-pro-download" onClick={() => { void navigator.clipboard.writeText(selectedMethod.iban ?? ''); notify('IBAN copié dans le presse-papiers.') }}>Copier l’IBAN</button>}{selectedMethod.provider && <small>Prestataire : {selectedMethod.provider}. Le centre doit configurer son lien sécurisé.</small>}</article></div>}
  </div>
}

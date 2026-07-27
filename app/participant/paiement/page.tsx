'use client'

import { FormEvent, useMemo, useState } from 'react'

const INITIAL_PAYMENTS = [
  { id: 1, period: 'Janvier 2025', amount: 450, date: '01 Jan 2025', method: 'Virement bancaire', status: 'Payé', reference: 'EDU-2501-0842' },
  { id: 2, period: 'Décembre 2024', amount: 450, date: '01 Déc 2024', method: 'Espèces', status: 'Payé', reference: 'EDU-2412-0764' },
  { id: 3, period: 'Novembre 2024', amount: 450, date: '03 Nov 2024', method: 'Virement bancaire', status: 'Payé', reference: 'EDU-2411-0618' },
  { id: 4, period: 'Octobre 2024', amount: 450, date: '01 Oct 2024', method: 'Espèces', status: 'Payé', reference: 'EDU-2410-0531' },
  { id: 5, period: 'Septembre 2024', amount: 450, date: '15 Sep 2024', method: 'Virement bancaire', status: 'Payé', reference: 'EDU-2409-0426' },
  { id: 6, period: 'Août 2024', amount: 450, date: '05 Aoû 2024', method: 'Carte bancaire', status: 'Payé', reference: 'EDU-2408-0361' },
  { id: 7, period: 'Juillet 2024', amount: 450, date: '02 Juil 2024', method: 'Virement bancaire', status: 'Payé', reference: 'EDU-2407-0284' },
  { id: 8, period: 'Juin 2024', amount: 450, date: '01 Juin 2024', method: 'Espèces', status: 'Payé', reference: 'EDU-2406-0197' },
]

type Payment = typeof INITIAL_PAYMENTS[number]

export default function PaiementPage() {
  const [selected, setSelected] = useState<Payment | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('Tous')
  const [page, setPage] = useState(1)
  const perPage = 4
  const filteredPayments = useMemo(() => INITIAL_PAYMENTS.filter((payment) =>
    `${payment.period} ${payment.reference} ${payment.method}`.toLowerCase().includes(query.toLowerCase()) &&
    (methodFilter === 'Tous' || payment.method === methodFilter)
  ), [query, methodFilter])
  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / perPage))
  const visiblePayments = filteredPayments.slice((page - 1) * perPage, page * perPage)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  const download = (payment: Payment) => {
    const text = `EDUOS MAROC — REÇU\nRéférence : ${payment.reference}\nPériode : ${payment.period}\nMontant : ${payment.amount} DH\nDate : ${payment.date}\nMode : ${payment.method}\nParticipant : Yasmine Bennani`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `Recu_${payment.reference}.txt`
    link.click()
    URL.revokeObjectURL(url)
    notify('Votre reçu a été téléchargé.')
  }

  const exportAll = () => {
    const rows = INITIAL_PAYMENTS.map((p) => `${p.period} | ${p.amount} DH | ${p.date} | ${p.reference}`).join('\n')
    const url = URL.createObjectURL(new Blob([`RELEVÉ EDUOS\n\n${rows}`], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'Releve_paiements_EDUOS.txt'
    link.click()
    URL.revokeObjectURL(url)
    notify('Le relevé complet a été exporté.')
  }

  const pay = (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    window.setTimeout(() => {
      setProcessing(false)
      setPaid(true)
      setShowPayment(false)
      notify('Paiement de 450 DH confirmé avec succès.')
    }, 1200)
  }

  return (
    <div className="pay-pro-page">
      {toast && <div className="part-toast"><span>✓</span>{toast}</div>}
      <header className="pay-pro-header">
        <div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Paiements</span></div><h1>Situation financière</h1><p>Consultez vos échéances et gérez vos règlements.</p></div>
        <button onClick={exportAll}>↓ Exporter le relevé</button>
      </header>

      <section className="pay-ledger">
        <main className="pay-ledger-main">
          <div className="pay-ledger-intro">
            <span>RELEVÉ 2024 — 2025</span>
            <h2>Vos mensualités</h2>
            <p>Une lecture simple de tous les règlements liés à votre formation Anglais B2.</p>
          </div>

          <div className="pay-ledger-track" aria-label="Progression des mensualités">
            {['SEP', 'OCT', 'NOV', 'DÉC', 'JAN', 'FÉV'].map((month, index) => (
              <div key={month} className={index < 5 || paid ? 'complete' : 'current'}>
                <i>{index < 5 || paid ? '✓' : '6'}</i><span>{month}</span>
              </div>
            ))}
          </div>

          <div className="pay-ledger-title">
            <div><span>OPÉRATIONS VALIDÉES</span><h3>Historique des règlements</h3></div>
            <span>{filteredPayments.length} reçus disponibles</span>
          </div>

          <div className="pay-ledger-tools">
            <label><span>⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Rechercher une période ou référence..." /></label>
            <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}>
              <option>Tous</option><option>Virement bancaire</option><option>Carte bancaire</option><option>Espèces</option>
            </select>
          </div>

          <div className="pay-ledger-rows">
            {visiblePayments.map((payment) => (
              <button key={payment.id} onClick={() => setSelected(payment)}>
                <time><strong>{payment.date.slice(0, 2)}</strong><span>{payment.date.slice(3)}</span></time>
                <span className="pay-ledger-row-copy"><strong>{payment.period}</strong><small>{payment.method} · {payment.reference}</small></span>
                <span className="pay-ledger-row-status">Confirmé</span>
                <strong className="pay-ledger-row-amount">{payment.amount} DH</strong>
                <span className="pay-ledger-row-action">Voir le reçu →</span>
              </button>
            ))}
            {visiblePayments.length === 0 && <div className="pay-ledger-empty">Aucun règlement ne correspond à votre recherche.</div>}
          </div>
          <div className="pay-ledger-pagination">
            <span>Page {page} sur {pageCount}</span>
            <div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{Array.from({ length: pageCount }, (_, index) => <button className={page === index + 1 ? 'active' : ''} key={index} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>→</button></div>
          </div>
        </main>

        <aside className="pay-ledger-side">
          <div className="pay-ledger-next">
            <div className="pay-ledger-next-head"><span>PROCHAINE MENSUALITÉ</span><i>{paid ? 'PAYÉ' : 'À VENIR'}</i></div>
            <div className="pay-ledger-next-body"><div className="pay-ledger-calendar"><strong>01</strong><span>FÉV<small>2025</small></span></div><div className="pay-ledger-price"><span>Anglais B2 · Février</span><strong>450 DH</strong></div></div>
            {!paid ? <button onClick={() => setShowPayment(true)}>Régler par carte <span>→</span></button> : <div className="pay-ledger-done">✓ Paiement confirmé</div>}
          </div>

          <div className="pay-ledger-method">
            <span>MOYENS DE PAIEMENT</span>
            <button onClick={() => setShowBankDetails(true)}><i><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M2 21h20M12 3 2 8h20z"/></svg></i><p><strong>Virement bancaire</strong><small>Afficher les coordonnées bancaires</small></p><em>→</em></button>
            <button onClick={() => setShowPayment(true)}><i><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg></i><p><strong>Carte bancaire</strong><small>Payer immédiatement en ligne</small></p><em>→</em></button>
            <button onClick={() => notify('Présentez-vous à l’accueil EDUOS avec votre identifiant EDU-P-2025-084.')}><i><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></i><p><strong>Espèces</strong><small>Voir les instructions de paiement</small></p><em>→</em></button>
          </div>

          <div className="pay-ledger-help">
            <span>BESOIN D’AIDE ?</span>
            <p>Une anomalie sur un reçu ou une date de paiement ?</p>
            <button onClick={() => notify('Votre demande a été envoyée à l’administration.')}>Écrire à l’administration</button>
          </div>
        </aside>
      </section>

      {selected && <div className="pay-pro-overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
        <article className="pay-pro-receipt">
          <div className="pay-pro-receipt-head"><span>REÇU DE PAIEMENT</span><button onClick={() => setSelected(null)}>×</button></div>
          <div className="pay-pro-receipt-brand"><strong>EDUOS</strong><span>MAROC</span></div><h2>{selected.amount} DH</h2><span className="pay-pro-paid">✓ Paiement confirmé</span>
          <dl><div><dt>Période</dt><dd>{selected.period}</dd></div><div><dt>Date</dt><dd>{selected.date}</dd></div><div><dt>Méthode</dt><dd>{selected.method}</dd></div><div><dt>Référence</dt><dd>{selected.reference}</dd></div><div><dt>Participant</dt><dd>Yasmine Bennani</dd></div></dl>
          <button className="pay-pro-download" onClick={() => download(selected)}>Télécharger le reçu</button>
        </article>
      </div>}

      {showPayment && <div className="pay-pro-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowPayment(false)}>
        <form className="pay-pro-form" onSubmit={pay}>
          <div className="pay-pro-receipt-head"><span>PAIEMENT SÉCURISÉ</span><button type="button" onClick={() => setShowPayment(false)}>×</button></div>
          <h2>Régler 450 DH</h2><p>Mensualité de février 2025 · Anglais B2</p>
          <label>Nom sur la carte<input required placeholder="YASMINE BENNANI" /></label>
          <label>Numéro de carte<input required inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000" /></label>
          <div className="pay-pro-form-row"><label>Expiration<input required placeholder="MM / AA" /></label><label>CVC<input required inputMode="numeric" maxLength={3} placeholder="000" /></label></div>
          <button className="pay-pro-submit" disabled={processing}>{processing ? 'Traitement en cours…' : 'Confirmer le paiement · 450 DH'}</button>
          <small>Vos données de paiement sont protégées et chiffrées.</small>
        </form>
      </div>}

      {showBankDetails && <div className="pay-pro-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowBankDetails(false)}>
        <article className="pay-pro-receipt pay-bank-details">
          <div className="pay-pro-receipt-head"><span>COORDONNÉES BANCAIRES</span><button onClick={() => setShowBankDetails(false)}>×</button></div>
          <div className="pay-pro-receipt-brand"><strong>EDUOS</strong><span>MAROC</span></div>
          <h2>Virement bancaire</h2><p>Indiquez votre identifiant participant dans le motif du virement.</p>
          <dl><div><dt>Banque</dt><dd>CIH Bank</dd></div><div><dt>RIB</dt><dd>230 780 000012345678901192</dd></div><div><dt>IBAN</dt><dd>MA64 2307 8000 0012 3456 7890 1192</dd></div><div><dt>Motif</dt><dd>EDU-P-2025-084</dd></div></dl>
          <button className="pay-pro-download" onClick={() => { navigator.clipboard.writeText('MA64 2307 8000 0012 3456 7890 1192'); notify('IBAN copié dans le presse-papiers.') }}>Copier l’IBAN</button>
        </article>
      </div>}
    </div>
  )
}

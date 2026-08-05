'use client'

import { Books, Plus, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../lib/api-client'
import styles from './page.module.css'

type Formation = {
  id: string
  code: string
  titre: string
  categorie: string | null
  niveau: string | null
  duree_heures: number
  prix_mensuel: string | number
  frais_inscription: string | number
  statut: string
}

const initialForm = {
  titre: '',
  code: '',
  categorie: '',
  niveau: '',
  duree_heures: '0',
  prix_mensuel: '',
  frais_inscription: '0',
}

function formationCode(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
    .toUpperCase()
}

function money(value: string | number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [codeTouched, setCodeTouched] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.get<Formation[]>('/director/formations')
      .then(setFormations)
      .catch(error => setLoadError(error instanceof Error ? error.message : 'Impossible de charger les formations.'))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = useMemo(
    () => formations.filter(item => item.statut === 'actif').length,
    [formations],
  )

  function closeModal() {
    if (submitting) return
    setShowModal(false)
    setForm(initialForm)
    setCodeTouched(false)
    setFormError('')
  }

  function updateTitle(titre: string) {
    setForm(current => ({
      ...current,
      titre,
      code: codeTouched ? current.code : formationCode(titre),
    }))
  }

  async function createFormation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!form.titre.trim() || !form.code.trim() || form.prix_mensuel === '') {
      setFormError('Le titre, le code et le prix mensuel sont obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const created = await api.post<Formation>('/director/formations', {
        titre: form.titre.trim(),
        code: form.code.trim().toUpperCase(),
        categorie: form.categorie.trim() || null,
        niveau: form.niveau.trim() || null,
        duree_heures: Number(form.duree_heures || 0),
        prix_mensuel: Number(form.prix_mensuel),
        frais_inscription: Number(form.frais_inscription || 0),
      })
      setFormations(current => [...current, created].sort((a, b) => a.titre.localeCompare(b.titre, 'fr')))
      closeModal()
      setNotice(`La formation "${created.titre}" a été créée.`)
      window.setTimeout(() => setNotice(''), 3500)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible de créer cette formation.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      {notice && <div className={styles.notice} role="status">{notice}</div>}

      <header className={styles.header}>
        <div>
          <h1>Formations</h1>
          <p>Créez le catalogue utilisé lors de la constitution des cohortes.</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={() => setShowModal(true)}>
          <Plus size={17} weight="bold" aria-hidden="true" />
          Nouvelle formation
        </button>
      </header>

      <section className={styles.summary} aria-label="Résumé des formations">
        <div>
          <strong>{formations.length}</strong>
          <span>formations au catalogue</span>
        </div>
        <div>
          <strong>{activeCount}</strong>
          <span>formations actives</span>
        </div>
        <p>Chaque formation créée devient immédiatement disponible dans le formulaire de création d'une cohorte.</p>
      </section>

      {loading ? (
        <div className={styles.state} aria-live="polite">Chargement des formations...</div>
      ) : loadError ? (
        <div className={`${styles.state} ${styles.errorState}`} role="alert">
          <strong>Chargement impossible</strong>
          <span>{loadError}</span>
        </div>
      ) : formations.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}><Books size={30} weight="duotone" aria-hidden="true" /></span>
          <h2>Aucune formation enregistrée</h2>
          <p>Ajoutez votre première formation avant de créer une cohorte.</p>
          <button type="button" className={styles.primaryButton} onClick={() => setShowModal(true)}>
            <Plus size={17} weight="bold" aria-hidden="true" />
            Créer une formation
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Formation</th>
                <th>Catégorie</th>
                <th>Niveau</th>
                <th>Durée</th>
                <th>Prix mensuel</th>
                <th>Inscription</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {formations.map(item => (
                <tr key={item.id}>
                  <td data-label="Formation">
                    <strong>{item.titre}</strong>
                    <small>{item.code}</small>
                  </td>
                  <td data-label="Catégorie">{item.categorie || 'Non renseignée'}</td>
                  <td data-label="Niveau">{item.niveau || 'Tous niveaux'}</td>
                  <td data-label="Durée">{item.duree_heures} h</td>
                  <td data-label="Prix mensuel"><strong>{money(item.prix_mensuel)}</strong></td>
                  <td data-label="Inscription">{money(item.frais_inscription)}</td>
                  <td data-label="Statut"><span className={styles.status}>{item.statut === 'actif' ? 'Active' : item.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onMouseDown={event => event.target === event.currentTarget && closeModal()}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="formation-modal-title">
            <header className={styles.modalHeader}>
              <div>
                <h2 id="formation-modal-title">Créer une formation</h2>
                <p>Elle sera disponible dans la liste des cohortes.</p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Fermer la fenêtre">
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </header>

            <form className={styles.form} onSubmit={createFormation}>
              <label className={styles.fullField}>
                <span>Intitulé de la formation</span>
                <input autoFocus required value={form.titre} onChange={event => updateTitle(event.target.value)} placeholder="Ex: Anglais professionnel B2" />
              </label>

              <label>
                <span>Code</span>
                <input required value={form.code} onChange={event => { setCodeTouched(true); setForm(current => ({ ...current, code: event.target.value })) }} placeholder="ANGL-B2" />
              </label>

              <label>
                <span>Catégorie</span>
                <input value={form.categorie} onChange={event => setForm(current => ({ ...current, categorie: event.target.value }))} placeholder="Langues" />
              </label>

              <label>
                <span>Niveau</span>
                <input value={form.niveau} onChange={event => setForm(current => ({ ...current, niveau: event.target.value }))} placeholder="B2" />
              </label>

              <label>
                <span>Durée totale</span>
                <input type="number" min="0" required value={form.duree_heures} onChange={event => setForm(current => ({ ...current, duree_heures: event.target.value }))} />
                <small>En heures</small>
              </label>

              <label>
                <span>Prix mensuel</span>
                <input type="number" min="0" step="0.01" required value={form.prix_mensuel} onChange={event => setForm(current => ({ ...current, prix_mensuel: event.target.value }))} placeholder="0.00" />
                <small>Montant en MAD</small>
              </label>

              <label>
                <span>Frais d'inscription</span>
                <input type="number" min="0" step="0.01" required value={form.frais_inscription} onChange={event => setForm(current => ({ ...current, frais_inscription: event.target.value }))} />
                <small>Montant en MAD</small>
              </label>

              {formError && <div className={styles.formError} role="alert">{formError}</div>}

              <footer className={styles.formActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeModal} disabled={submitting}>Annuler</button>
                <button type="submit" className={styles.primaryButton} disabled={submitting}>
                  {submitting ? 'Création en cours...' : 'Créer la formation'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

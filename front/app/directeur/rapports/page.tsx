'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../../lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

type MonthlySummary = {
  year: number
  month: number
  month_label: string
  devise: string
  inscriptions_mois: number
  apprenants_actifs: number
  paiements_mois: number
  absences_mois: number
  presences_mois: number
  taux_presence: number
  formateurs_actifs: number
  cohortes_actives: number
  demandes_changement: number
}

const MONTHS_FR = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-MA').format(n)
}

function formatCurrency(n: number, devise: string): string {
  return `${new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${devise}`
}

function presenceColor(rate: number): string {
  if (rate >= 85) return '#16A34A'
  if (rate >= 70) return '#D97706'
  return '#DC2626'
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconUserPlus({ color = '#3B82F6' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
}

function IconCalendarX({ color = '#EF4444' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="10" y1="13" x2="14" y2="17" />
      <line x1="14" y1="13" x2="10" y2="17" />
    </svg>
  )
}

function IconGraduation({ color = '#F59E0B' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}

function IconBriefcase({ color = '#10B981' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

function IconWallet({ color = '#8B5CF6' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function IconTrendUp({ color = '#EF4444' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconDocumentGold() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B88220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RapportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const fetchSummary = useCallback(async (y: number, m: number) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get<MonthlySummary>(`/director/reports/monthly/${y}/${m}/summary`)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary(year, month)
  }, [year, month, fetchSummary])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else { setMonth(m => m - 1) }
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else { setMonth(m => m + 1) }
  }

  async function downloadPdf() {
    setDownloading(true)
    setDownloadSuccess(false)
    try {
      const blob = await api.download(`/director/reports/monthly/${year}/${month}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-mensuel-${year}-${String(month).padStart(2, '0')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Téléchargement impossible.')
    } finally {
      setDownloading(false)
    }
  }

  const devise = summary?.devise ?? 'MAD'
  const taux = summary?.taux_presence ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      {/* ── Top Header Controls Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Period Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
            Sélectionner une période
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Prev Button */}
            <button
              onClick={prevMonth}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: '1px solid #E2E8F0', background: '#F8FAFC',
                cursor: 'pointer', display: 'grid', placeItems: 'center',
                color: '#334155', fontSize: 14, fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
            >
              ‹
            </button>

            {/* Select Month Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 38, padding: '0 16px',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 10, cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2347' }}>
                {MONTHS_FR[month]} {year}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Next Button */}
            <button
              onClick={nextMonth}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: '1px solid #E2E8F0', background: '#F8FAFC',
                cursor: 'pointer', display: 'grid', placeItems: 'center',
                color: '#334155', fontSize: 14, fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFFFFF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
            >
              ›
            </button>
          </div>
        </div>

        {/* Top Gold Download Button */}
        <button
          onClick={downloadPdf}
          disabled={downloading || loading || !summary}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px',
            background: downloadSuccess
              ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
              : 'linear-gradient(135deg, #B88220 0%, #9E6B18 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: downloading || loading || !summary ? 'not-allowed' : 'pointer',
            opacity: downloading || loading || !summary ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(184,130,32,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          {downloading ? (
            <>⏳ Génération du PDF…</>
          ) : downloadSuccess ? (
            <>✅ PDF Téléchargé !</>
          ) : (
            <>
              <IconDownload />
              Télécharger le rapport PDF
            </>
          )}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          padding: '12px 18px',
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 12, color: '#DC2626', fontSize: 13, fontWeight: 600,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Main Hero Card (Dark Navy Banner) ── */}
      <div style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #09152B 0%, #0F2347 50%, #163265 100%)',
        padding: '32px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 12px 40px rgba(9,21,43,0.30)',
        minHeight: 260,
      }}>
        {/* Left Info — stays in front of the image */}
        <div style={{ zIndex: 2, maxWidth: 300, position: 'relative' }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#60A5FA',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            RAPPORT MENSUEL COMPLET
          </div>
          <h1 style={{
            fontSize: 34, fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.1, margin: 0,
          }}>
            {MONTHS_FR[month]} {year}
          </h1>
          <p style={{
            fontSize: 13, color: '#94A3B8', marginTop: 10,
            lineHeight: 1.5, margin: '10px 0 0 0',
          }}>
            Synthèse de l'activité du centre<br />
            Toutes sections incluses dans le PDF
          </p>
        </div>

        {/* Hero Tablet Image — large, positioned to the right side */}
        <div style={{
          position: 'absolute',
          right: 210,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 560,
          height: 260,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.92,
        }}>
          <Image
            src="/images/report_hero_tablet.png"
            alt="Dashboard Illustration"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Right Glassmorphism Badge "PDF INCLUS" */}
        <div style={{
          zIndex: 2,
          background: 'rgba(15, 35, 71, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          padding: '16px 20px',
          width: 190,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#94A3B8',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            PDF INCLUS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E2E8F0' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', display: 'grid', placeItems: 'center', fontSize: 11 }}>👤</span>
              Inscriptions
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E2E8F0' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#EF4444', display: 'grid', placeItems: 'center', fontSize: 11 }}>📅</span>
              Absences
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E2E8F0' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F59E0B', display: 'grid', placeItems: 'center', fontSize: 11 }}>👤</span>
              Personnel
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E2E8F0' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#8B5CF6', display: 'grid', placeItems: 'center', fontSize: 11 }}>🗓️</span>
              Emploi du temps
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E2E8F0' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#10B981', display: 'grid', placeItems: 'center', fontSize: 11 }}>💳</span>
              Paiements
            </div>
          </div>
        </div>
      </div>

      {/* ── 5 Horizontal KPI Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 14,
      }}>
        {/* Card 1: Inscriptions */}
        <div className="rapport-kpi-card" style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEF2FF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconUserPlus color="#3B82F6" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nouvelles inscriptions</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2347', lineHeight: 1.1 }}>{summary ? summary.inscriptions_mois : 0}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{summary ? summary.apprenants_actifs : 0} apprenants actifs</div>
          </div>
        </div>

        {/* Card 2: Absences */}
        <div className="rapport-kpi-card" style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconCalendarX color="#EF4444" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Absences enregistrées</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2347', lineHeight: 1.1 }}>{summary ? summary.absences_mois : 0}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{summary ? summary.presences_mois : 0} présences</div>
          </div>
        </div>

        {/* Card 3: Formateurs */}
        <div className="rapport-kpi-card" style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFFBEB', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconGraduation color="#F59E0B" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Formateurs actifs</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2347', lineHeight: 1.1 }}>{summary ? summary.formateurs_actifs : 0}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{summary ? summary.cohortes_actives : 0} cohortes</div>
          </div>
        </div>

        {/* Card 4: Changements */}
        <div className="rapport-kpi-card" style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconBriefcase color="#10B981" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Changements d'emploi</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2347', lineHeight: 1.1 }}>{summary ? summary.demandes_changement : 0}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>demandes ce mois</div>
          </div>
        </div>

        {/* Card 5: Paiements */}
        <div className="rapport-kpi-card" style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3E8FF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconWallet color="#8B5CF6" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Paiements encaissés</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2347', lineHeight: 1.1 }}>
              {summary ? formatCurrency(summary.paiements_mois, devise) : `0,00 ${devise}`}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>total du mois</div>
          </div>
        </div>
      </div>

      {/* ── Middle Grid Section (Taux de présence + 4 Section Cards) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 16,
      }}>
        {/* Left Column: Taux de présence Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
          padding: '22px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative',
          overflow: 'hidden', minHeight: 260,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2347' }}>
            Taux de présence
          </div>

          {/* Donut Gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="38" fill="none"
                  stroke={presenceColor(taux)} strokeWidth="8"
                  strokeDasharray={`${(taux / 100) * 238.7} 238.7`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
                {/* Red dot at top if 0% */}
                {taux === 0 && (
                  <circle cx="50" cy="12" r="5" fill="#EF4444" />
                )}
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'grid', placeItems: 'center',
                fontSize: 18, fontWeight: 800, color: presenceColor(taux),
              }}>
                {taux}%
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: presenceColor(taux) }}>
              {taux >= 85 ? 'Excellent' : taux >= 70 ? 'Satisfaisant' : 'À améliorer'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              {summary ? summary.presences_mois : 0} présences / {summary ? summary.absences_mois : 0} absences
            </div>
          </div>


        </div>

        {/* Right Column: 4 Interactive Section Cards (2x2 Grid) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {/* Section 1: Inscriptions */}
          <div style={{
            background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
            padding: '20px 22px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEF2FF', display: 'grid', placeItems: 'center' }}>
                <IconUserPlus color="#3B82F6" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Inscriptions du mois</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2347', marginTop: 2 }}>
                  {summary ? summary.inscriptions_mois : 0}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {summary ? summary.apprenants_actifs : 0} apprenants actifs au total
                </div>
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
              <IconChevronRight />
            </div>
          </div>

          {/* Section 2: Personnel */}
          <div style={{
            background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
            padding: '20px 22px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', display: 'grid', placeItems: 'center' }}>
                <IconGraduation color="#10B981" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Personnel actif</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2347', marginTop: 2 }}>
                  {summary ? summary.formateurs_actifs : 0} formateurs
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {summary ? summary.cohortes_actives : 0} cohortes en cours
                </div>
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
              <IconChevronRight />
            </div>
          </div>

          {/* Section 3: Présence globale */}
          <div style={{
            background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
            padding: '20px 22px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', display: 'grid', placeItems: 'center' }}>
                <IconTrendUp color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Présence globale</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2347', marginTop: 2 }}>
                  {taux}%
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  {summary ? summary.presences_mois : 0} présences enregistrées
                </div>
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
              <IconChevronRight />
            </div>
          </div>

          {/* Section 4: Paiements */}
          <div style={{
            background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0',
            padding: '20px 22px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3E8FF', display: 'grid', placeItems: 'center' }}>
                <IconWallet color="#8B5CF6" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Paiements</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F2347', marginTop: 2 }}>
                  {summary ? formatCurrency(summary.paiements_mois, devise) : `0,00 ${devise}`}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                  Encaissé ce mois
                </div>
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'grid', placeItems: 'center' }}>
              <IconChevronRight />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Banner (Gold / Cream CTA) ── */}
      <div style={{
        background: '#FDF8EC',
        border: '1.5px solid #F0E2B6',
        borderRadius: 18,
        padding: '20px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: '0 2px 10px rgba(184,130,32,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Gold Document Icon */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#F6E4BA', display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            <IconDocumentGold />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#784906', marginBottom: 4 }}>
              Rapport PDF complet disponible
            </div>
            <div style={{ fontSize: 12, color: '#9A6513', lineHeight: 1.5, maxWidth: 640 }}>
              Le rapport PDF contient toutes les sections : inscriptions détaillées, liste complète des absences,
              fiche personnel, changements d'emploi du temps, détail des paiements par méthode, et synthèse générale.
            </div>
          </div>
        </div>

        {/* Bottom Gold Download Button */}
        <button
          onClick={downloadPdf}
          disabled={downloading || loading || !summary}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px',
            background: downloading
              ? '#9E6B18'
              : 'linear-gradient(135deg, #B88220 0%, #9E6B18 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: downloading || loading || !summary ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(184,130,32,0.35)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {downloading ? (
            <>⏳ Génération…</>
          ) : (
            <>
              <IconDownload />
              Télécharger le PDF
            </>
          )}
        </button>
      </div>

    </div>
  )
}

"""
Rapport mensuel complet – EDUOS Maroc
Design LaTeX Executive Report :
  • En-tête institutionnel professionnel (Titre, Période, Informations du Centre)
  • Numérotation dynamique « Page X sur Y » (NumberedCanvas)
  • Titres de sections numérotés et soulignés (LaTeX style)
  • Flux de contenu continu et dense sans espaces vides artificiels
  • Tableaux aux normes d'édition (en-têtes sombres, lignes alternées, bordures précises)
"""

from __future__ import annotations

import calendar
from datetime import date
from io import BytesIO
from typing import Any

import asyncpg
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ── Palette de couleurs LaTeX / Corporate ────────────────────────────────────
NAVY      = colors.HexColor("#1B3A6B")
NAVY_DARK = colors.HexColor("#0F2347")
GOLD      = colors.HexColor("#C9922A")
GOLD_LT   = colors.HexColor("#FDF3DC")
CREAM     = colors.HexColor("#F8F5EF")
WHITE     = colors.white
MUTED     = colors.HexColor("#64748B")
ROW_ALT   = colors.HexColor("#F8FAFC")
GREEN     = colors.HexColor("#16A34A")
RED       = colors.HexColor("#DC2626")
BORDER    = colors.HexColor("#CBD5E1")
TEXT_DARK = colors.HexColor("#0F172A")

W, H = A4
MARGIN = 15 * mm
AVAIL_W = W - 2 * MARGIN

MONTHS_FR = [
    "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
]


def _month_label(year: int, month: int) -> str:
    return f"{MONTHS_FR[month]} {year}"


# ── NumberedCanvas pour numérotation "Page X sur Y" & en-têtes fixes ──────────
class LaTeXNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(MUTED)

        # En-tête haut (pages 2 et suivantes)
        if self._pageNumber > 1:
            self.setStrokeColor(BORDER)
            self.setLineWidth(0.5)
            self.line(MARGIN, H - 12 * mm, W - MARGIN, H - 12 * mm)
            self.drawString(MARGIN, H - 10 * mm, "EDUOS MAROC — RAPPORT D'ACTIVITÉ MENSUEL")
            subtitle = getattr(self, "doc_subtitle", "")
            self.drawRightString(W - MARGIN, H - 10 * mm, subtitle)

        # Pied de page (toutes les pages)
        self.setStrokeColor(BORDER)
        self.setLineWidth(0.5)
        self.line(MARGIN, 12 * mm, W - MARGIN, 12 * mm)

        centre_name = getattr(self, "doc_centre_name", "EDUOS Maroc")
        self.drawString(MARGIN, 7 * mm, f"Centre : {centre_name} · Document Officiel Confidentiel")
        self.drawRightString(W - MARGIN, 7 * mm, f"Page {self._pageNumber} sur {page_count}")
        self.restoreState()


# ── Styles typographiques ─────────────────────────────────────────────────────
def _latex_styles() -> dict:
    base = getSampleStyleSheet()

    def ps(name: str, **kw) -> ParagraphStyle:
        return ParagraphStyle(name, parent=base["Normal"], **kw)

    return {
        "title": ps(
            "doc_title",
            fontName="Helvetica-Bold",
            fontSize=20,
            textColor=WHITE,
            leading=24,
            spaceAfter=3,
        ),
        "subtitle": ps(
            "doc_subtitle",
            fontName="Helvetica",
            fontSize=11,
            textColor=colors.HexColor("#CBD5E1"),
            leading=15,
        ),
        "centre_meta": ps(
            "centre_meta",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=colors.HexColor("#334155"),
            leading=13,
        ),
        "section_num": ps(
            "section_num",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=NAVY_DARK,
            spaceBefore=14,
            spaceAfter=4,
            leading=16,
        ),
        "body": ps(
            "body",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=TEXT_DARK,
            leading=13,
        ),
        "kpi_val": ps(
            "kpi_val",
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=NAVY_DARK,
            leading=19,
            alignment=1,  # Center
        ),
        "kpi_lbl": ps(
            "kpi_lbl",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=WHITE,
            leading=10,
            alignment=1,
        ),
        "th": ps(
            "th",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=WHITE,
            leading=11,
        ),
        "td": ps(
            "td",
            fontName="Helvetica",
            fontSize=8,
            textColor=TEXT_DARK,
            leading=11,
        ),
        "td_bold": ps(
            "td_bold",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=TEXT_DARK,
            leading=11,
        ),
        "empty_note": ps(
            "empty_note",
            fontName="Helvetica-Oblique",
            fontSize=8,
            textColor=MUTED,
            leading=12,
        ),
    }


# ── Composants de mise en page LaTeX ──────────────────────────────────────────

def _section_title(num_and_title: str, styles: dict) -> list:
    """Titre de section style LaTeX numéroté avec ligne de séparation."""
    return [
        Spacer(1, 10),
        Paragraph(num_and_title, styles["section_num"]),
        HRFlowable(width="100%", thickness=1.2, color=NAVY, spaceBefore=2, spaceAfter=8),
    ]


def _empty_box(message: str, styles: dict) -> Table:
    """Affiche un encadré propre pour les tables sans données."""
    p = Paragraph(f"<i>ℹ️ {message}</i>", styles["empty_note"])
    t = Table([[p]], colWidths=[AVAIL_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BORDER", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


def _latex_table(
    headers: list[str],
    rows: list[list],
    styles: dict,
    col_widths: list[float] | None = None,
) -> Table:
    """Génère un tableau structuré style LaTeX (booktabs)."""
    if col_widths is None:
        col_widths = [AVAIL_W / len(headers)] * len(headers)

    header_cells = [Paragraph(h, styles["th"]) for h in headers]
    data = [header_cells]

    for i, row in enumerate(rows):
        cells = []
        for item in row:
            if isinstance(item, Paragraph):
                cells.append(item)
            else:
                cells.append(Paragraph(str(item or "—"), styles["td"]))
        data.append(cells)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND",    (0, 0), (-1, 0),  NAVY_DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("ALIGN",         (0, 0), (-1, 0),  "LEFT"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i in range(1, len(rows) + 1):
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT))
    t.setStyle(TableStyle(style_cmds))
    return t


# ── Modèles de requêtes de données ────────────────────────────────────────────

async def _fetch_centre_info(conn: asyncpg.Connection, centre_id: Any) -> asyncpg.Record | None:
    return await conn.fetchrow(
        """
        SELECT c.nom, c.ville, c.adresse, c.telephone, c.email, c.code, c.devise
          FROM centres c
         WHERE c.id = $1
        """,
        centre_id,
    )


async def _fetch_kpis(conn: asyncpg.Connection, centre_id: Any, month_start: date) -> dict:
    row = await conn.fetchrow(
        """
        SELECT
          (SELECT count(*)
             FROM inscriptions i
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND date_trunc('month', i.date_inscription) = $2::date
          ) AS inscriptions_mois,

          (SELECT count(*)
             FROM inscriptions i
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1 AND i.statut='confirmee'
          ) AS apprenants_actifs,

          (SELECT coalesce(sum(p.montant), 0)
             FROM paiements p
             JOIN factures fa ON fa.id=p.facture_id
             JOIN inscriptions i ON i.id=fa.inscription_id
             JOIN cohortes c ON c.id=i.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND date_trunc('month', p.paid_at) = $2::date
          ) AS paiements_mois,

          (SELECT count(*)
             FROM presences pr
             JOIN seances s ON s.id=pr.seance_id
             JOIN cohortes c ON c.id=s.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND date_trunc('month', s.starts_at) = $2::date
              AND pr.statut='absent'
          ) AS absences_mois,

          (SELECT count(*)
             FROM presences pr
             JOIN seances s ON s.id=pr.seance_id
             JOIN cohortes c ON c.id=s.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND date_trunc('month', s.starts_at) = $2::date
              AND pr.statut='present'
          ) AS presences_mois,

          (SELECT count(DISTINCT iv.id)
             FROM intervenants iv
             JOIN cohortes c ON c.intervenant_id=iv.id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1 AND c.statut='actif'
          ) AS formateurs_actifs,

          (SELECT count(*)
             FROM demandes_changement_seance d
             JOIN seances s ON s.id=d.seance_id
             JOIN cohortes c ON c.id=s.cohorte_id
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1
              AND date_trunc('month', d.created_at) = $2::date
          ) AS demandes_changement,

          (SELECT count(*)
             FROM cohortes c
             JOIN formations f ON f.id=c.formation_id
            WHERE f.centre_id=$1 AND c.statut='actif'
          ) AS cohortes_actives
        """,
        centre_id,
        month_start,
    )
    return dict(row) if row else {}


async def _fetch_inscriptions(conn: asyncpg.Connection, centre_id: Any, month_start: date) -> list:
    return await conn.fetch(
        """
        SELECT i.reference,
               u.prenom || ' ' || u.nom AS apprenant,
               f.titre AS formation,
               c.nom AS cohorte,
               i.date_inscription,
               i.statut,
               i.montant_mensuel
          FROM inscriptions i
          JOIN participants p ON p.id=i.participant_id
          JOIN users u ON u.id=p.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
           AND date_trunc('month', i.date_inscription) = $2::date
         ORDER BY i.date_inscription DESC
        """,
        centre_id,
        month_start,
    )


async def _fetch_absences(conn: asyncpg.Connection, centre_id: Any, month_start: date) -> list:
    return await conn.fetch(
        """
        SELECT u.prenom || ' ' || u.nom AS apprenant,
               f.titre AS formation,
               c.nom AS cohorte,
               s.starts_at::date AS date_seance,
               s.titre AS seance,
               pr.statut,
               pr.justification AS motif_absence
          FROM presences pr
          JOIN participants pa ON pa.id=pr.participant_id
          JOIN users u ON u.id=pa.user_id
          JOIN seances s ON s.id=pr.seance_id
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
           AND date_trunc('month', s.starts_at) = $2::date
           AND pr.statut='absent'
         ORDER BY s.starts_at DESC, u.nom
        LIMIT 100
        """,
        centre_id,
        month_start,
    )


async def _fetch_personnel(conn: asyncpg.Connection, centre_id: Any) -> list:
    return await conn.fetch(
        """
        SELECT u.prenom || ' ' || u.nom AS nom,
               u.email,
               u.telephone,
               u.personnel_fonction AS fonction,
               count(DISTINCT c.id)::int AS cohortes,
               count(DISTINCT s.id)::int AS seances_mois
          FROM users u
          LEFT JOIN intervenants iv ON iv.user_id=u.id
          LEFT JOIN cohortes c ON c.intervenant_id=iv.id
          LEFT JOIN formations f ON f.id=c.formation_id AND f.centre_id=$1
          LEFT JOIN seances s ON s.cohorte_id=c.id
                    AND date_trunc('month', s.starts_at) = date_trunc('month', now())
         WHERE u.centre_id=$1
           AND u.role='personnel'
           AND u.personnel_fonction IN ('formateur','enseignant')
         GROUP BY u.id, u.prenom, u.nom, u.email, u.telephone, u.personnel_fonction
         ORDER BY u.personnel_fonction, u.nom
        """,
        centre_id,
    )


async def _fetch_changements(conn: asyncpg.Connection, centre_id: Any, month_start: date) -> list:
    return await conn.fetch(
        """
        SELECT d.created_at::date AS date_demande,
               concat_ws(' ', u.prenom, u.nom) AS demandeur,
               s.titre AS seance,
               c.nom AS cohorte,
               s.starts_at AS ancien_horaire,
               d.starts_at_souhaite AS nouvel_horaire,
               d.motif,
               d.statut
          FROM demandes_changement_seance d
          JOIN seances s ON s.id=d.seance_id
          JOIN cohortes c ON c.id=s.cohorte_id
          JOIN formations f ON f.id=c.formation_id
          JOIN users u ON u.id=d.personnel_id
         WHERE f.centre_id=$1
           AND date_trunc('month', d.created_at) = $2::date
         ORDER BY d.created_at DESC
        """,
        centre_id,
        month_start,
    )


async def _fetch_paiements(conn: asyncpg.Connection, centre_id: Any, month_start: date) -> list:
    return await conn.fetch(
        """
        SELECT p.paid_at::date AS date_paiement,
               p.reference,
               u.prenom || ' ' || u.nom AS apprenant,
               f.titre AS formation,
               p.montant,
               p.methode,
               p.transaction_ref
          FROM paiements p
          JOIN factures fa ON fa.id=p.facture_id
          JOIN inscriptions i ON i.id=fa.inscription_id
          JOIN participants pa ON pa.id=i.participant_id
          JOIN users u ON u.id=pa.user_id
          JOIN cohortes c ON c.id=i.cohorte_id
          JOIN formations f ON f.id=c.formation_id
         WHERE f.centre_id=$1
           AND date_trunc('month', p.paid_at) = $2::date
         ORDER BY p.paid_at DESC
        """,
        centre_id,
        month_start,
    )


# ── Génération du Document PDF ────────────────────────────────────────────────

async def monthly_report_pdf(
    pool: asyncpg.Pool, centre_id: Any, year: int, month: int
) -> bytes:
    """Génère un rapport PDF mensuel complet aux normes LaTeX Executive."""
    month_start = date(year, month, 1)
    month_label = _month_label(year, month)
    styles = _latex_styles()

    async with pool.acquire() as conn:
        centre_info  = await _fetch_centre_info(conn, centre_id)
        kpis         = await _fetch_kpis(conn, centre_id, month_start)
        inscriptions = await _fetch_inscriptions(conn, centre_id, month_start)
        absences     = await _fetch_absences(conn, centre_id, month_start)
        personnel    = await _fetch_personnel(conn, centre_id)
        changements  = await _fetch_changements(conn, centre_id, month_start)
        paiements    = await _fetch_paiements(conn, centre_id, month_start)

    centre_dict = dict(centre_info) if centre_info else {}
    centre_name = centre_dict.get("nom", "Centre de Formation")
    devise = centre_dict.get("devise", "MAD")

    buffer = BytesIO()
    story: list = []

    # ──────────────────────────────────────────────────────────────────────────
    # BANNIÈRE D'EN-TÊTE PAGE 1 (Titre LaTeX Institutionnel)
    # ──────────────────────────────────────────────────────────────────────────
    header_box = Table(
        [
            [
                Paragraph("EDUOS MAROC", ParagraphStyle("brand", fontName="Helvetica-Bold", fontSize=11, textColor=GOLD)),
                Paragraph(f"Édition : {date.today().strftime('%d/%m/%Y')}", ParagraphStyle("ed", fontName="Helvetica", fontSize=8.5, textColor=colors.HexColor("#94A3B8"), alignment=2)),
            ],
            [
                Paragraph(f"RAPPORT D'ACTIVITÉ — {month_label.upper()}", styles["title"]),
                "",
            ],
            [
                Paragraph(f"Bilan officiel des opérations — {centre_name}", styles["subtitle"]),
                "",
            ],
        ],
        colWidths=[AVAIL_W * 0.7, AVAIL_W * 0.3],
    )
    header_box.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), NAVY_DARK),
        ("SPAN",          (0, 1), (1, 1)),
        ("SPAN",          (0, 2), (1, 2)),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(header_box)
    story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=0, spaceAfter=10))

    # Méta-données du centre (Table compacte)
    code_c = centre_dict.get("code", "—")
    ville_c = centre_dict.get("ville", "—")
    adr_c = centre_dict.get("adresse", "—")
    tel_c = centre_dict.get("telephone", "—")
    email_c = centre_dict.get("email", "—")

    meta_table = Table(
        [
            [
                Paragraph(f"<b>Centre :</b> {centre_name} ({code_c})", styles["centre_meta"]),
                Paragraph(f"<b>Ville :</b> {ville_c}", styles["centre_meta"]),
                Paragraph(f"<b>Téléphone :</b> {tel_c}", styles["centre_meta"]),
            ],
            [
                Paragraph(f"<b>Adresse :</b> {adr_c}", styles["centre_meta"]),
                Paragraph(f"<b>Email :</b> {email_c}", styles["centre_meta"]),
                Paragraph(f"<b>Devise :</b> {devise}", styles["centre_meta"]),
            ],
        ],
        colWidths=[AVAIL_W * 0.4, AVAIL_W * 0.3, AVAIL_W * 0.3],
    )
    meta_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CREAM),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 1 : SYNTHÈSE EXÉCUTIVE & KPIS
    # ──────────────────────────────────────────────────────────────────────────
    story += _section_title("1. Synthèse Exécutive & Indicateurs Clés (KPIs)", styles)

    total_presences = int(kpis.get("presences_mois", 0))
    total_absences  = int(kpis.get("absences_mois", 0))
    total_events    = total_presences + total_absences
    taux_presence   = round(total_presences / total_events * 100, 1) if total_events > 0 else 0.0
    pmt_total       = float(kpis.get("paiements_mois", 0))

    kpi_cards = Table(
        [
            [
                Paragraph("INCRIPTIONS", styles["kpi_lbl"]),
                Paragraph("APPRENANTS ACTIFS", styles["kpi_lbl"]),
                Paragraph("TAUX DE PRÉSENCE", styles["kpi_lbl"]),
                Paragraph("FORMATEURS ACTIFS", styles["kpi_lbl"]),
            ],
            [
                Paragraph(str(int(kpis.get("inscriptions_mois", 0))), styles["kpi_val"]),
                Paragraph(str(int(kpis.get("apprenants_actifs", 0))), styles["kpi_val"]),
                Paragraph(f"{taux_presence}%", styles["kpi_val"]),
                Paragraph(str(int(kpis.get("formateurs_actifs", 0))), styles["kpi_val"]),
            ],
        ],
        colWidths=[AVAIL_W * 0.25] * 4,
    )
    kpi_cards.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  NAVY_DARK),
        ("BACKGROUND",    (0, 1), (-1, 1),  ROW_ALT),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(kpi_cards)
    story.append(Spacer(1, 6))

    # Encadré Recouvrement Financier
    pmt_box = Table(
        [
            [
                Paragraph("<b>RECETTE TOTALE ENCAISSÉE CE MOIS :</b>", styles["body"]),
                Paragraph(f"<b>{pmt_total:,.2f} {devise}</b>", ParagraphStyle("g_val", fontName="Helvetica-Bold", fontSize=13, textColor=GREEN, alignment=2)),
            ]
        ],
        colWidths=[AVAIL_W * 0.6, AVAIL_W * 0.4],
    )
    pmt_box.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
        ("BORDER",        (0, 0), (-1, -1), 0.5, colors.HexColor("#86EFAC")),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(pmt_box)

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 2 : REGISTRE DES INSCRIPTIONS DU MOIS
    # ──────────────────────────────────────────────────────────────────────────
    sec2_elements = _section_title(f"2. Registre des Inscriptions du Mois ({len(inscriptions)} enregistrées)", styles)
    if inscriptions:
        rows = []
        for r in inscriptions:
            statut_lbl = {"confirmee": "Confirmée", "en_attente": "En attente", "annulee": "Annulée"}.get(r["statut"], r["statut"])
            rows.append([
                r["date_inscription"].strftime("%d/%m/%Y"),
                r["reference"],
                r["apprenant"],
                r["formation"],
                r["cohorte"],
                statut_lbl,
                f"{float(r['montant_mensuel']):,.0f} {devise}",
            ])
        sec2_elements.append(_latex_table(
            ["Date", "Référence", "Apprenant", "Formation", "Cohorte", "Statut", "Mensualité"],
            rows,
            styles,
            [20*mm, 28*mm, 36*mm, 36*mm, 26*mm, 20*mm, 24*mm],
        ))
    else:
        sec2_elements.append(_empty_box("Aucune nouvelle inscription enregistrée durant ce mois.", styles))

    story.append(KeepTogether(sec2_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 3 : ASSIDUITÉ, PRÉSENCES & SUIVI DES ABSENCES
    # ──────────────────────────────────────────────────────────────────────────
    sec3_elements = _section_title(f"3. Assiduité & Suivi des Absences ({len(absences)} absences enregistrées)", styles)

    # Résumé de présence rapide
    res_pres = Table(
        [
            [
                Paragraph("<b>Total Présences :</b>", styles["body"]),
                Paragraph(str(total_presences), styles["td_bold"]),
                Paragraph("<b>Total Absences :</b>", styles["body"]),
                Paragraph(str(total_absences), styles["td_bold"]),
                Paragraph("<b>Taux d'Assiduité :</b>", styles["body"]),
                Paragraph(f"<b>{taux_presence}%</b>", ParagraphStyle("t_pct", fontName="Helvetica-Bold", fontSize=9, textColor=GREEN if taux_presence >= 80 else RED)),
            ]
        ],
        colWidths=[AVAIL_W * 0.18, AVAIL_W * 0.15, AVAIL_W * 0.18, AVAIL_W * 0.15, AVAIL_W * 0.18, AVAIL_W * 0.16],
    )
    res_pres.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), CREAM),
        ("GRID",          (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    sec3_elements.append(res_pres)
    sec3_elements.append(Spacer(1, 6))

    if absences:
        rows = []
        for r in absences:
            rows.append([
                r["date_seance"].strftime("%d/%m/%Y"),
                r["apprenant"],
                r["formation"],
                r["cohorte"],
                r["seance"] or "—",
                r["motif_absence"] or "Non précisé",
            ])
        sec3_elements.append(_latex_table(
            ["Date", "Apprenant", "Formation", "Cohorte", "Séance", "Motif / Justification"],
            rows,
            styles,
            [20*mm, 36*mm, 36*mm, 26*mm, 34*mm, 38*mm],
        ))
    else:
        sec3_elements.append(_empty_box("Aucune absence enregistrée durant ce mois. Assiduité de 100%.", styles))

    story.append(KeepTogether(sec3_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 4 : CORPS ENSEIGNANT & FORMATEURS ACTIFS
    # ──────────────────────────────────────────────────────────────────────────
    sec4_elements = _section_title(f"4. Corps Enseignant & Formateurs Actifs ({len(personnel)} intervenants)", styles)
    if personnel:
        rows = []
        for r in personnel:
            fonction_lbl = {"formateur": "Formateur", "enseignant": "Enseignant"}.get(r["fonction"], r["fonction"])
            rows.append([
                r["nom"],
                fonction_lbl,
                r["email"] or "—",
                r["telephone"] or "—",
                str(r["cohortes"]),
                str(r["seances_mois"]),
            ])
        sec4_elements.append(_latex_table(
            ["Nom & Prénom", "Fonction", "Email", "Téléphone", "Cohortes", "Séances/mois"],
            rows,
            styles,
            [44*mm, 26*mm, 48*mm, 28*mm, 22*mm, 22*mm],
        ))
    else:
        sec4_elements.append(_empty_box("Aucun membre du personnel enseignant enregistré.", styles))

    story.append(KeepTogether(sec4_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 5 : PLANNING & MODIFICATIONS D'EMPLOI DU TEMPS
    # ──────────────────────────────────────────────────────────────────────────
    sec5_elements = _section_title(f"5. Demandes de Modification d'Emploi du Temps ({len(changements)} demandes)", styles)
    if changements:
        rows = []
        for r in changements:
            statut_lbl = {
                "en_attente": "En attente",
                "approuvee":  "Approuvée",
                "refusee":    "Refusée",
            }.get(r["statut"], r["statut"])
            ancien = r["ancien_horaire"].strftime("%d/%m %H:%M") if r["ancien_horaire"] else "—"
            nouvel = r["nouvel_horaire"].strftime("%d/%m %H:%M") if r["nouvel_horaire"] else "—"
            rows.append([
                r["date_demande"].strftime("%d/%m/%Y"),
                r["demandeur"],
                r["seance"] or "—",
                r["cohorte"],
                ancien,
                nouvel,
                r["motif"] or "—",
                statut_lbl,
            ])
        sec5_elements.append(_latex_table(
            ["Date", "Demandeur", "Séance", "Cohorte", "Ancien hor.", "Nouvel hor.", "Motif", "Statut"],
            rows,
            styles,
            [18*mm, 30*mm, 26*mm, 22*mm, 20*mm, 20*mm, 32*mm, 22*mm],
        ))
    else:
        sec5_elements.append(_empty_box("Aucune demande de modification de planning enregistrée ce mois.", styles))

    story.append(KeepTogether(sec5_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 6 : SUIVI FINANCIER & ENCAISSEMENTS
    # ──────────────────────────────────────────────────────────────────────────
    sec6_elements = _section_title(f"6. Suivi Financier & Encaissements ({len(paiements)} transactions)", styles)
    if paiements:
        rows = []
        for r in paiements:
            methode_lbl = {
                "especes": "Espèces",
                "virement": "Virement",
                "cheque": "Chèque",
                "carte": "Carte bancaire",
            }.get(r["methode"], r["methode"])
            rows.append([
                r["date_paiement"].strftime("%d/%m/%Y"),
                r["reference"],
                r["apprenant"],
                r["formation"],
                f"{float(r['montant']):,.2f} {devise}",
                methode_lbl,
                r["transaction_ref"] or "—",
            ])
        sec6_elements.append(_latex_table(
            ["Date", "Référence", "Apprenant", "Formation", "Montant", "Méthode", "Réf. Trans."],
            rows,
            styles,
            [20*mm, 26*mm, 36*mm, 36*mm, 26*mm, 22*mm, 24*mm],
        ))

        # Tableau Récapitulatif par Mode de Paiement
        by_method: dict[str, float] = {}
        for r in paiements:
            m = r["methode"] or "autre"
            by_method[m] = by_method.get(m, 0.0) + float(r["montant"])

        m_rows = []
        for m, v in sorted(by_method.items(), key=lambda x: -x[1]):
            m_name = {"especes": "Espèces", "virement": "Virement", "cheque": "Chèque", "carte": "Carte bancaire"}.get(m, m)
            m_rows.append([m_name, f"{v:,.2f} {devise}"])
        m_rows.append([Paragraph("<b>TOTAL RECOUVRÉ</b>", styles["td_bold"]), Paragraph(f"<b>{pmt_total:,.2f} {devise}</b>", ParagraphStyle("tot_g", fontName="Helvetica-Bold", fontSize=8.5, textColor=GREEN))])

        m_t = Table(
            [[Paragraph("<b>Mode de Paiement</b>", styles["th"]), Paragraph("<b>Montant Cumulé</b>", styles["th"])]] + m_rows,
            colWidths=[AVAIL_W * 0.5, AVAIL_W * 0.5],
        )
        m_t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  NAVY_DARK),
            ("BACKGROUND",    (0, 1), (-1, -2), CREAM),
            ("BACKGROUND",    (0, -1), (-1, -1), GOLD_LT),
            ("GRID",          (0, 0), (-1, -1), 0.3, BORDER),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ]))
        sec6_elements.append(Spacer(1, 6))
        sec6_elements.append(m_t)
    else:
        sec6_elements.append(_empty_box("Aucun paiement encaissé durant ce mois.", styles))

    story.append(KeepTogether(sec6_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # SECTION 7 : SYNTHÈSE GLOBALE DU RAPPORT
    # ──────────────────────────────────────────────────────────────────────────
    sec7_elements = _section_title("7. Synthèse Globale du Rapport Mensuel", styles)
    synth_matrix = [
        ["Composante du Centre", "Indicateur Clé", "Statut / Observation"],
        ["Nouvelles Inscriptions", f"{int(kpis.get('inscriptions_mois', 0))} dossiers", f"{int(kpis.get('apprenants_actifs', 0))} apprenants au total en formation"],
        ["Présences & Assiduité", f"{total_presences} présences / {total_absences} absences", f"Taux global de présence : {taux_presence}%"],
        ["Ressources Humaines", f"{int(kpis.get('formateurs_actifs', 0))} formateurs actifs", f"{int(kpis.get('cohortes_actives', 0))} cohortes ouvertes"],
        ["Emploi du Temps", f"{int(kpis.get('demandes_changement', 0))} demandes", "Suivi des modifications de séances"],
        ["Finances & Encaissements", f"{len(paiements)} règlements", f"Recette totale : {pmt_total:,.2f} {devise}"],
    ]

    sec7_elements.append(_latex_table(
        synth_matrix[0],
        synth_matrix[1:],
        styles,
        [AVAIL_W * 0.28, AVAIL_W * 0.32, AVAIL_W * 0.40],
    ))

    sec7_elements.append(Spacer(1, 10))
    sec7_elements.append(Paragraph(
        "<i>Ce document constitue le bilan mensuel officiel d'activité. "
        "Généré automatiquement par le système EDUOS Maroc.</i>",
        styles["empty_note"],
    ))
    story.append(KeepTogether(sec7_elements))

    # ──────────────────────────────────────────────────────────────────────────
    # RENDER VIA DOC TEMPLATE + LATEX NUMBERED CANVAS
    # ──────────────────────────────────────────────────────────────────────────
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=15 * mm,
        bottomMargin=16 * mm,
        title=f"Rapport Mensuel – {month_label} – {centre_name}",
        author="EDUOS Maroc",
    )

    # Transmission des propriétés au canvas
    def _make_canvas(*args, **kwargs):
        c = LaTeXNumberedCanvas(*args, **kwargs)
        c.doc_subtitle = f"{centre_name} — {month_label}"
        c.doc_centre_name = centre_name
        return c

    doc.build(story, canvasmaker=_make_canvas)
    buffer.seek(0)
    return buffer.read()


# ── Synthèse JSON pour l'interface web ────────────────────────────────────────

async def monthly_report_summary(
    pool: asyncpg.Pool, centre_id: Any, year: int, month: int
) -> dict:
    """Retourne la synthèse JSON pour les cartes d'aperçu du frontend."""
    month_start = date(year, month, 1)

    async with pool.acquire() as conn:
        kpis = await _fetch_kpis(conn, centre_id, month_start)
        centre_info = await _fetch_centre_info(conn, centre_id)

    centre_dict = dict(centre_info) if centre_info else {}
    devise = centre_dict.get("devise", "MAD")

    total_presences = int(kpis.get("presences_mois", 0))
    total_absences  = int(kpis.get("absences_mois", 0))
    total_events    = total_presences + total_absences

    return {
        "year": year,
        "month": month,
        "month_label": _month_label(year, month),
        "devise": devise,
        "inscriptions_mois": int(kpis.get("inscriptions_mois", 0)),
        "apprenants_actifs": int(kpis.get("apprenants_actifs", 0)),
        "paiements_mois": float(kpis.get("paiements_mois", 0)),
        "absences_mois": total_absences,
        "presences_mois": total_presences,
        "taux_presence": round(total_presences / total_events * 100, 1) if total_events > 0 else 0.0,
        "formateurs_actifs": int(kpis.get("formateurs_actifs", 0)),
        "cohortes_actives": int(kpis.get("cohortes_actives", 0)),
        "demandes_changement": int(kpis.get("demandes_changement", 0)),
    }

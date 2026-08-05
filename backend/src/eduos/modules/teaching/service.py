from datetime import date
from typing import Any
from uuid import UUID, uuid4

from reportlab.pdfgen import canvas

import asyncpg
from fastapi import HTTPException

from eduos.core.config import get_settings
from eduos.modules.common import rows
from eduos.modules.google_drive import service as google_drive_service
from eduos.modules.teaching import repository
from eduos.modules.teaching.schemas import (
    AttendanceSheetInput,
    EvaluationInput,
    GradeSheetInput,
    ResourceInput,
    TicketInput,
)


async def dashboard(pool: asyncpg.Pool, user: asyncpg.Record) -> dict:
    stats = await repository.dashboard_stats(
        pool,
        user["id"],
        user["centre_id"],
    )
    cohorts = await repository.list_cohorts(
        pool,
        user["id"],
        user["centre_id"],
    )
    today_sessions = await repository.list_sessions(
        pool,
        user["id"],
        user["centre_id"],
    )
    today = [
        dict(item)
        for item in today_sessions
        if item["starts_at"].date() == date.today()
    ]
    return {
        "nom": f'{user["prenom"]} {user["nom"]}',
        "fonction": user["personnel_fonction"],
        **dict(stats),
        "cohortes": rows(cohorts),
        "programme_du_jour": today,
    }


async def start_google_meet_session(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    session_id: UUID,
) -> asyncpg.Record | None:
    session = await repository.get_session_for_online_start(
        pool, user["id"], user["centre_id"], session_id
    )
    if not session:
        return None
    meeting_url = await google_drive_service.create_google_meet(
        pool, user["centre_id"], session["titre"], session["starts_at"], session["ends_at"]
    )
    return await repository.start_online_session(
        pool, user["id"], user["centre_id"], session_id, meeting_url
    )


async def attendance_sheet(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    session_id: UUID,
) -> dict:
    session = await repository.get_attendance_session(
        pool,
        user["id"],
        user["centre_id"],
        session_id,
    )
    if not session:
        raise HTTPException(404, "SÃ©ance introuvable ou non affectÃ©e.")
    participants = await repository.list_attendance_participants(
        pool,
        session_id,
    )
    return {"session": dict(session), "participants": rows(participants)}


async def save_attendance_sheet(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    session_id: UUID,
    payload: AttendanceSheetInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            session = await repository.get_attendance_session(
                connection,
                user["id"],
                user["centre_id"],
                session_id,
            )
            if not session:
                raise HTTPException(
                    404,
                    "SÃ©ance introuvable ou non affectÃ©e.",
                )
            updated = 0
            for entry in payload.entries:
                valid = await repository.upsert_attendance(
                    connection,
                    session_id,
                    entry.participant_id,
                    entry.statut,
                    entry.justification,
                    user["id"],
                )
                if not valid:
                    raise HTTPException(
                        422,
                        "Un participant ne fait pas partie de cette cohorte.",
                    )
                updated += 1
    return {"updated": updated}


async def create_resource(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: ResourceInput,
) -> dict:
    resource_id = uuid4()
    storage_key = payload.storage_key or (
        f"generated/resources/{resource_id}/{payload.titre}"
    )
    item = await repository.create_resource(
        pool,
        user["id"],
        user["centre_id"],
        resource_id,
        payload,
        storage_key,
    )
    if not item:
        raise HTTPException(404, "Cohorte affectÃ©e introuvable.")
    return dict(item)


async def create_uploaded_resource(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: ResourceInput,
    content: bytes,
    filename: str,
    mime_type: str,
    size: int,
) -> dict:
    settings = get_settings()
    max_size = settings.resource_max_upload_mb * 1024 * 1024
    if size > max_size:
        raise HTTPException(
            413,
            "Le fichier dépasse la limite de "
            f"{settings.resource_max_upload_mb} Mo.",
        )
    if size == 0:
        raise HTTPException(422, "Le fichier envoyé est vide.")
    if not await repository.cohort_is_assigned(
        pool,
        user["id"],
        user["centre_id"],
        payload.cohorte_id,
    ):
        raise HTTPException(404, "Cohorte affectée introuvable.")

    filename = filename or payload.titre
    mime_type = mime_type or "application/octet-stream"
    if mime_type in {
        "application/x-msdownload",
        "application/x-executable",
        "application/x-sharedlib",
    }:
        raise HTTPException(415, "Ce type de fichier n'est pas autorisé.")

    resource_id = uuid4()
    storage_key = f"db:{resource_id}"
    stored_payload = payload.model_copy(
        update={
            "storage_key": storage_key,
            "mime_type": mime_type,
            "taille_octets": size,
        }
    )
    item = await repository.create_resource(
        pool,
        user["id"],
        user["centre_id"],
        resource_id,
        stored_payload,
        storage_key,
        filename,
        content,
    )
    if not item:
        raise HTTPException(404, "Cohorte affectée introuvable.")
    return dict(item)


async def create_evaluation(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: EvaluationInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            evaluation = await repository.create_evaluation_record(
                connection,
                user["id"],
                user["centre_id"],
                payload,
            )
            if not evaluation:
                raise HTTPException(404, "Cohorte affectÃ©e introuvable.")
            for question_order, question in enumerate(
                payload.questions,
                start=1,
            ):
                question_id = await repository.create_question(
                    connection,
                    evaluation["id"],
                    question.texte,
                    question_order,
                    question.points,
                )
                for option_order, option in enumerate(
                    question.options,
                    start=1,
                ):
                    await repository.create_question_option(
                        connection,
                        question_id,
                        option.texte,
                        option.correcte,
                        option_order,
                    )
    return {**dict(evaluation), "questions": len(payload.questions)}


async def list_tickets(pool: asyncpg.Pool, user: asyncpg.Record) -> list[dict]:
    tickets = rows(
        await repository.list_tickets(
            pool,
            user["id"],
            user["centre_id"],
        )
    )
    messages = await repository.list_ticket_messages(
        pool,
        user["id"],
        user["centre_id"],
    )
    by_ticket: dict[UUID, list[dict]] = {}
    for message in messages:
        by_ticket.setdefault(message["ticket_id"], []).append(
            {
                **dict(message),
                "own": message["sender_id"] == user["id"],
            }
        )
    for ticket in tickets:
        ticket["messages"] = by_ticket.get(ticket["id"], [])
    return tickets


async def create_ticket(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: TicketInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            ticket = await repository.create_ticket(
                connection,
                user["id"],
                user["centre_id"],
                payload.recipient_id,
                payload.sujet,
            )
            if not ticket:
                raise HTTPException(404, "Destinataire introuvable.")
            message = await repository.create_ticket_message(
                connection,
                ticket["id"],
                user["id"],
                payload.message,
            )
    return {**dict(ticket), "messages": [{**dict(message), "own": True}]}


async def reply_to_ticket(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    ticket_id: UUID,
    message: str,
) -> dict:
    if not await repository.ticket_accessible(
        pool,
        ticket_id,
        user["id"],
        user["centre_id"],
    ):
        raise HTTPException(404, "Conversation introuvable.")
    item = await repository.create_ticket_message(
        pool,
        ticket_id,
        user["id"],
        message,
    )
    return {**dict(item), "own": True}


async def save_grades(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    payload: GradeSheetInput,
) -> dict:
    async with pool.acquire() as connection:
        async with connection.transaction():
            intervenant_id = await repository.get_intervenant_id(
                connection,
                user["id"],
                user["centre_id"],
            )
            if not intervenant_id:
                raise HTTPException(404, "Profil enseignant introuvable.")
            updated = 0
            for entry in payload.entries:
                values = (
                    ("controle", "ContrÃ´le continu", entry.controle),
                    ("examen", "Examen", entry.examen),
                )
                for note_type, libelle, note in values:
                    if note is None:
                        continue
                    valid = await repository.upsert_grade(
                        connection,
                        entry.inscription_id,
                        intervenant_id,
                        user["id"],
                        note_type,
                        libelle,
                        note,
                        entry.appreciation,
                    )
                    if not valid:
                        raise HTTPException(
                            422,
                            "Une inscription n'appartient pas Ã  l'enseignant.",
                        )
                    updated += 1
    return {"updated": updated}


# ── LaTeX-style Academic PDF Generator ──────────────────────────────────────

class _NumberedCanvas(canvas.Canvas):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._saved_page_states: list[dict] = []

    def showPage(self) -> None:
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_running_elements(num_pages)
            super().showPage()
        super().save()

    def _draw_running_elements(self, page_count: int) -> None:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm

        w, h = A4
        left = 20 * mm
        right = w - 20 * mm

        self.saveState()

        # Top rule
        self.setStrokeColorRGB(0, 0, 0)
        self.setLineWidth(0.8)
        self.line(left, h - 18 * mm, right, h - 18 * mm)

        # Header text
        self.setFont("Times-Roman", 8)
        self.setFillColorRGB(0, 0, 0)
        self.drawString(left, h - 14 * mm, "EDUOS Maroc — Espace Enseignant")
        self.drawRightString(right, h - 14 * mm, "Rapport de Notes du Groupe")

        # Bottom rule
        self.setLineWidth(0.5)
        self.line(left, 16 * mm, right, 16 * mm)

        # Footer text
        self.setFont("Times-Roman", 8)
        self.drawString(left, 11 * mm, "Document pédagogique — Confidentiel")
        self.drawRightString(
            right, 11 * mm, f"Page {self._pageNumber} / {page_count}"
        )

        self.restoreState()


async def generate_group_notes_pdf(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    cohorte_id: UUID | None = None,
) -> "BytesIO":
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        HRFlowable,
        KeepTogether,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    # ── 1. Fetch data ──────────────────────────────────────────────────────────
    grades = await repository.list_grades(pool, user["id"], user["centre_id"])
    centre = await pool.fetchrow(
        "SELECT nom, ville, adresse, telephone FROM centres WHERE id=$1",
        user["centre_id"],
    )

    items = [dict(g) for g in grades]
    if cohorte_id:
        items = [g for g in items if str(g.get("cohorte_id")) == str(cohorte_id)]

    cohorte_name = items[0]["cohorte"] if items else "Toutes les cohortes"
    teacher_name = f"{user['prenom']} {user['nom']}"
    centre_nom = centre["nom"] if centre else "EDUOS Maroc"
    centre_ville = centre["ville"] if centre else ""

    # ── 2. Statistics ──────────────────────────────────────────────────────────
    eval_students = []
    for g in items:
        c = float(g["controle"]) if g.get("controle") is not None else None
        e = float(g["examen"]) if g.get("examen") is not None else None
        if c is not None and e is not None:
            moy = (c + e) / 2
        elif c is not None:
            moy = c
        elif e is not None:
            moy = e
        else:
            moy = None
        eval_students.append({**g, "moyenne": moy})

    valid = [s["moyenne"] for s in eval_students if s["moyenne"] is not None]
    avg_val = sum(valid) / len(valid) if valid else 0.0
    max_val = max(valid) if valid else 0.0
    min_val = min(valid) if valid else 0.0
    pass_count = sum(1 for v in valid if v >= 10.0)
    pass_rate = round((pass_count / len(valid)) * 100) if valid else 0

    # ── 3. Document setup ──────────────────────────────────────────────────────
    buffer = BytesIO()
    L, R, T, B = 20 * mm, 20 * mm, 24 * mm, 22 * mm
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=L,
        rightMargin=R,
        topMargin=T,
        bottomMargin=B,
    )
    W = A4[0] - L - R   # usable width

    BLACK  = colors.black
    WHITE  = colors.white
    LIGHT  = colors.HexColor("#F5F5F5")   # very light grey for alt rows only
    BORDER = colors.HexColor("#AAAAAA")

    # ── 4. Paragraph styles (Times-Roman, academic) ───────────────────────────
    base = getSampleStyleSheet()["Normal"]

    def ps(name, font="Times-Roman", size=10, leading=None, bold=False, **kw):
        return ParagraphStyle(
            name,
            parent=base,
            fontName=("Times-Bold" if bold else font),
            fontSize=size,
            leading=leading or size * 1.3,
            textColor=BLACK,
            **kw,
        )

    S_title   = ps("T",  size=16, bold=True,  leading=20, spaceAfter=2)
    S_h1      = ps("H1", size=11, bold=True,  leading=15, spaceBefore=10, spaceAfter=4)
    S_meta    = ps("M",  size=9,  leading=13)
    S_meta_b  = ps("MB", size=9,  bold=True,  leading=13)
    S_th      = ps("TH", size=9,  bold=True,  leading=12)
    S_cell    = ps("C",  size=9,  leading=12)
    S_cell_b  = ps("CB", size=9,  bold=True,  leading=12)
    S_small   = ps("SM", size=8,  leading=11)
    S_foot    = ps("FT", size=8,  leading=11, textColor=colors.HexColor("#555555"))

    story: list = []

    # ── 5. Institution header ─────────────────────────────────────────────────
    #   Left: centre name/city    Right: document label + date
    today_str = date.today().strftime("%d/%m/%Y")
    hdr = Table(
        [[
            Paragraph(f"<b>{centre_nom}</b><br/>{centre_ville}", S_meta),
            Paragraph(
                f"<b>RAPPORT DE NOTES</b><br/>Émis le : {today_str}",
                ParagraphStyle("RH", parent=S_meta, alignment=2),
            ),
        ]],
        colWidths=[W * 0.6, W * 0.4],
    )
    hdr.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",  (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(hdr)
    story.append(Spacer(1, 4))

    # Heavy top rule (like LaTeX \toprule)
    story.append(HRFlowable(width="100%", thickness=1.5, color=BLACK, spaceAfter=6))

    # ── 6. Document title ─────────────────────────────────────────────────────
    story.append(Paragraph("Relevé de Notes du Groupe", S_title))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BLACK, spaceAfter=6))

    # ── 7. Identity block ─────────────────────────────────────────────────────
    id_data = [
        [
            Paragraph("Cohorte :", S_meta),
            Paragraph(f"<b>{cohorte_name}</b>", S_meta_b),
            Paragraph("Enseignant :", S_meta),
            Paragraph(f"<b>{teacher_name}</b>", S_meta_b),
        ],
        [
            Paragraph("Centre :", S_meta),
            Paragraph(f"<b>{centre_nom}</b>", S_meta_b),
            Paragraph("Année :", S_meta),
            Paragraph(f"<b>{date.today().year}</b>", S_meta_b),
        ],
    ]
    id_tbl = Table(id_data, colWidths=[W * 0.15, W * 0.35, W * 0.15, W * 0.35])
    id_tbl.setStyle(TableStyle([
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
    ]))
    story.append(id_tbl)
    story.append(Spacer(1, 10))

    # ── 8. Summary statistics (plain inline table, no colour) ─────────────────
    story.append(Paragraph("1. Statistiques du groupe", S_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BLACK, spaceAfter=6))

    stats_data = [
        [
            Paragraph("<b>Indicateur</b>", S_th),
            Paragraph("<b>Valeur</b>", S_th),
            Paragraph("<b>Indicateur</b>", S_th),
            Paragraph("<b>Valeur</b>", S_th),
        ],
        [
            Paragraph("Effectif total", S_cell),
            Paragraph(f"{len(eval_students)} élèves", S_cell_b),
            Paragraph("Moyenne du groupe", S_cell),
            Paragraph(f"{avg_val:.2f} / 20", S_cell_b),
        ],
        [
            Paragraph("Taux de réussite", S_cell),
            Paragraph(f"{pass_rate} %", S_cell_b),
            Paragraph("Note maximale", S_cell),
            Paragraph(f"{max_val:.2f} / 20", S_cell_b),
        ],
        [
            Paragraph("Élèves admis (≥ 10)", S_cell),
            Paragraph(f"{pass_count}", S_cell_b),
            Paragraph("Note minimale", S_cell),
            Paragraph(f"{min_val:.2f} / 20", S_cell_b),
        ],
    ]
    cw2 = [W * 0.30, W * 0.20, W * 0.30, W * 0.20]
    stats_tbl = Table(stats_data, colWidths=cw2)
    stats_tbl.setStyle(TableStyle([
        # Header row
        ("BACKGROUND",    (0, 0), (-1, 0), LIGHT),
        ("LINEABOVE",     (0, 0), (-1, 0), 0.8, BLACK),
        ("LINEBELOW",     (0, 0), (-1, 0), 0.5, BLACK),
        ("LINEBELOW",     (0, -1), (-1, -1), 0.8, BLACK),
        # Inner grid
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, BORDER),
        ("BOX",           (0, 0), (-1, -1), 0.8, BLACK),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]))
    story.append(stats_tbl)
    story.append(Spacer(1, 12))

    # ── 9. Detailed grade table ───────────────────────────────────────────────
    story.append(Paragraph("2. Relevé détaillé des notes par apprenant", S_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BLACK, spaceAfter=6))

    # Column widths: N° | Apprenant | Contrôle | Examen | Moyenne | Mention | Appréciation
    cw3 = [
        W * 0.06,
        W * 0.25,
        W * 0.10,
        W * 0.10,
        W * 0.10,
        W * 0.13,
        W * 0.26,
    ]

    rows_data: list = [[
        Paragraph("<b>N°</b>", S_th),
        Paragraph("<b>Apprenant</b>", S_th),
        Paragraph("<b>Contrôle\n/20</b>", S_th),
        Paragraph("<b>Examen\n/20</b>", S_th),
        Paragraph("<b>Moyenne\n/20</b>", S_th),
        Paragraph("<b>Mention</b>", S_th),
        Paragraph("<b>Appréciation</b>", S_th),
    ]]

    sorted_students = sorted(
        eval_students,
        key=lambda s: s["moyenne"] if s["moyenne"] is not None else -1,
        reverse=True,
    )

    def mention(m: float | None) -> str:
        if m is None:
            return "Non évalué"
        if m >= 16:
            return "Très Bien"
        if m >= 14:
            return "Bien"
        if m >= 12:
            return "Assez Bien"
        if m >= 10:
            return "Passable"
        return "Insuffisant"

    for idx, s in enumerate(sorted_students, 1):
        c_str = f"{float(s['controle']):.2f}" if s.get("controle") is not None else "—"
        e_str = f"{float(s['examen']):.2f}"   if s.get("examen")   is not None else "—"
        m_val = s["moyenne"]
        m_str = f"{m_val:.2f}" if m_val is not None else "—"
        appr  = (s.get("appreciation") or "—").strip()

        rows_data.append([
            Paragraph(str(idx), S_cell),
            Paragraph(s["nom"], S_cell_b),
            Paragraph(c_str,  S_cell),
            Paragraph(e_str,  S_cell),
            Paragraph(f"<b>{m_str}</b>", S_cell_b),
            Paragraph(mention(m_val), S_cell),
            Paragraph(appr, S_cell),
        ])

    detail_tbl = Table(rows_data, colWidths=cw3, repeatRows=1)
    t_style_cmds = [
        # Header
        ("BACKGROUND",    (0, 0), (-1, 0), LIGHT),
        ("LINEABOVE",     (0, 0), (-1, 0), 0.8, BLACK),
        ("LINEBELOW",     (0, 0), (-1, 0), 0.8, BLACK),
        # Bottom rule
        ("LINEBELOW",     (0, -1), (-1, -1), 0.8, BLACK),
        # Inner grid
        ("INNERGRID",     (0, 0), (-1, -1), 0.3, BORDER),
        ("BOX",           (0, 0), (-1, -1), 0.8, BLACK),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 5),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 5),
    ]
    # Alternate row shading (very subtle)
    for r in range(2, len(rows_data), 2):
        t_style_cmds.append(("BACKGROUND", (0, r), (-1, r), LIGHT))

    detail_tbl.setStyle(TableStyle(t_style_cmds))
    story.append(detail_tbl)
    story.append(Spacer(1, 14))

    # ── 10. Signature block ───────────────────────────────────────────────────
    story.append(Paragraph("3. Validation pédagogique", S_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BLACK, spaceAfter=8))

    sig_data = [[
        Paragraph(
            "Signature de l'enseignant :<br/><br/><br/>"
            "___________________________<br/>"
            f"{teacher_name}",
            S_cell,
        ),
        Paragraph(
            "Visa de la direction du centre :<br/><br/><br/>"
            "___________________________<br/>"
            f"{centre_nom}",
            S_cell,
        ),
    ]]
    sig_tbl = Table(sig_data, colWidths=[W * 0.5, W * 0.5])
    sig_tbl.setStyle(TableStyle([
        ("BOX",           (0, 0), (-1, -1), 0.5, BLACK),
        ("INNERGRID",     (0, 0), (-1, -1), 0.5, BLACK),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 24),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    story.append(sig_tbl)

    # ── 11. Build ─────────────────────────────────────────────────────────────
    doc.build(story, canvasmaker=_NumberedCanvas)
    buffer.seek(0)
    return buffer


class _NumberedCanvas(canvas.Canvas):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._saved_page_states: list[dict] = []

    def showPage(self) -> None:
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int) -> None:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm

        w, h = A4
        margin = 15 * mm
        navy = colors.black
        muted = colors.HexColor("#4B4B4B")
        border = colors.HexColor("#A8A8A8")

        self.saveState()

        # Running Header
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(navy)
        self.drawString(margin, h - 12 * mm, "EDUOS MAROC — ESPACE ENSEIGNANT")
        self.setFont("Helvetica", 8)
        self.setFillColor(muted)
        self.drawRightString(w - margin, h - 12 * mm, "Rapport de Notes du Groupe")
        self.setStrokeColor(border)
        self.setLineWidth(0.5)
        self.line(margin, h - 14 * mm, w - margin, h - 14 * mm)

        # Running Footer
        self.line(margin, 14 * mm, w - margin, 14 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(muted)
        self.drawString(margin, 9 * mm, "Document pédagogique officiel — Confidentiel")
        page_str = f"Page {self._pageNumber} sur {page_count}"
        self.drawRightString(w - margin, 9 * mm, page_str)

        self.restoreState()


async def generate_group_notes_pdf(
    pool: asyncpg.Pool,
    user: asyncpg.Record,
    cohorte_id: UUID | None = None,
) -> BytesIO:
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    # 1. Fetch data
    grades = await repository.list_grades(pool, user["id"], user["centre_id"])
    centre = await pool.fetchrow(
        "SELECT nom, ville, adresse, telephone FROM centres WHERE id=$1",
        user["centre_id"],
    )

    items = [dict(g) for g in grades]
    if cohorte_id:
        items = [g for g in items if str(g.get("cohorte_id")) == str(cohorte_id)]

    cohorte_name = items[0]["cohorte"] if items else "Toutes les cohortes"
    teacher_name = f"{user['prenom']} {user['nom']}"

    # Calculate statistics
    eval_students = []
    for g in items:
        c = float(g["controle"]) if g.get("controle") is not None else None
        e = float(g["examen"]) if g.get("examen") is not None else None
        if c is not None and e is not None:
            moy = (c + e) / 2
        elif c is not None:
            moy = c
        elif e is not None:
            moy = e
        else:
            moy = None
        eval_students.append({**g, "moyenne": moy})

    valid_moys = [s["moyenne"] for s in eval_students if s["moyenne"] is not None]
    avg_val = sum(valid_moys) / len(valid_moys) if valid_moys else 0.0
    max_val = max(valid_moys) if valid_moys else 0.0
    min_val = min(valid_moys) if valid_moys else 0.0
    pass_count = sum(1 for v in valid_moys if v >= 10.0)
    pass_rate = round((pass_count / len(valid_moys)) * 100) if valid_moys else 0

    # 2. Setup document
    buffer = BytesIO()
    margin = 15 * mm
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    avail_w = A4[0] - 2 * margin

    # Colors
    navy = colors.black
    muted = colors.HexColor("#4B5563")
    border_col = colors.HexColor("#A8A8A8")
    row_alt = colors.HexColor("#F5F5F5")
    paper_grey = colors.HexColor("#F1F1F1")

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=navy,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=navy,
    )
    meta_style = ParagraphStyle(
        "ReportMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=muted,
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=navy,
        spaceBefore=10,
        spaceAfter=6,
    )
    cell_style = ParagraphStyle(
        "Cell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.black,
    )
    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=navy,
    )
    th_style = ParagraphStyle(
        "TH",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    story = []

    # Title & Metadata Header Block
    header_data = [
        [
            Paragraph("<b>RAPPORT PÉDAGOGIQUE — NOTES DU GROUPE</b>", title_style),
            Paragraph(f"<b>Émis le :</b> {date.today().strftime('%d/%m/%Y')}", meta_style),
        ],
        [
            Paragraph(f"Cohorte : <b>{cohorte_name}</b>", subtitle_style),
            Paragraph(f"Enseignant : <b>{teacher_name}</b>", meta_style),
        ],
        [
            Paragraph(f"Centre : <b>{centre['nom'] if centre else 'EDUOS Maroc'}</b>", meta_style),
            Paragraph(f"Ville : <b>{centre['ville'] if centre else 'Rabat'}</b>", meta_style),
        ],
    ]
    header_table = Table(header_data, colWidths=[avail_w * 0.65, avail_w * 0.35])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=navy, spaceBefore=4, spaceAfter=12))

    # KPI Statistics Cards Table (4 columns)
    kpi_data = [
        [
            Paragraph("<font size=7.5><b>MOYENNE DU GROUPE</b></font><br/><font size=14><b>" + f"{avg_val:.1f}" + "</b></font><font size=8> /20</font>", cell_style),
            Paragraph("<font size=7.5><b>TAUX DE RÉUSSITE</b></font><br/><font size=14><b>" + f"{pass_rate}%" + "</b></font>", cell_style),
            Paragraph("<font size=7.5><b>NOTE MAXIMALE</b></font><br/><font size=14><b>" + f"{max_val:.1f}" + "</b></font><font size=8> /20</font>", cell_style),
            Paragraph("<font size=7.5><b>EFFECTIF TOTAL</b></font><br/><font size=14><b>" + f"{len(eval_students)}" + "</b></font><font size=8> élèves</font>", cell_style),
        ]
    ]
    kpi_col_w = avail_w / 4.0
    kpi_table = Table(kpi_data, colWidths=[kpi_col_w] * 4)
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), paper_grey),
        ("GRID", (0, 0), (-1, -1), 0.5, border_col),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 14))

    # Section 1: Detailed Table
    story.append(Paragraph("1. Relevé Détaillé des Notes par Apprenant", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=navy, spaceBefore=2, spaceAfter=8))

    # Table columns: Rang | Apprenant | Contrôle | Examen | Moyenne | Mention | Appréciation
    col_widths = [avail_w * 0.08, avail_w * 0.24, avail_w * 0.12, avail_w * 0.12, avail_w * 0.12, avail_w * 0.14, avail_w * 0.18]
    table_rows = [
        [
            Paragraph("<b>Rang</b>", th_style),
            Paragraph("<b>Apprenant</b>", th_style),
            Paragraph("<b>Contrôle</b>", th_style),
            Paragraph("<b>Examen</b>", th_style),
            Paragraph("<b>Moyenne</b>", th_style),
            Paragraph("<b>Mention</b>", th_style),
            Paragraph("<b>Appréciation</b>", th_style),
        ]
    ]

    # Sort by moyenne DESC
    sorted_students = sorted(
        eval_students,
        key=lambda s: s["moyenne"] if s["moyenne"] is not None else -1,
        reverse=True,
    )

    for idx, s in enumerate(sorted_students, 1):
        c_str = f"{s['controle']:.1f}/20" if s.get("controle") is not None else "—"
        e_str = f"{s['examen']:.1f}/20" if s.get("examen") is not None else "—"
        m_val = s["moyenne"]
        m_str = f"<b>{m_val:.1f}/20</b>" if m_val is not None else "—"

        if m_val is not None:
            if m_val >= 16:
                mention = "<b>Très Bien</b>"
            elif m_val >= 14:
                mention = "<b>Bien</b>"
            elif m_val >= 12:
                mention = "<b>Assez Bien</b>"
            elif m_val >= 10:
                mention = "<b>Passable</b>"
            else:
                mention = "<b>Insuffisant</b>"
        else:
            mention = "Non évalué"

        appr = s.get("appreciation") or "—"

        table_rows.append([
            Paragraph(f"#{idx}", cell_bold),
            Paragraph(s["nom"], cell_bold),
            Paragraph(c_str, cell_style),
            Paragraph(e_str, cell_style),
            Paragraph(m_str, cell_style),
            Paragraph(mention, cell_style),
            Paragraph(appr, cell_style),
        ])

    grades_table = Table(table_rows, colWidths=col_widths)
    t_style = [
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, border_col),
    ]
    for r in range(1, len(table_rows)):
        if r % 2 == 0:
            t_style.append(("BACKGROUND", (0, r), (-1, r), row_alt))
    grades_table.setStyle(TableStyle(t_style))
    story.append(grades_table)

    story.append(Spacer(1, 14))

    # Section 2: Observations & Signatures
    story.append(Paragraph("2. Validation Pédagogique", h2_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=navy, spaceBefore=2, spaceAfter=8))

    sig_data = [
        [
            Paragraph("<b>Signature de l'Enseignant :</b><br/><br/><br/>" + teacher_name, cell_style),
            Paragraph("<b>Visa de la Direction du Centre :</b><br/><br/><br/>" + (centre['nom'] if centre else 'EDUOS Maroc'), cell_style),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[avail_w * 0.5, avail_w * 0.5])
    sig_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, border_col),
        ("BACKGROUND", (0, 0), (-1, -1), paper_grey),
    ]))
    story.append(sig_table)

    # Build PDF
    doc.build(story, canvasmaker=_NumberedCanvas)
    buffer.seek(0)
    return buffer

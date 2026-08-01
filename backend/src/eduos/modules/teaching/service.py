from datetime import date
from typing import BinaryIO
from uuid import UUID, uuid4

import asyncpg
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from eduos.core.config import get_settings
from eduos.integrations.storage.google_drive import (
    DriveNotConfiguredError,
    DriveStorageError,
    drive_storage_key,
)
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
    stream: BinaryIO,
    filename: str,
    mime_type: str,
    size: int,
) -> dict:
    settings = get_settings()
    max_size = settings.google_drive_max_upload_mb * 1024 * 1024
    if size > max_size:
        raise HTTPException(
            413,
            "Le fichier dépasse la limite de "
            f"{settings.google_drive_max_upload_mb} Mo.",
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

    storage = await google_drive_service.storage_for_centre(
        pool,
        user["centre_id"],
    )
    try:
        uploaded = await run_in_threadpool(
            storage.upload,
            stream,
            filename,
            mime_type,
            str(payload.cohorte_id),
        )
    except DriveNotConfiguredError as exc:
        raise HTTPException(503, str(exc)) from exc
    except DriveStorageError as exc:
        raise HTTPException(502, str(exc)) from exc

    storage_key = drive_storage_key(uploaded.file_id)
    stored_payload = payload.model_copy(
        update={
            "storage_key": storage_key,
            "mime_type": uploaded.mime_type,
            "taille_octets": uploaded.size if uploaded.size is not None else size,
        }
    )
    item = await repository.create_resource(
        pool,
        user["id"],
        user["centre_id"],
        uuid4(),
        stored_payload,
        storage_key,
    )
    if not item:
        await run_in_threadpool(storage.delete, uploaded.file_id)
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

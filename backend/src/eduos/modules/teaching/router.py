from datetime import date
from io import BytesIO
from typing import Annotated
from urllib.parse import unquote
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse

from eduos.api.dependencies import (
    DatabasePool,
    Teacher,
    TeachingStaff,
)
from eduos.api.resource_download import (
    google_drive_response,
    google_drive_thumbnail_response,
)
from eduos.core.config import get_settings
from eduos.modules.common import rows
from eduos.modules.google_drive import service as google_drive_service
from eduos.modules.teaching import repository, service
from eduos.modules.teaching.schemas import (
    AttendanceSheetInput,
    ChangeRequestInput,
    EvaluationInput,
    GradeSheetInput,
    ResourceInput,
    ResourceType,
    TicketInput,
    TicketMessageInput,
    TicketStatusInput,
)

router = APIRouter(prefix="/personnel", tags=["Espace pÃ©dagogique"])


@router.get("/dashboard")
async def dashboard(pool: DatabasePool, user: TeachingStaff):
    return await service.dashboard(pool, user)


@router.get("/cohorts")
async def cohorts(pool: DatabasePool, user: TeachingStaff):
    return rows(
        await repository.list_cohorts(pool, user["id"], user["centre_id"])
    )


@router.get("/planning")
async def planning(
    pool: DatabasePool,
    user: TeachingStaff,
    date_from: date | None = None,
    date_to: date | None = None,
):
    return rows(
        await repository.list_sessions(
            pool,
            user["id"],
            user["centre_id"],
            date_from,
            date_to,
        )
    )


@router.post(
    "/planning/{session_id}/change-requests",
    status_code=status.HTTP_201_CREATED,
)
async def request_planning_change(
    session_id: UUID,
    payload: ChangeRequestInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    item = await repository.create_change_request(
        pool,
        user["id"],
        user["centre_id"],
        session_id,
        payload.starts_at,
        payload.ends_at,
        payload.motif,
    )
    if not item:
        raise HTTPException(404, "SÃ©ance introuvable ou non affectÃ©e.")
    return dict(item)


@router.get("/attendance/sessions")
async def attendance_sessions(pool: DatabasePool, user: TeachingStaff):
    return rows(
        await repository.list_sessions(pool, user["id"], user["centre_id"])
    )


@router.get("/attendance/{session_id}")
async def attendance(
    session_id: UUID,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.attendance_sheet(pool, user, session_id)


@router.put("/attendance/{session_id}")
async def save_attendance(
    session_id: UUID,
    payload: AttendanceSheetInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.save_attendance_sheet(
        pool,
        user,
        session_id,
        payload,
    )


@router.get("/resources")
async def resources(pool: DatabasePool, user: TeachingStaff):
    return rows(
        await repository.list_resources(pool, user["id"], user["centre_id"])
    )


@router.post("/resources", status_code=status.HTTP_201_CREATED)
async def create_resource(
    payload: ResourceInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.create_resource(pool, user, payload)


@router.post("/resources/upload", status_code=status.HTTP_201_CREATED)
async def upload_resource(
    request: Request,
    pool: DatabasePool,
    user: TeachingStaff,
    cohorte_id: Annotated[UUID, Query()],
    type: Annotated[ResourceType, Query()],
    titre: Annotated[str, Query(min_length=2, max_length=200)],
    description: Annotated[str | None, Query()] = None,
    publie: Annotated[bool, Query()] = True,
):
    declared_size = int(request.headers.get("x-file-size", "0") or 0)
    max_size = get_settings().google_drive_max_upload_mb * 1024 * 1024
    if declared_size > max_size:
        raise HTTPException(413, "Le fichier dépasse la taille autorisée.")
    content = await request.body()
    filename = unquote(request.headers.get("x-file-name", "ressource"))
    payload = ResourceInput(
        cohorte_id=cohorte_id,
        type=type,
        titre=titre,
        description=description or None,
        publie=publie,
    )
    return await service.create_uploaded_resource(
        pool,
        user,
        payload,
        BytesIO(content),
        filename,
        request.headers.get("content-type", "application/octet-stream"),
        len(content),
    )


@router.get("/resources/google/status")
async def google_drive_status(
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await google_drive_service.connection_status(
        pool,
        user["centre_id"],
    )


@router.get("/resources/google/authorize")
async def authorize_google_drive(user: TeachingStaff):
    return google_drive_service.start_authorization(user)


@router.get("/resources/google/callback")
async def google_drive_callback(
    code: Annotated[str, Query(min_length=1)],
    state: Annotated[str, Query(min_length=1)],
    pool: DatabasePool,
):
    redirect_url = await google_drive_service.complete_authorization(
        pool,
        code,
        state,
    )
    return RedirectResponse(redirect_url, status_code=303)


@router.delete("/resources/google/connection")
async def disconnect_google_drive(
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await google_drive_service.disconnect(pool, user["centre_id"])


@router.get("/resources/{resource_id}/download")
async def download_resource(
    resource_id: UUID,
    pool: DatabasePool,
    user: TeachingStaff,
):
    item = await repository.get_resource_for_teacher(
        pool,
        user["id"],
        user["centre_id"],
        resource_id,
    )
    if not item:
        raise HTTPException(404, "Ressource accessible introuvable.")
    return await google_drive_response(
        pool,
        user["centre_id"],
        item["storage_key"],
    )


@router.get("/resources/{resource_id}/preview")
async def preview_resource(
    resource_id: UUID,
    pool: DatabasePool,
    user: TeachingStaff,
):
    item = await repository.get_resource_for_teacher(
        pool,
        user["id"],
        user["centre_id"],
        resource_id,
    )
    if not item:
        raise HTTPException(404, "Ressource accessible introuvable.")
    return await google_drive_thumbnail_response(
        pool,
        user["centre_id"],
        item["storage_key"],
    )


@router.get("/evaluations")
async def evaluations(pool: DatabasePool, user: TeachingStaff):
    return rows(
        await repository.list_evaluations(pool, user["id"], user["centre_id"])
    )


@router.post("/evaluations", status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    payload: EvaluationInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.create_evaluation(pool, user, payload)


@router.get("/contacts")
async def contacts(pool: DatabasePool, user: TeachingStaff):
    return rows(
        await repository.list_contacts(pool, user["id"], user["centre_id"])
    )


@router.get("/tickets")
async def tickets(pool: DatabasePool, user: TeachingStaff):
    return await service.list_tickets(pool, user)


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.create_ticket(pool, user, payload)


@router.post(
    "/tickets/{ticket_id}/messages",
    status_code=status.HTTP_201_CREATED,
)
async def reply_to_ticket(
    ticket_id: UUID,
    payload: TicketMessageInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    return await service.reply_to_ticket(pool, user, ticket_id, payload.message)


@router.patch("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: UUID,
    payload: TicketStatusInput,
    pool: DatabasePool,
    user: TeachingStaff,
):
    item = await repository.update_ticket_status(
        pool,
        ticket_id,
        user["id"],
        user["centre_id"],
        payload.statut,
    )
    if not item:
        raise HTTPException(404, "Conversation introuvable.")
    return dict(item)


@router.get("/grades")
async def grades(pool: DatabasePool, user: Teacher):
    return rows(
        await repository.list_grades(pool, user["id"], user["centre_id"])
    )


@router.put("/grades")
async def save_grades(
    payload: GradeSheetInput,
    pool: DatabasePool,
    user: Teacher,
):
    return await service.save_grades(pool, user, payload)

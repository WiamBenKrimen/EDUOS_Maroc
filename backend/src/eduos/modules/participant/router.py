from uuid import UUID

from fastapi import APIRouter, HTTPException

from eduos.api.dependencies import DatabasePool, Participant
from eduos.api.resource_download import (
    google_drive_response,
    google_drive_thumbnail_response,
)
from eduos.modules.common import rows
from eduos.modules.participant import repository, service
from eduos.modules.participant.schemas import (
    AccountInput,
    EvaluationSubmissionInput,
    PasswordInput,
    ProgressInput,
)

router = APIRouter(prefix="/participant", tags=["Espace participant"])


@router.get("/dashboard")
async def dashboard(pool: DatabasePool, user: Participant):
    return await service.dashboard(pool, user)


@router.get("/payments")
async def payments(pool: DatabasePool, user: Participant):
    return await service.payments(pool, user)


@router.get("/documents")
async def documents(pool: DatabasePool, user: Participant):
    return rows(await repository.list_documents(pool, user["id"]))


@router.get("/reports")
async def reports(pool: DatabasePool, user: Participant):
    return await service.list_reports(pool, user)


@router.get("/resources")
async def resources(pool: DatabasePool, user: Participant):
    return rows(await repository.list_resources(pool, user["id"]))


@router.get("/resources/{resource_id}/download")
async def download_resource(
    resource_id: UUID,
    pool: DatabasePool,
    user: Participant,
):
    item = await repository.get_resource_for_participant(
        pool,
        user["id"],
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
    user: Participant,
):
    item = await repository.get_resource_for_participant(
        pool,
        user["id"],
        resource_id,
    )
    if not item:
        raise HTTPException(404, "Ressource accessible introuvable.")
    return await google_drive_thumbnail_response(
        pool,
        user["centre_id"],
        item["storage_key"],
    )


@router.patch("/resources/{resource_id}/progress")
async def update_resource_progress(
    resource_id: UUID,
    payload: ProgressInput,
    pool: DatabasePool,
    user: Participant,
):
    item = await repository.update_resource_progress(
        pool,
        user["id"],
        resource_id,
        payload.progression,
    )
    if not item:
        raise HTTPException(404, "Ressource accessible introuvable.")
    return dict(item)


@router.get("/evaluations")
async def evaluations(pool: DatabasePool, user: Participant):
    return rows(await repository.list_evaluations(pool, user["id"]))


@router.get("/evaluations/{evaluation_id}")
async def evaluation(
    evaluation_id: UUID,
    pool: DatabasePool,
    user: Participant,
):
    return await service.evaluation_detail(pool, user, evaluation_id)


@router.post("/evaluations/{evaluation_id}/submit")
async def submit_evaluation(
    evaluation_id: UUID,
    payload: EvaluationSubmissionInput,
    pool: DatabasePool,
    user: Participant,
):
    return await service.submit_evaluation(
        pool,
        user,
        evaluation_id,
        payload,
    )


@router.get("/notifications")
async def notifications(pool: DatabasePool, user: Participant):
    return rows(await repository.list_notifications(pool, user["id"]))


@router.patch("/notifications/read-all")
async def read_all_notifications(pool: DatabasePool, user: Participant):
    return {
        "updated": await repository.mark_all_notifications_read(
            pool,
            user["id"],
        )
    }


@router.patch("/notifications/{notification_id}/read")
async def read_notification(
    notification_id: UUID,
    pool: DatabasePool,
    user: Participant,
):
    item = await repository.mark_notification_read(
        pool,
        user["id"],
        notification_id,
    )
    if not item:
        raise HTTPException(404, "Notification introuvable.")
    return dict(item)


@router.get("/account")
async def account(pool: DatabasePool, user: Participant):
    return await service.profile(pool, user)


@router.patch("/account")
async def update_account(
    payload: AccountInput,
    pool: DatabasePool,
    user: Participant,
):
    return await service.update_account(pool, user, payload)


@router.patch("/account/password")
async def change_password(
    payload: PasswordInput,
    pool: DatabasePool,
    user: Participant,
):
    changed = await repository.change_password(
        pool,
        user["id"],
        payload.current_password,
        payload.new_password,
    )
    if not changed:
        raise HTTPException(400, "Le mot de passe actuel est incorrect.")
    return {"changed": True}

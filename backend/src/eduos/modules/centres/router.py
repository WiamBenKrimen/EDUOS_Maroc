from uuid import UUID

import asyncpg
from fastapi import APIRouter, HTTPException, status

from eduos.api.dependencies import Admin, DatabasePool
from eduos.modules.centres import repository
from eduos.modules.centres.schemas import CentreApplicationDecision, CentreApplicationInput
from eduos.modules.common import rows

router = APIRouter(tags=["Administration des centres"])


@router.post("/centre-applications", status_code=status.HTTP_201_CREATED)
async def submit_application(payload: CentreApplicationInput, pool: DatabasePool):
    return dict(await repository.create_application(pool, payload))


@router.get("/admin/centre-applications")
async def list_centre_applications(pool: DatabasePool, user: Admin):
    return rows(await repository.list_applications(pool))


@router.patch("/admin/centre-applications/{application_id}")
async def decide_centre_application(
    application_id: UUID, payload: CentreApplicationDecision, pool: DatabasePool, user: Admin,
):
    try:
        item = await repository.decide_application(
            pool, application_id, user["id"], payload.statut, payload.motif_refus, payload.password
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from exc
    except asyncpg.UniqueViolationError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, "Cette adresse e-mail est déjà utilisée.") from exc
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Candidature introuvable ou déjà traitée.")
    return dict(item)

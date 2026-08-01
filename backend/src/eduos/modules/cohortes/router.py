from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.cohortes import repository
from eduos.modules.cohortes.schemas import CohorteInput, CohorteUpdate
from eduos.modules.common import rows

router = APIRouter(prefix="/director/cohortes", tags=["Cohortes"])


@router.get("")
async def list_cohortes(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_cohorte(
    payload: CohorteInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.create(pool, user["centre_id"], payload)
    if not item:
        raise HTTPException(404, "Formation introuvable.")
    return dict(item)


@router.patch("/{cohorte_id}")
async def update_cohorte(
    cohorte_id: UUID,
    payload: CohorteUpdate,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update(
        pool,
        user["centre_id"],
        cohorte_id,
        payload,
    )
    if not item:
        raise HTTPException(404, "Cohorte introuvable.")
    return dict(item)

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.prospects import repository
from eduos.modules.prospects.schemas import ProspectInput, ProspectStatusInput

router = APIRouter(prefix="/director/prospects", tags=["Prospects"])


@router.get("")
async def list_prospects(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_prospect(
    payload: ProspectInput,
    pool: DatabasePool,
    user: Director,
):
    return dict(await repository.create(pool, user["centre_id"], payload))


@router.patch("/{prospect_id}/statut")
async def update_prospect_status(
    prospect_id: UUID,
    payload: ProspectStatusInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update_status(
        pool, user["centre_id"], prospect_id, payload
    )
    if not item:
        raise HTTPException(404, "Prospect introuvable.")
    return dict(item)

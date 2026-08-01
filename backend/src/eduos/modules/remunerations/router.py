from datetime import date
from uuid import UUID

from fastapi import APIRouter, HTTPException

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.remunerations import repository
from eduos.modules.remunerations.schemas import RemunerationStatusInput

router = APIRouter(prefix="/director/remunerations", tags=["Rémunérations"])


@router.get("")
async def list_remunerations(
    pool: DatabasePool,
    user: Director,
    periode: date | None = None,
):
    return rows(await repository.list_all(pool, user["centre_id"], periode))


@router.patch("/{remuneration_id}")
async def update_remuneration(
    remuneration_id: UUID,
    payload: RemunerationStatusInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update_status(
        pool,
        user["centre_id"],
        remuneration_id,
        payload.statut,
    )
    if not item:
        raise HTTPException(404, "Rémunération introuvable.")
    return dict(item)

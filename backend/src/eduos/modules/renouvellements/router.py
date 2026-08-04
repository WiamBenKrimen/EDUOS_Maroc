from uuid import UUID

from fastapi import APIRouter, HTTPException

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.renouvellements import repository
from eduos.modules.renouvellements.schemas import RenewalUpdateInput

router = APIRouter(prefix="/director/renewals", tags=["Renouvellements"])


@router.get("")
async def renewals(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.patch("/{renewal_id}")
async def update_renewal(
    renewal_id: UUID,
    payload: RenewalUpdateInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update(
        pool, user["centre_id"], renewal_id, payload
    )
    if not item:
        raise HTTPException(404, "Renouvellement introuvable.")
    return dict(item)

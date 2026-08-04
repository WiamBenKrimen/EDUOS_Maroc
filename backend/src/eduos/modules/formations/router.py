from fastapi import APIRouter, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.formations import repository
from eduos.modules.formations.schemas import FormationInput

router = APIRouter(prefix="/director/formations", tags=["Formations"])


@router.get("")
async def list_formations(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_formation(
    payload: FormationInput,
    pool: DatabasePool,
    user: Director,
):
    return dict(await repository.create(pool, user["centre_id"], payload))

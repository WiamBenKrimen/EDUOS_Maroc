from fastapi import APIRouter, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.users import repository, service
from eduos.modules.users.schemas import PersonnelInput

router = APIRouter(prefix="/director/personnel", tags=["Personnel"])


@router.get("")
async def list_personnel(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_personnel(
    payload: PersonnelInput,
    pool: DatabasePool,
    user: Director,
):
    return await service.create(pool, user, payload)

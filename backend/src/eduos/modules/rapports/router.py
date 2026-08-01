from fastapi import APIRouter

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.rapports import repository

router = APIRouter(prefix="/director", tags=["Rapports"])


@router.get("/reports")
async def reports(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))

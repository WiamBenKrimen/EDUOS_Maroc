from fastapi import APIRouter

from eduos.api.dependencies import DatabasePool
from eduos.modules.health import repository

router = APIRouter(prefix="/health", tags=["Santé"])


@router.get("")
async def health():
    return {"status": "ok", "service": "eduos-fastapi"}


@router.get("/db")
async def health_db(pool: DatabasePool):
    await repository.ping(pool)
    return {"status": "ok", "database": "postgresql"}

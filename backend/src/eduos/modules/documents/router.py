from fastapi import APIRouter, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.documents import repository
from eduos.modules.documents.schemas import AttestationGenerationInput

router = APIRouter(prefix="/director", tags=["Documents"])


@router.get("/attestations")
async def attestations(pool: DatabasePool, user: Director):
    return rows(await repository.list_attestations(pool, user["centre_id"]))


@router.post("/attestations/generate", status_code=status.HTTP_201_CREATED)
async def generate_attestations(
    payload: AttestationGenerationInput,
    pool: DatabasePool,
    user: Director,
):
    created = await repository.generate_attestations(
        pool,
        user["centre_id"],
        user["id"],
        payload.inscription_ids,
    )
    return {"generated": len(created), "items": rows(created)}

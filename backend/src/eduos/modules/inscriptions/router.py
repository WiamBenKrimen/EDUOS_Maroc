from fastapi import APIRouter, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.inscriptions import repository, service
from eduos.modules.inscriptions.schemas import EnrollmentInput

router = APIRouter(prefix="/director", tags=["Inscriptions"])


@router.get("/enrollment-options")
async def enrollment_options(pool: DatabasePool, user: Director):
    return rows(await repository.list_options(pool, user["centre_id"]))


@router.post("/enrollments", status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    payload: EnrollmentInput,
    pool: DatabasePool,
    user: Director,
):
    return await service.create(pool, user, payload)

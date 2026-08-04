from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.planning import repository
from eduos.modules.planning.schemas import (
    ChangeRequestDecisionInput,
    SeanceInput,
)

router = APIRouter(prefix="/director/planning", tags=["Planning"])


@router.get("")
async def planning(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_seance(
    payload: SeanceInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.create(pool, user["centre_id"], payload)
    if not item:
        raise HTTPException(404, "Cohorte introuvable.")
    return dict(item)


@router.patch("/{seance_id}")
async def update_seance(
    seance_id: UUID,
    payload: SeanceInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update(
        pool,
        user["centre_id"],
        seance_id,
        payload,
    )
    if not item:
        raise HTTPException(404, "Séance ou cohorte introuvable.")
    return dict(item)


@router.delete("/{seance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seance(
    seance_id: UUID,
    pool: DatabasePool,
    user: Director,
):
    if not await repository.delete(pool, user["centre_id"], seance_id):
        raise HTTPException(404, "Séance introuvable.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/requests")
async def change_requests(pool: DatabasePool, user: Director):
    return rows(
        await repository.list_change_requests(pool, user["centre_id"])
    )


@router.patch("/requests/{request_id}")
async def decide_change_request(
    request_id: UUID,
    payload: ChangeRequestDecisionInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.decide_change_request(
        pool,
        user["centre_id"],
        request_id,
        user["id"],
        payload.statut,
    )
    if not item:
        raise HTTPException(404, "Demande en attente introuvable.")
    return dict(item)

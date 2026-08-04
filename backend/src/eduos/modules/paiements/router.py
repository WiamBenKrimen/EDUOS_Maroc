from fastapi import APIRouter, HTTPException, status

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.paiements import repository
from eduos.modules.paiements.schemas import PaymentInput

router = APIRouter(prefix="/director/payments", tags=["Paiements"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.create(
        pool,
        user["centre_id"],
        user["id"],
        payload,
    )
    if not item:
        raise HTTPException(404, "Facture introuvable.")
    return dict(item)

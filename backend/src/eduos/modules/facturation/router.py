from fastapi import APIRouter

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.facturation import repository

router = APIRouter(prefix="/director", tags=["Facturation"])


@router.get("/financial")
async def financial(pool: DatabasePool, user: Director):
    invoices, payments = await repository.financial_summary(
        pool,
        user["centre_id"],
    )
    return {"invoices": rows(invoices), "payments": rows(payments)}


@router.get("/paiements")
async def list_invoices(pool: DatabasePool, user: Director):
    return rows(await repository.list_invoices(pool, user["centre_id"]))

from fastapi import APIRouter

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.dashboard import repository

router = APIRouter(prefix="/director", tags=["Tableau de bord"])


@router.get("/dashboard")
async def dashboard(pool: DatabasePool, user: Director):
    kpis = dict(await repository.get_kpis(pool, user["centre_id"]))
    sessions = await repository.get_upcoming_sessions(pool, user["centre_id"])
    return {
        "eleves_actifs": kpis["active_students"],
        "taux_presence": kpis["attendance_rate"],
        "ca_encaisse": kpis["collected_revenue"],
        "paiements_retard": kpis["invoices_to_follow"],
        "kpis": kpis,
        "upcoming_sessions": rows(sessions),
    }

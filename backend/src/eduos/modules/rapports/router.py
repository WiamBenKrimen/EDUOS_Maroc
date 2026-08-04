from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.rapports import repository
from eduos.modules.rapports import service as rapports_service

router = APIRouter(prefix="/director", tags=["Rapports"])


@router.get("/reports")
async def reports(pool: DatabasePool, user: Director):
    return rows(await repository.list_all(pool, user["centre_id"]))


@router.get("/reports/monthly/{year}/{month}/summary")
async def reports_monthly_summary(pool: DatabasePool, user: Director, year: int, month: int):
    """Return JSON summary data for the frontend preview card."""
    return await rapports_service.monthly_report_summary(pool, user["centre_id"], year, month)


@router.get("/reports/monthly/{year}/{month}")
async def reports_monthly_pdf(pool: DatabasePool, user: Director, year: int, month: int):
    """Generate and stream the complete monthly PDF report."""
    data = await rapports_service.monthly_report_pdf(pool, user["centre_id"], year, month)
    filename = f"rapport-mensuel-{year}-{month:02d}.pdf"
    return StreamingResponse(
        iter([data]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

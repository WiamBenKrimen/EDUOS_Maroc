from fastapi import APIRouter

from eduos.modules.assistant.router import router as assistant_router
from eduos.modules.auth.router import router as auth_router
from eduos.modules.centres.router import router as centres_router
from eduos.modules.cohortes.router import router as cohortes_router
from eduos.modules.dashboard.router import router as dashboard_router
from eduos.modules.documents.router import router as documents_router
from eduos.modules.facturation.router import router as facturation_router
from eduos.modules.formations.router import router as formations_router
from eduos.modules.health.router import router as health_router
from eduos.modules.inscriptions.router import router as inscriptions_router
from eduos.modules.notifications.router import (
    public_router as whatsapp_public_router,
)
from eduos.modules.notifications.router import (
    router as notifications_router,
)
from eduos.modules.paiements.router import router as paiements_router
from eduos.modules.participant.router import router as participant_router
from eduos.modules.planning.router import router as planning_router
from eduos.modules.prospects.router import router as prospects_router
from eduos.modules.rapports.router import router as rapports_router
from eduos.modules.remunerations.router import router as remunerations_router
from eduos.modules.renouvellements.router import router as renouvellements_router
from eduos.modules.teaching.router import router as teaching_router
from eduos.modules.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(whatsapp_public_router)
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(assistant_router)
api_router.include_router(centres_router)
api_router.include_router(dashboard_router)
api_router.include_router(users_router)
api_router.include_router(prospects_router)
api_router.include_router(formations_router)
api_router.include_router(cohortes_router)
api_router.include_router(planning_router)
api_router.include_router(inscriptions_router)
api_router.include_router(facturation_router)
api_router.include_router(paiements_router)
api_router.include_router(remunerations_router)
api_router.include_router(notifications_router)
api_router.include_router(renouvellements_router)
api_router.include_router(documents_router)
api_router.include_router(rapports_router)
api_router.include_router(teaching_router)
api_router.include_router(participant_router)

from uuid import UUID

from fastapi import APIRouter, HTTPException

from eduos.api.dependencies import DatabasePool, Director
from eduos.core.config import get_settings
from eduos.modules.assistant import repository, service
from eduos.modules.assistant.schemas import (
    AssistantActionResult,
    AssistantChatInput,
    AssistantChatOutput,
    AssistantStatusOutput,
)

router = APIRouter(prefix="/director/assistant", tags=["Assistant IA"])


@router.get("/status", response_model=AssistantStatusOutput)
async def assistant_status(_: Director):
    settings = get_settings()
    return {
        "configured": bool(settings.nvidia_api_key),
        "provider": "NVIDIA NIM",
        "model": settings.nvidia_ai_model,
        "capabilities": [
            "Pilotage et priorités",
            "Apprenants et inscriptions",
            "Prospects et personnel",
            "Formations et cohortes",
            "Planning et changements",
            "Factures, paiements et relances",
            "Rapports et renouvellements",
            "Attestations et documents",
            "Rémunérations des formateurs",
            "Communication WhatsApp",
        ],
    }


@router.post("/chat", response_model=AssistantChatOutput)
async def assistant_chat(
    payload: AssistantChatInput, pool: DatabasePool, user: Director
):
    return await service.chat(pool, user, payload)


@router.post("/actions/{action_id}/confirm", response_model=AssistantActionResult)
async def confirm_action(action_id: UUID, pool: DatabasePool, user: Director):
    return await service.execute_action(pool, user, action_id)


@router.post("/actions/{action_id}/cancel")
async def cancel_action(action_id: UUID, pool: DatabasePool, user: Director):
    cancelled = await repository.cancel_action(
        pool, action_id, user["centre_id"], user["id"]
    )
    if not cancelled:
        raise HTTPException(409, "Cette action ne peut plus être annulée.")
    return {"cancelled": True}

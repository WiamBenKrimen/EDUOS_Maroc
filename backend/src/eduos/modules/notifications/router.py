from uuid import UUID

from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.notifications import repository
from eduos.modules.notifications.schemas import ReminderRuleStatusInput
from eduos.modules.notifications.schemas import WhatsAppMessageInput
from eduos.core.config import get_settings
from eduos.integrations.whatsapp.client import EvolutionAPIError, EvolutionWhatsAppClient

router = APIRouter(prefix="/director", tags=["Relances"])


@router.get("/notifications")
async def notifications(pool: DatabasePool, user: Director):
    return rows(await repository.list_user_notifications(pool, user["id"]))


@router.patch("/notifications/read-all")
async def read_all_notifications(pool: DatabasePool, user: Director):
    return {"updated": await repository.mark_all_read(pool, user["id"])}


@router.get("/reminder-rules")
async def reminder_rules(pool: DatabasePool, user: Director):
    return rows(await repository.list_reminder_rules(pool, user["centre_id"]))


@router.patch("/reminder-rules/{rule_id}")
async def update_reminder_rule(
    rule_id: UUID,
    payload: ReminderRuleStatusInput,
    pool: DatabasePool,
    user: Director,
):
    item = await repository.update_reminder_rule(
        pool,
        user["centre_id"],
        rule_id,
        payload.actif,
    )
    if not item:
        raise HTTPException(404, "Règle de relance introuvable.")
    return dict(item)


@router.post("/reminders/send")
async def send_reminders(pool: DatabasePool, user: Director):
    created = await repository.create_overdue_reminders(
        pool,
        user["centre_id"],
    )
    return {"sent": len(created), "items": rows(created)}


@router.get("/whatsapp/contacts")
async def whatsapp_contacts(pool: DatabasePool, user: Director):
    return rows(await repository.list_whatsapp_contacts(pool, user["centre_id"]))


def _get_director_instance_name(user: Director) -> str:
    centre_id_str = str(user["centre_id"]).replace("-", "")[:8]
    return f"eduos-director-{centre_id_str}"


@router.get("/whatsapp/status")
async def get_whatsapp_status(user: Director):
    settings = get_settings()
    if not (settings.evolution_api_url and settings.evolution_api_key):
        return {"configured": False, "state": "unconfigured"}
    
    instance_name = _get_director_instance_name(user)
    client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
    
    try:
        status_info = await run_in_threadpool(client.get_connection_state, instance_name)
        state = status_info.get("state", "disconnected")
        qr_code = None
        if state in ("connecting", "disconnected", "not_created"):
            qr_code = await run_in_threadpool(client.get_qr_code, instance_name)
        return {
            "configured": True,
            "instance_name": instance_name,
            "state": state,
            "qr_code": qr_code,
        }
    except EvolutionAPIError as exc:
        return {"configured": True, "state": "error", "error": str(exc)}


@router.post("/whatsapp/connect")
async def connect_whatsapp(user: Director):
    settings = get_settings()
    if not (settings.evolution_api_url and settings.evolution_api_key):
        raise HTTPException(503, "Evolution API n'est pas configurée.")
    
    instance_name = _get_director_instance_name(user)
    client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
    
    try:
        # Check current status
        status_info = await run_in_threadpool(client.get_connection_state, instance_name)
        state = status_info.get("state")
        
        if state == "not_created":
            await run_in_threadpool(client.create_instance, instance_name)
        
        qr_code = await run_in_threadpool(client.get_qr_code, instance_name)
        return {
            "instance_name": instance_name,
            "state": state or "connecting",
            "qr_code": qr_code,
        }
    except EvolutionAPIError as exc:
        raise HTTPException(502, str(exc)) from exc


@router.post("/whatsapp/disconnect")
async def disconnect_whatsapp(user: Director):
    settings = get_settings()
    if not (settings.evolution_api_url and settings.evolution_api_key):
        raise HTTPException(503, "Evolution API n'est pas configurée.")
    
    instance_name = _get_director_instance_name(user)
    client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
    success = await run_in_threadpool(client.logout_instance, instance_name)
    return {"disconnected": success}


@router.post("/whatsapp/messages")
async def send_whatsapp_message(payload: WhatsAppMessageInput, pool: DatabasePool, user: Director):
    settings = get_settings()
    if not (settings.evolution_api_url and settings.evolution_api_key):
        raise HTTPException(503, "Evolution API n'est pas configurée sur le serveur.")
    try:
        recipient_uuid = UUID(payload.recipient_id)
    except ValueError:
        raise HTTPException(422, "Destinataire invalide.") from None
    recipient = await repository.get_whatsapp_contact(pool, user["centre_id"], recipient_uuid)
    if not recipient:
        raise HTTPException(404, "Destinataire WhatsApp introuvable.")
    
    instance_name = _get_director_instance_name(user)
    client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
    
    try:
        await run_in_threadpool(client.send_text, recipient["telephone"], payload.message, instance_name)
    except EvolutionAPIError as exc:
        # Fallback to default instance if director-specific instance doesn't exist yet
        try:
            default_inst = settings.evolution_api_instance or "eduos-whatsapp"
            await run_in_threadpool(client.send_text, recipient["telephone"], payload.message, default_inst)
        except EvolutionAPIError:
            raise HTTPException(502, str(exc)) from exc

    return {"sent": True, "recipient": {"id": str(recipient["id"]), "nom": recipient["nom"]}}

import base64
from uuid import UUID, uuid4
from typing import Any
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from starlette.concurrency import run_in_threadpool

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.notifications import repository
from eduos.modules.notifications.schemas import ReminderRuleStatusInput
from eduos.modules.notifications.schemas import WhatsAppMessageInput
from eduos.core.config import get_settings, BACKEND_ROOT
from eduos.integrations.whatsapp.client import EvolutionAPIError, EvolutionWhatsAppClient

router = APIRouter(prefix="/director", tags=["Relances"])
public_router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Webhook"])

UPLOAD_DIR = BACKEND_ROOT / "uploads" / "whatsapp"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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
        
        if state == "open":
            webhook_url = f"http://localhost:3001/api/whatsapp/webhook/{user['centre_id']}"
            await run_in_threadpool(client.set_webhook, instance_name, webhook_url)
            
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


async def _save_incoming_media_file(client: EvolutionWhatsAppClient, instance_name: str, msg_record: dict, default_ext: str = ".jpg") -> str | None:
    """Download incoming media base64 from WhatsApp and save to EDUOS storage."""
    try:
        media_res = await run_in_threadpool(client.get_media_base64, instance_name, msg_record)
        if not media_res or not isinstance(media_res, dict):
            return None
        
        b64_str = media_res.get("base64", "")
        if not b64_str:
            return None
        
        if "base64," in b64_str:
            b64_str = b64_str.split("base64,")[-1]
        
        file_bytes = base64.b64decode(b64_str)
        file_id = uuid4().hex
        
        filename = f"media_{file_id[:8]}{default_ext}"
        msg_obj = msg_record.get("message", {})
        if "documentMessage" in msg_obj:
            filename = msg_obj["documentMessage"].get("fileName") or filename

        saved_path = UPLOAD_DIR / f"{file_id}_{filename}"
        saved_path.write_bytes(file_bytes)
        return f"http://localhost:3001/api/whatsapp/media/{file_id}/{filename}"
    except Exception:
        return None


@router.get("/whatsapp/messages/{recipient_id}")
async def get_whatsapp_chat_history(recipient_id: UUID, pool: DatabasePool, user: Director):
    recipient = await repository.get_whatsapp_contact(pool, user["centre_id"], recipient_id)
    if not recipient:
        raise HTTPException(404, "Destinataire WhatsApp introuvable.")

    chat_list = await repository.list_whatsapp_chat_messages(pool, user["centre_id"], recipient_id)
    existing_messages_text = {m["message"] for m in chat_list if m["direction"] == "received"}

    settings = get_settings()
    if settings.evolution_api_url and settings.evolution_api_key:
        instance_name = _get_director_instance_name(user)
        client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
        try:
            live_records = await run_in_threadpool(client.fetch_messages_for_number, instance_name, recipient["telephone"])
            new_received = False
            for rec in live_records:
                key = rec.get("key", {})
                if key.get("fromMe", False):
                    continue
                
                msg_content = ""
                msg_obj = rec.get("message", {})
                if isinstance(msg_obj, dict):
                    if "conversation" in msg_obj:
                        msg_content = msg_obj["conversation"]
                    elif "extendedTextMessage" in msg_obj:
                        msg_content = msg_obj["extendedTextMessage"].get("text", "")
                    elif "imageMessage" in msg_obj:
                        caption = msg_obj["imageMessage"].get("caption", "")
                        media_url = await _save_incoming_media_file(client, instance_name, rec, ".jpg")
                        if media_url:
                            msg_content = f"📷 [Photo]({media_url})\n{caption}".strip()
                        else:
                            msg_content = f"📷 [Photo]\n{caption}".strip()
                    elif "documentMessage" in msg_obj:
                        fname = msg_obj["documentMessage"].get("fileName", "Document")
                        caption = msg_obj["documentMessage"].get("caption", "")
                        ext = Path(fname).suffix or ".pdf"
                        media_url = await _save_incoming_media_file(client, instance_name, rec, ext)
                        if media_url:
                            msg_content = f"📎 [{fname}]({media_url})\n{caption}".strip()
                        else:
                            msg_content = f"📎 [{fname}]\n{caption}".strip()
                    elif "audioMessage" in msg_obj:
                        media_url = await _save_incoming_media_file(client, instance_name, rec, ".ogg")
                        if media_url:
                            msg_content = f"🎵 [Message vocal]({media_url})"
                        else:
                            msg_content = "🎵 [Message vocal]"

                if msg_content and msg_content not in existing_messages_text:
                    await repository.save_whatsapp_message(
                        pool,
                        user["centre_id"],
                        recipient_id,
                        "received",
                        msg_content,
                    )
                    new_received = True

            if new_received:
                chat_list = await repository.list_whatsapp_chat_messages(pool, user["centre_id"], recipient_id)

        except Exception:
            pass

    return rows(chat_list)


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
        try:
            default_inst = settings.evolution_api_instance or "eduos-whatsapp"
            await run_in_threadpool(client.send_text, recipient["telephone"], payload.message, default_inst)
        except EvolutionAPIError:
            raise HTTPException(502, str(exc)) from exc

    saved_msg = await repository.save_whatsapp_message(
        pool,
        user["centre_id"],
        recipient_uuid,
        "sent",
        payload.message,
    )

    return {
        "sent": True,
        "recipient": {"id": str(recipient["id"]), "nom": recipient["nom"]},
        "message": dict(saved_msg),
    }


@router.post("/whatsapp/media")
async def send_whatsapp_media(
    pool: DatabasePool,
    user: Director,
    recipient_id: UUID = Form(...),
    caption: str = Form(""),
    file: UploadFile = File(...),
):
    settings = get_settings()
    if not (settings.evolution_api_url and settings.evolution_api_key):
        raise HTTPException(503, "Evolution API n'est pas configurée sur le serveur.")
    
    recipient = await repository.get_whatsapp_contact(pool, user["centre_id"], recipient_id)
    if not recipient:
        raise HTTPException(404, "Destinataire WhatsApp introuvable.")
    
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(413, "Fichier trop volumineux (max 20 Mo).")
    
    filename = file.filename or "fichier"
    file_id = uuid4().hex
    saved_file_name = f"{file_id}_{filename}"
    saved_file_path = UPLOAD_DIR / saved_file_name
    saved_file_path.write_bytes(file_bytes)

    file_url = f"http://localhost:3001/api/whatsapp/media/{file_id}/{filename}"
    
    mime_type = file.content_type or "application/octet-stream"
    media_base64 = base64.b64encode(file_bytes).decode("utf-8")
    
    mediatype = "document"
    if mime_type.startswith("image/"):
        mediatype = "image"
    elif mime_type.startswith("audio/"):
        mediatype = "audio"
        mime_type = "audio/mp3"
        filename = "vocal.mp3"
    elif mime_type.startswith("video/"):
        mediatype = "video"
        
    instance_name = _get_director_instance_name(user)
    client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
    
    try:
        await run_in_threadpool(
            client.send_media,
            recipient["telephone"],
            media_base64,
            mediatype,
            filename,
            caption,
            mime_type,
            instance_name,
        )
    except EvolutionAPIError as exc:
        try:
            default_inst = settings.evolution_api_instance or "eduos-whatsapp"
            await run_in_threadpool(
                client.send_media,
                recipient["telephone"],
                media_base64,
                mediatype,
                filename,
                caption,
                mime_type,
                default_inst,
            )
        except EvolutionAPIError:
            raise HTTPException(502, str(exc)) from exc

    if mediatype == "image":
        msg_text = f"📷 [Photo]({file_url})"
    elif mediatype == "audio":
        msg_text = f"🎵 [Message vocal]({file_url})"
    else:
        msg_text = f"📎 [{filename}]({file_url})"

    if caption:
        msg_text += f"\n{caption}"

    saved_msg = await repository.save_whatsapp_message(
        pool,
        user["centre_id"],
        recipient_id,
        "sent",
        msg_text,
    )

    return {
        "sent": True,
        "recipient": {"id": str(recipient["id"]), "nom": recipient["nom"]},
        "message": dict(saved_msg),
    }


@public_router.get("/media/{file_id}/{filename}")
async def get_whatsapp_media_file(file_id: str, filename: str):
    file_path = UPLOAD_DIR / f"{file_id}_{filename}"
    if not file_path.exists():
        raise HTTPException(404, "Fichier introuvable.")
    return FileResponse(file_path, filename=filename)


@public_router.post("/webhook/{centre_id}")
async def whatsapp_webhook(centre_id: UUID, request: Request, pool: DatabasePool):
    """Public webhook to receive incoming messages from Evolution API."""
    try:
        body: dict[str, Any] = await request.json()
    except Exception:
        return {"status": "ignored_invalid_json"}
    
    event = str(body.get("event", "")).lower()
    if event not in ("messages.upsert", "messages_upsert"):
        return {"status": "ignored_event"}
    
    data = body.get("data", {})
    key = data.get("key", {})
    from_me = key.get("fromMe", False)
    
    if from_me:
        return {"status": "ignored_from_me"}
    
    remote_jid = key.get("remoteJid", "")
    phone_number = remote_jid.split("@")[0].split(":")[0]
    
    message_content = ""
    msg_obj = data.get("message", {})
    if isinstance(msg_obj, dict):
        if "conversation" in msg_obj:
            message_content = msg_obj["conversation"]
        elif "extendedTextMessage" in msg_obj:
            message_content = msg_obj["extendedTextMessage"].get("text", "")
        elif "imageMessage" in msg_obj:
            caption = msg_obj["imageMessage"].get("caption", "")
            centre_str = str(centre_id).replace("-", "")[:8]
            instance_name = f"eduos-director-{centre_str}"
            settings = get_settings()
            media_url = None
            if settings.evolution_api_url and settings.evolution_api_key:
                client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
                media_url = await _save_incoming_media_file(client, instance_name, data, ".jpg")
            if media_url:
                message_content = f"📷 [Photo]({media_url})\n{caption}".strip()
            else:
                message_content = f"📷 [Photo]\n{caption}".strip()
        elif "documentMessage" in msg_obj:
            fname = msg_obj["documentMessage"].get("fileName", "Document")
            caption = msg_obj["documentMessage"].get("caption", "")
            ext = Path(fname).suffix or ".pdf"
            centre_str = str(centre_id).replace("-", "")[:8]
            instance_name = f"eduos-director-{centre_str}"
            settings = get_settings()
            media_url = None
            if settings.evolution_api_url and settings.evolution_api_key:
                client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
                media_url = await _save_incoming_media_file(client, instance_name, data, ext)
            if media_url:
                message_content = f"📎 [{fname}]({media_url})\n{caption}".strip()
            else:
                message_content = f"📎 [{fname}]\n{caption}".strip()
        elif "audioMessage" in msg_obj:
            centre_str = str(centre_id).replace("-", "")[:8]
            instance_name = f"eduos-director-{centre_str}"
            settings = get_settings()
            media_url = None
            if settings.evolution_api_url and settings.evolution_api_key:
                client = EvolutionWhatsAppClient(settings.evolution_api_url, settings.evolution_api_key)
                media_url = await _save_incoming_media_file(client, instance_name, data, ".ogg")
            if media_url:
                message_content = f"🎵 [Message vocal]({media_url})"
            else:
                message_content = "🎵 [Message vocal]"
        elif "videoMessage" in msg_obj:
            message_content = "[Vidéo]"

    if not message_content or not phone_number:
        return {"status": "no_text"}
    
    contact = await repository.get_user_by_phone(pool, centre_id, phone_number)
    if not contact:
        return {"status": "unknown_contact"}
    
    await repository.save_whatsapp_message(
        pool,
        centre_id,
        contact["id"],
        "received",
        message_content,
    )
    return {"status": "received", "contact_id": str(contact["id"])}

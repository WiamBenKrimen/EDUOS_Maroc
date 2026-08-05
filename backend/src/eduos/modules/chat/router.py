from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from eduos.api.dependencies import CurrentUser, DatabasePool
from eduos.modules.chat import repository
from eduos.modules.chat.schemas import MessageInput
from eduos.modules.common import rows

router = APIRouter(prefix="/chat", tags=["Chat Interne"])


@router.get("/users")
async def list_users(pool: DatabasePool, user: CurrentUser):
    """Retourne les utilisateurs du même centre (pour choisir un interlocuteur)."""
    if user["centre_id"] is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Le chat interne n'est pas disponible pour les administrateurs globaux.",
        )
    return rows(
        await repository.list_centre_users(
            pool,
            user["centre_id"],
            user["id"],
        )
    )


@router.get("/conversations")
async def list_conversations(pool: DatabasePool, user: CurrentUser):
    """Retourne la liste des conversations actives avec dernier message et nb non-lus."""
    if user["centre_id"] is None:
        return []
    return rows(
        await repository.list_conversations(pool, user["id"], user["centre_id"])
    )


@router.get("/messages/{partner_id}")
async def get_messages(
    partner_id: UUID,
    pool: DatabasePool,
    user: CurrentUser,
    limit: int = 50,
    offset: int = 0,
):
    """Retourne l'historique des messages entre l'utilisateur courant et partner_id."""
    if user["centre_id"] is None:
        return []
    return rows(
        await repository.list_messages(
            pool,
            user["id"],
            user["centre_id"],
            partner_id,
            limit,
            offset,
        )
    )


@router.post("/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageInput,
    pool: DatabasePool,
    user: CurrentUser,
):
    """Envoie un message à un utilisateur du même centre."""
    if user["centre_id"] is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Le chat interne n'est pas disponible pour les administrateurs globaux.",
        )
    # Vérifier que le destinataire appartient au même centre
    recipient = await repository.find_user_by_id(pool, payload.recipient_id)
    if not recipient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Destinataire introuvable.")
    if str(recipient["centre_id"]) != str(user["centre_id"]):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Le destinataire n'appartient pas au même centre.",
        )
    if recipient["statut"] != "actif":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Le compte du destinataire est inactif.",
        )

    msg = await repository.send_message(
        pool,
        user["centre_id"],
        user["id"],
        payload.recipient_id,
        payload.body,
    )
    return dict(msg)


@router.patch("/messages/{partner_id}/read")
async def mark_read(
    partner_id: UUID,
    pool: DatabasePool,
    user: CurrentUser,
):
    """Marque comme lus tous les messages reçus de partner_id."""
    if user["centre_id"] is None:
        return {"updated": 0}
    updated = await repository.mark_conversation_read(
        pool,
        user["id"],
        partner_id,
        user["centre_id"],
    )
    return {"updated": updated}


@router.get("/unread-count")
async def unread_count(pool: DatabasePool, user: CurrentUser):
    """Retourne le nombre total de messages non lus (pour le badge dans la sidebar)."""
    if user["centre_id"] is None:
        return {"total": 0}
    total = await repository.count_unread(pool, user["id"], user["centre_id"])
    return {"total": total}

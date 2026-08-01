from uuid import UUID

from fastapi import APIRouter, HTTPException

from eduos.api.dependencies import DatabasePool, Director
from eduos.modules.common import rows
from eduos.modules.notifications import repository
from eduos.modules.notifications.schemas import ReminderRuleStatusInput

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

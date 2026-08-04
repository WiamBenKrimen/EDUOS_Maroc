from fastapi import APIRouter

from eduos.api.dependencies import CurrentUser, DatabasePool
from eduos.modules.auth.schemas import LoginInput
from eduos.modules.auth.service import authenticate, serialize_user

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login")
async def login(payload: LoginInput, pool: DatabasePool):
    return await authenticate(pool, str(payload.email), payload.password)


@router.get("/me")
async def me(user: CurrentUser):
    return serialize_user(user)

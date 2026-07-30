from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.security import create_token, current_user
from app.schemas.auth import LoginInput

router = APIRouter(prefix="/auth", tags=["Authentification"])


def serialize(user: asyncpg.Record) -> dict:
    return {"id": str(user["id"]), "nom": f'{user["prenom"]} {user["nom"]}', "email": user["email"],
            "role": user["role"], "personnelFonction": user["personnel_fonction"],
            "centreId": str(user["centre_id"]) if user["centre_id"] else None}


@router.post("/login")
async def login(payload: LoginInput, request: Request):
    user = await request.app.state.pool.fetchrow(
        """SELECT id, centre_id, role, personnel_fonction, nom, prenom, email
             FROM users WHERE email = $1::citext AND password_hash = crypt($2, password_hash)
             AND statut = 'actif' LIMIT 1""", str(payload.email).lower(), payload.password,
    )
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Adresse e-mail ou mot de passe incorrect.")
    await request.app.state.pool.execute("UPDATE users SET last_login_at = now() WHERE id = $1", user["id"])
    return {**serialize(user), "token": create_token(user)}


@router.get("/me")
async def me(user: Annotated[asyncpg.Record, Depends(current_user)]):
    return serialize(user)

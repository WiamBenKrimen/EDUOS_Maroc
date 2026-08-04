import asyncpg
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from eduos.core.exceptions import ConflictError, ResourceNotFoundError


async def resource_not_found(
    _: Request,
    exc: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"code": "NOT_FOUND", "detail": str(exc)},
    )


async def conflict(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={"code": "CONFLICT", "detail": str(exc)},
    )


async def unique_violation(_: Request, exc: Exception) -> JSONResponse:
    constraint = getattr(exc, "constraint_name", None) or ""
    if "email" in constraint:
        message = "Cette adresse e-mail est déjà utilisée."
    elif "code" in constraint:
        message = "Ce code existe déjà."
    else:
        message = "Un enregistrement identique existe déjà."
    return JSONResponse(
        status_code=409,
        content={"code": "CONFLICT", "detail": message},
    )


async def database_error(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "code": "DATABASE_ERROR",
            "detail": "Une erreur de base de données est survenue.",
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ResourceNotFoundError, resource_not_found)
    app.add_exception_handler(ConflictError, conflict)
    app.add_exception_handler(asyncpg.UniqueViolationError, unique_violation)
    app.add_exception_handler(asyncpg.PostgresError, database_error)

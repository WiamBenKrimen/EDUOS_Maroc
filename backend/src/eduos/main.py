from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from eduos.api.errors import register_exception_handlers
from eduos.api.router import api_router
from eduos.core.config import get_settings
from eduos.core.logging import configure_logging
from eduos.database.engine import lifespan_pool


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with lifespan_pool() as pool:
            app.state.pool = pool
            yield

    application = FastAPI(
        title="EDUOS API",
        version="1.0.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            settings.cors_origin,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_origin_regex=(
            r"http://(localhost|127\.0\.0\.1)(:\d+)?"
            if settings.environment == "development"
            else None
        ),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(application)
    application.include_router(api_router, prefix="/api")
    return application


app = create_app()

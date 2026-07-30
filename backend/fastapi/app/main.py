from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, director
from app.core.config import get_settings
from app.db import lifespan_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with lifespan_pool() as pool:
        app.state.pool = pool
        yield


settings = get_settings()
app = FastAPI(title="EDUOS API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex="http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "eduos-fastapi"}


@app.get("/api/health/db")
async def health_db():
    return {"status": "ok", "database": "postgresql"}


app.include_router(auth.router, prefix="/api")
app.include_router(director.router, prefix="/api")

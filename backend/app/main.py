import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analyze
from app.core.config import settings
from app.core.database import engine
from app.core.redis import close_redis
from app.models.db_models import Base
from app.models.schemas import HealthResponse

logger = logging.getLogger("gitpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist. Don't let a DB outage
    # (e.g. a paused Supabase free-tier project) block the app from
    # starting and serving /health.
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        logger.exception("Database unavailable at startup; continuing without table sync")
    yield
    # Shutdown: close Redis connection
    await close_redis()


app = FastAPI(
    title="GitPulse API",
    version=settings.app_version,
    description="AI-powered GitHub activity analyzer",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
    )

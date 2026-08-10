"""
Two-layer cache service.

Layer 1: Redis (fast, TTL 6h)   — key: "analysis:{username}"
Layer 2: PostgreSQL (persistent) — table: analyses (most recent row per user)
"""

import json
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis import get_redis
from app.models.db_models import User, Analysis
from app.models.schemas import ProcessedGitHubData


CACHE_KEY_PREFIX = "analysis:"


def _cache_key(username: str) -> str:
    return f"{CACHE_KEY_PREFIX}{username.lower()}"


async def get_cached(username: str, db: AsyncSession) -> ProcessedGitHubData | None:
    redis = get_redis()
    key = _cache_key(username)

    # Layer 1: Redis
    try:
        cached = await redis.get(key)
        if cached:
            return ProcessedGitHubData.model_validate_json(cached)
    except Exception:
        pass

    # Layer 2: Postgres (only if fresh enough)
    try:
        result = await db.execute(
            select(Analysis)
            .join(User, Analysis.user_id == User.id)
            .where(User.github_username == username.lower())
            .order_by(Analysis.created_at.desc())
            .limit(1)
        )
        row = result.scalar_one_or_none()
        if row and row.github_data_json:
            age = datetime.now(timezone.utc) - row.created_at.replace(tzinfo=timezone.utc)
            if age < timedelta(seconds=settings.cache_ttl_seconds):
                return ProcessedGitHubData.model_validate(row.github_data_json)
    except Exception:
        pass

    return None


async def get_historical_score_vectors(
    db: AsyncSession, exclude_username: str | None = None, limit: int = 300
) -> list[list[float]]:
    """Score vectors from prior analyses — training data for archetype clustering."""
    try:
        query = select(Analysis.scores_json).join(User, Analysis.user_id == User.id)
        if exclude_username:
            query = query.where(User.github_username != exclude_username.lower())
        query = query.order_by(Analysis.created_at.desc()).limit(limit)
        result = await db.execute(query)
        vectors = []
        for (scores_json,) in result.all():
            if not scores_json:
                continue
            vectors.append(
                [
                    scores_json.get("language_diversity_score", 0.0),
                    scores_json.get("commit_consistency_score", 0.0),
                    scores_json.get("project_depth_score", 0.0),
                    scores_json.get("collaboration_index", 0.0),
                    scores_json.get("activity_recency_score", 0.0),
                ]
            )
        return vectors
    except Exception:
        return []


async def set_cached(
    username: str,
    avatar_url: str,
    data: ProcessedGitHubData,
    analysis_text: str,
    db: AsyncSession,
) -> None:
    # Layer 1: Redis
    try:
        redis = get_redis()
        await redis.set(_cache_key(username), data.model_dump_json(), ex=settings.cache_ttl_seconds)
    except Exception:
        pass

    # Layer 2: Postgres
    try:
        result = await db.execute(
            select(User).where(User.github_username == username.lower())
        )
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                github_username=username.lower(),
                avatar_url=avatar_url,
                profile_json=data.user.model_dump(),
                last_fetched_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.flush()
        else:
            user.avatar_url = avatar_url
            user.last_fetched_at = datetime.now(timezone.utc)

        analysis = Analysis(
            user_id=user.id,
            analysis_text=analysis_text,
            scores_json=data.scores.model_dump(),
            github_data_json=data.model_dump(),
        )
        db.add(analysis)
        await db.commit()
    except Exception:
        await db.rollback()

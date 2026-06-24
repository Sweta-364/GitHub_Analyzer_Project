"""
/api/analyze/stream  — Server-Sent Events endpoint
"""

import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.schemas import ProcessedGitHubData, DeveloperScores
from app.services import cache_service, claude_service, github_service
from app.utils import scoring

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


async def event_stream(
    username: str,
    force: bool,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    # 1. Check cache
    if not force:
        cached = await cache_service.get_cached(username, db)
        if cached:
            yield f'data: {{"type": "cached", "payload": "true"}}\n\n'
            yield f"data: {{\"type\": \"data\", \"payload\": {cached.model_dump_json()}}}\n\n"
            async for chunk in claude_service.stream_analysis(cached):
                yield chunk
            yield 'data: {"type": "done", "payload": ""}\n\n'
            return

    # 2. Fetch GitHub data
    try:
        raw = await github_service.fetch_all_data(username)
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'payload': str(e)})}\n\n"
        return

    # 3. Build aggregate language bytes
    languages_by_bytes: dict[str, int] = {}
    for lang_map in raw["languages_by_repo"].values():
        for lang, b in lang_map.items():
            languages_by_bytes[lang] = languages_by_bytes.get(lang, 0) + b

    # Weekly commits list for consistency score
    weekly_activity = github_service.build_weekly_activity(raw["events"])
    weekly_commits = [w.commits for w in weekly_activity]

    # 4. Compute scores
    scores_dict = scoring.build_scores(
        languages_by_bytes=languages_by_bytes,
        weekly_commits=weekly_commits,
        repos=raw["repos"],
        events=raw["events"],
        username=username,
    )

    current_streak, longest_streak = scoring.compute_streaks(raw["events"])

    total_commits_90d = sum(w.commits for w in weekly_activity[-13:])
    total_prs_90d = sum(
        1 for e in raw["events"] if e.get("type") == "PullRequestEvent"
    )

    processed = ProcessedGitHubData(
        user=raw["user"],
        top_repos=github_service.build_top_repos(raw["repos"]),
        languages=github_service.aggregate_languages(raw["languages_by_repo"]),
        weekly_activity=weekly_activity,
        scores=DeveloperScores(**scores_dict),
        total_commits_90d=total_commits_90d,
        total_prs_90d=total_prs_90d,
        current_streak_days=current_streak,
        longest_streak_days=longest_streak,
    )

    # 5. Send data event
    yield f"data: {{\"type\": \"data\", \"payload\": {processed.model_dump_json()}}}\n\n"

    # 6. Stream Claude analysis
    full_text = ""
    async for chunk in claude_service.stream_analysis(processed):
        yield chunk
        # Extract token payload for accumulation
        if chunk.startswith('data: '):
            try:
                parsed = json.loads(chunk[6:].strip())
                if parsed.get("type") == "token":
                    full_text += parsed.get("payload", "")
            except (json.JSONDecodeError, KeyError):
                pass

    # 7. Background cache save
    asyncio.create_task(
        cache_service.set_cached(
            username=username,
            avatar_url=processed.user.avatar_url,
            data=processed,
            analysis_text=full_text,
            db=db,
        )
    )

    yield 'data: {"type": "done", "payload": ""}\n\n'


@router.get("/stream")
async def analyze_stream(
    username: str = Query(min_length=1, max_length=64),
    force: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    return StreamingResponse(
        event_stream(username, force, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

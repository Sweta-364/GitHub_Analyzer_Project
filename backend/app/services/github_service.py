"""
GitHub data fetching service.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx

from app.core.config import settings
from app.models.schemas import GitHubUser, RepoSummary, LanguageStat, WeeklyActivity


GITHUB_API = "https://api.github.com"

LANGUAGE_COLORS: dict[str, str] = {
    "Python": "#3572A5",
    "TypeScript": "#2b7489",
    "JavaScript": "#f1e05a",
    "Rust": "#dea584",
    "Go": "#00ADD8",
    "Java": "#b07219",
    "C++": "#f34b7d",
    "C": "#555555",
    "Ruby": "#701516",
    "Swift": "#F05138",
    "Kotlin": "#A97BFF",
    "Shell": "#89e051",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Dart": "#00B4AB",
    "PHP": "#4F5D95",
}


def _headers() -> dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        h["Authorization"] = f"Bearer {settings.github_token}"
    return h


async def fetch_user(client: httpx.AsyncClient, username: str) -> GitHubUser:
    resp = await client.get(f"{GITHUB_API}/users/{username}")
    resp.raise_for_status()
    return GitHubUser(**resp.json())


async def fetch_repos(client: httpx.AsyncClient, username: str) -> list[dict[str, Any]]:
    repos: list[dict[str, Any]] = []
    page = 1
    while True:
        resp = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"sort": "pushed", "per_page": 100, "page": page},
        )
        resp.raise_for_status()
        batch = resp.json()
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
        if page > 3:  # cap at 300 repos
            break
    return repos


async def fetch_repo_languages(
    client: httpx.AsyncClient, full_name: str
) -> dict[str, int]:
    resp = await client.get(f"{GITHUB_API}/repos/{full_name}/languages")
    resp.raise_for_status()
    return resp.json()


async def fetch_events(client: httpx.AsyncClient, username: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for page in range(1, 4):
        resp = await client.get(
            f"{GITHUB_API}/users/{username}/events/public",
            params={"per_page": 100, "page": page},
        )
        resp.raise_for_status()
        batch = resp.json()
        events.extend(batch)
        if len(batch) < 100:
            break
    return events


async def fetch_all_data(username: str) -> dict[str, Any]:
    async with httpx.AsyncClient(headers=_headers(), timeout=20.0) as client:
        user_data, repos_data, events_data = await asyncio.gather(
            fetch_user(client, username),
            fetch_repos(client, username),
            fetch_events(client, username),
        )

        top_repos = repos_data[:10]
        lang_tasks = [fetch_repo_languages(client, r["full_name"]) for r in top_repos]
        lang_results = await asyncio.gather(*lang_tasks, return_exceptions=True)

        languages_by_repo: dict[str, dict[str, int]] = {}
        for repo, result in zip(top_repos, lang_results):
            if isinstance(result, dict):
                languages_by_repo[repo["full_name"]] = result

    return {
        "user": user_data,
        "repos": repos_data,
        "events": events_data,
        "languages_by_repo": languages_by_repo,
    }


def aggregate_languages(
    languages_by_repo: dict[str, dict[str, int]]
) -> list[LanguageStat]:
    totals: dict[str, int] = {}
    for lang_map in languages_by_repo.values():
        for lang, bytes_count in lang_map.items():
            totals[lang] = totals.get(lang, 0) + bytes_count

    total_bytes = sum(totals.values())
    if total_bytes == 0:
        return []

    stats = [
        LanguageStat(
            name=lang,
            bytes=b,
            percentage=round(b / total_bytes * 100, 2),
            color=LANGUAGE_COLORS.get(lang, "#8b949e"),
        )
        for lang, b in totals.items()
    ]
    return sorted(stats, key=lambda s: s.bytes, reverse=True)


def build_weekly_activity(events: list[dict[str, Any]]) -> list[WeeklyActivity]:
    from collections import defaultdict

    weeks: dict[str, dict[str, int]] = defaultdict(lambda: {"commits": 0, "prs": 0, "issues": 0})

    for event in events:
        try:
            created = datetime.fromisoformat(event["created_at"].replace("Z", "+00:00"))
        except (KeyError, ValueError):
            continue

        # ISO week start (Monday)
        week_start = created - timedelta(days=created.weekday())
        week_key = week_start.strftime("%Y-%m-%d")

        etype = event.get("type", "")
        if etype == "PushEvent":
            commits = len(event.get("payload", {}).get("commits", []))
            weeks[week_key]["commits"] += max(commits, 1)
        elif etype == "PullRequestEvent":
            weeks[week_key]["prs"] += 1
        elif etype == "IssuesEvent":
            weeks[week_key]["issues"] += 1

    # Return last 12 weeks
    now = datetime.now(timezone.utc)
    result = []
    for i in range(11, -1, -1):
        week_dt = now - timedelta(weeks=i)
        week_start = week_dt - timedelta(days=week_dt.weekday())
        week_key = week_start.strftime("%Y-%m-%d")
        w = weeks.get(week_key, {"commits": 0, "prs": 0, "issues": 0})
        result.append(WeeklyActivity(week=week_key, **w))

    return result


def build_top_repos(repos: list[dict[str, Any]]) -> list[RepoSummary]:
    def repo_score(r: dict[str, Any]) -> float:
        stars = r.get("stargazers_count", 0)
        pushed = r.get("pushed_at") or ""
        recency = 0.0
        if pushed:
            try:
                dt = datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                days_ago = (datetime.now(timezone.utc) - dt).days
                recency = max(0, 1 - days_ago / 365)
            except ValueError:
                pass
        return stars * 0.7 + recency * 3

    sorted_repos = sorted(repos, key=repo_score, reverse=True)[:8]

    return [
        RepoSummary(
            name=r["name"],
            language=r.get("language"),
            stars=r.get("stargazers_count", 0),
            commits=r.get("size", 0),  # size as proxy; real commit count needs another API call
            last_push=r.get("pushed_at", ""),
            url=r.get("html_url", ""),
        )
        for r in sorted_repos
    ]

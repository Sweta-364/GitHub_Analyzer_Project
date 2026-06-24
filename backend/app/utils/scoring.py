"""
Developer scoring pipeline.

Each function takes raw GitHub data and returns a float 0.0–10.0.
"""

import math
import statistics
from datetime import datetime, timezone
from typing import Any


def language_diversity_score(languages_by_bytes: dict[str, int]) -> float:
    if not languages_by_bytes:
        return 0.0

    total = sum(languages_by_bytes.values())
    if total == 0:
        return 0.0

    proportions = [b / total for b in languages_by_bytes.values() if b > 0]
    entropy = -sum(p * math.log2(p) for p in proportions)
    max_langs = min(len(proportions), 8)
    max_entropy = math.log2(max_langs) if max_langs > 1 else 1.0
    normalized = entropy / max_entropy if max_entropy > 0 else 0.0
    return round(min(normalized * 10, 10.0), 2)


def commit_consistency_score(weekly_commits: list[int]) -> float:
    if not weekly_commits:
        return 0.0

    total_weeks = len(weekly_commits)
    zero_weeks = weekly_commits.count(0)
    # Allow up to 4 zero weeks without penalty
    effective_zeros = max(0, zero_weeks - 4)
    active_weeks = [c for c in weekly_commits if c > 0]
    active_ratio = len(active_weeks) / total_weeks if total_weeks > 0 else 0.0

    if not active_weeks:
        return 0.0

    mean = statistics.mean(active_weeks)
    if len(active_weeks) > 1 and mean > 0:
        std = statistics.stdev(active_weeks)
        cv = std / mean
    else:
        cv = 0.0

    score = (1 - min(cv, 1.0)) * 6 + active_ratio * 4
    return round(max(0.0, min(score, 10.0)), 2)


def project_depth_score(repos: list[dict[str, Any]]) -> float:
    if not repos:
        return 0.0

    def depth(r: dict[str, Any]) -> int:
        points = 0
        if r.get("stargazers_count", 0) > 10:
            points += 1
        if r.get("size", 0) > 100 or r.get("watchers_count", 0) > 0:
            points += 1
        if r.get("open_issues_count", 0) > 0:
            points += 1
        if r.get("topics"):
            points += 1
        if not r.get("fork", True):
            points += 1
        return points

    scores = [depth(r) for r in repos]
    avg = sum(scores) / len(scores)
    normalized = (avg / 5) * 10

    # Bonus for prolific output
    if len(repos) >= 10:
        normalized = min(normalized + 0.5, 10.0)

    return round(min(normalized, 10.0), 2)


def collaboration_index(events: list[dict[str, Any]], username: str) -> float:
    points = 0.0
    for event in events:
        repo_owner = event.get("repo", {}).get("name", "").split("/")[0]
        if repo_owner.lower() == username.lower():
            continue
        etype = event.get("type", "")
        if etype == "PullRequestEvent":
            points += 3
        elif etype == "IssueCommentEvent":
            points += 1
        elif etype == "ForkEvent":
            points += 0.5

    return round(min(points / 30 * 10, 10.0), 2)


def activity_recency_score(events: list[dict[str, Any]]) -> float:
    if not events:
        return 0.0

    now = datetime.now(timezone.utc)
    total_weight = 0.0

    for event in events:
        try:
            created = datetime.fromisoformat(
                event["created_at"].replace("Z", "+00:00")
            )
        except (KeyError, ValueError):
            continue
        days_ago = (now - created).days
        total_weight += math.exp(-days_ago / 30)

    return round(min(total_weight / 50 * 10, 10.0), 2)


def compute_streaks(events: list[dict[str, Any]]) -> tuple[int, int]:
    from datetime import date, timedelta

    push_dates: set[date] = set()
    for event in events:
        if event.get("type") != "PushEvent":
            continue
        try:
            created = datetime.fromisoformat(
                event["created_at"].replace("Z", "+00:00")
            )
            push_dates.add(created.date())
        except (KeyError, ValueError):
            continue

    if not push_dates:
        return (0, 0)

    sorted_dates = sorted(push_dates, reverse=True)
    today = datetime.now(timezone.utc).date()

    # Current streak (from today or yesterday)
    current = 0
    check = today
    if sorted_dates[0] >= check - timedelta(days=1):
        for d in sorted_dates:
            if d == check or d == check - timedelta(days=1):
                check = d
                current += 1
            elif d < check - timedelta(days=1):
                break

    # Longest streak
    longest = 0
    streak = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i - 1] - sorted_dates[i]).days == 1:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 1
    longest = max(longest, streak, current)

    return (current, longest)


def build_scores(
    languages_by_bytes: dict[str, int],
    weekly_commits: list[int],
    repos: list[dict[str, Any]],
    events: list[dict[str, Any]],
    username: str,
) -> dict[str, float]:
    ld = language_diversity_score(languages_by_bytes)
    cc = commit_consistency_score(weekly_commits)
    pd = project_depth_score(repos)
    ci = collaboration_index(events, username)
    ar = activity_recency_score(events)

    overall = cc * 0.30 + ar * 0.25 + pd * 0.20 + ld * 0.15 + ci * 0.10

    return {
        "language_diversity_score": ld,
        "commit_consistency_score": cc,
        "project_depth_score": pd,
        "collaboration_index": ci,
        "activity_recency_score": ar,
        "overall_score": round(overall, 2),
    }

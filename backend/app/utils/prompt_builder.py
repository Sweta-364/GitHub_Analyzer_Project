"""
Builds the structured prompt sent to Claude for developer analysis.
"""

from app.models.schemas import ProcessedGitHubData


SYSTEM_PROMPT = """You are a senior developer career coach who specializes in giving
developers data-driven, honest assessments of their GitHub activity. You are direct,
specific, and always tie your observations to concrete evidence from the data provided.
You never give generic advice — every recommendation references the developer's
actual patterns.

Format your response in clear sections using markdown headers (##).
Be encouraging but honest. If scores are low, explain why and give specific next steps."""


def _score_interpretation(score: float) -> str:
    if score >= 8:
        return "excellent"
    elif score >= 6:
        return "good"
    elif score >= 4:
        return "moderate"
    else:
        return "needs improvement"


def build_analysis_prompt(data: ProcessedGitHubData) -> str:
    s = data.scores
    u = data.user

    top_languages = "\n".join(
        f"  - {lang.name}: {lang.percentage:.1f}%"
        for lang in data.languages[:5]
    )

    top_repos = "\n".join(
        f"  - {repo.name} ({repo.language or 'unknown'}): {repo.stars} stars, last pushed {repo.last_push[:10]}"
        for repo in data.top_repos[:5]
    )

    activity_summary = ""
    for w in data.weekly_activity[-8:]:
        activity_summary += f"  - Week of {w.week}: {w.commits} commits, {w.prs} PRs\n"

    prompt = f"""## Developer Profile: {u.login}

**Computed Scores** (each 0–10):
- Language Diversity: {s.language_diversity_score:.1f} — {_score_interpretation(s.language_diversity_score)}
- Commit Consistency: {s.commit_consistency_score:.1f} — {_score_interpretation(s.commit_consistency_score)}
- Project Depth: {s.project_depth_score:.1f} — {_score_interpretation(s.project_depth_score)}
- Collaboration Index: {s.collaboration_index:.1f} — {_score_interpretation(s.collaboration_index)}
- Activity Recency: {s.activity_recency_score:.1f} — {_score_interpretation(s.activity_recency_score)}
- Overall Score: {s.overall_score:.1f}

**Key Stats:**
- Public repos: {u.public_repos}, Followers: {u.followers}
- Commits last 90 days: {data.total_commits_90d}
- Current streak: {data.current_streak_days} days, Longest streak: {data.longest_streak_days} days
- Total PRs (90d): {data.total_prs_90d}

**Top Languages (by bytes):**
{top_languages}

**Top Repositories:**
{top_repos}

**Recent Activity Pattern (last 8 weeks):**
{activity_summary}
---

Based on this data, provide:

## 1. Coding personality summary
(3–4 sentences capturing their unique dev style based on the patterns above)

## 2. Strongest technical skills
(3 specific skills with evidence from the data)

## 3. Top 3 skill gaps with learning path
(specific, actionable — reference actual gaps visible in the data)

## 4. Consistency & growth assessment
(honest evaluation with a forward-looking recommendation)

## 5. The observation they don't know about themselves
(one non-obvious insight from the data patterns)"""

    return prompt

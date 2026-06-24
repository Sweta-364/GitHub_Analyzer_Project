from datetime import datetime
from pydantic import BaseModel, Field


# ── GitHub types ──────────────────────────────────────────────────────────────

class GitHubUser(BaseModel):
    login: str
    id: int
    avatar_url: str
    name: str | None = None
    bio: str | None = None
    company: str | None = None
    location: str | None = None
    blog: str | None = None
    public_repos: int = 0
    public_gists: int = 0
    followers: int = 0
    following: int = 0
    created_at: str
    updated_at: str


class RepoSummary(BaseModel):
    name: str
    language: str | None = None
    stars: int = 0
    commits: int = 0
    last_push: str
    url: str


class LanguageStat(BaseModel):
    name: str
    bytes: int
    percentage: float
    color: str = "#8b949e"


class WeeklyActivity(BaseModel):
    week: str          # ISO date string (week start)
    commits: int = 0
    prs: int = 0
    issues: int = 0


# ── Scores ────────────────────────────────────────────────────────────────────

class DeveloperScores(BaseModel):
    language_diversity_score: float = Field(ge=0, le=10)
    commit_consistency_score: float = Field(ge=0, le=10)
    project_depth_score: float = Field(ge=0, le=10)
    collaboration_index: float = Field(ge=0, le=10)
    activity_recency_score: float = Field(ge=0, le=10)
    overall_score: float = Field(ge=0, le=10)


# ── Processed output ──────────────────────────────────────────────────────────

class ProcessedGitHubData(BaseModel):
    user: GitHubUser
    top_repos: list[RepoSummary]
    languages: list[LanguageStat]
    weekly_activity: list[WeeklyActivity]
    scores: DeveloperScores
    total_commits_90d: int = 0
    total_prs_90d: int = 0
    longest_streak_days: int = 0
    current_streak_days: int = 0


# ── API schemas ───────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    force_refresh: bool = False


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    timestamp: datetime

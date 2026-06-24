// ── GitHub raw types ──────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  fork: boolean
}

export interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: Record<string, unknown>
}

// ── Computed developer scores ─────────────────────────────────────────────────

export interface DeveloperScores {
  language_diversity_score: number    // 0–10
  commit_consistency_score: number    // 0–10
  project_depth_score: number         // 0–10
  collaboration_index: number         // 0–10
  activity_recency_score: number      // 0–10
  overall_score: number               // weighted average
}

// ── Analysis data returned from the backend ───────────────────────────────────

export interface LanguageStat {
  name: string
  bytes: number
  percentage: number
  color: string        // hex color for the language
}

export interface WeeklyActivity {
  week: string         // ISO date string for week start
  commits: number
  prs: number
  issues: number
}

export interface RepoSummary {
  name: string
  language: string | null
  stars: number
  commits: number
  last_push: string
  url: string
}

export interface ProcessedGitHubData {
  user: GitHubUser
  top_repos: RepoSummary[]
  languages: LanguageStat[]
  weekly_activity: WeeklyActivity[]
  scores: DeveloperScores
  total_commits_90d: number
  total_prs_90d: number
  longest_streak_days: number
  current_streak_days: number
}

// ── API request / response shapes ─────────────────────────────────────────────

export interface AnalyzeRequest {
  username: string
  force_refresh?: boolean
}

export interface AnalyzeResponse {
  cached: boolean
  data: ProcessedGitHubData
  // analysis_text is streamed separately via SSE
}

export interface HealthResponse {
  status: 'ok'
  version: string
}

// ── SSE streaming event types ─────────────────────────────────────────────────

export type StreamEventType =
  | 'data'          // ProcessedGitHubData JSON, sent first
  | 'token'         // Claude analysis text chunk
  | 'done'          // stream complete
  | 'error'         // error message string
  | 'cached'        // served from cache

export interface StreamEvent {
  type: StreamEventType
  payload: string | ProcessedGitHubData
}

// ── Frontend UI state ─────────────────────────────────────────────────────────

export type AnalysisStatus =
  | 'idle'
  | 'fetching_github'
  | 'processing'
  | 'streaming_analysis'
  | 'complete'
  | 'error'

export interface AnalysisState {
  status: AnalysisStatus
  username: string
  githubData: ProcessedGitHubData | null
  analysisText: string          // accumulated Claude stream
  error: string | null
  cached: boolean
}

// ── Chart data helpers ────────────────────────────────────────────────────────

export interface ChartLanguage {
  name: string
  value: number
  color: string
}

export interface ChartActivity {
  date: string
  commits: number
  prs: number
}

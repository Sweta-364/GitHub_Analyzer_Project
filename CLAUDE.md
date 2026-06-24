# GitPulse — Claude Code Instructions

## What This Is
AI-powered GitHub activity analyzer. User enters a GitHub username → app fetches
their GitHub data → computes 5 developer scores → streams a Claude-generated
analysis with skill gaps and recommendations.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend**: FastAPI (Python 3.11+) + SQLAlchemy (async) + asyncpg
- **Database**: PostgreSQL via Supabase (free tier)
- **Cache**: Redis via Upstash (free tier)
- **AI**: Anthropic Claude API, streaming SSE
- **Deploy**: Vercel (frontend) + Railway or Render (backend)

## Local Dev (No Docker)

### Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your keys
uvicorn app.main:app --reload --port 8000
```

You need a local Postgres instance OR just point DATABASE_URL at your Supabase
connection string from day 1 (Supabase free tier works fine for dev).

## Environment Variables

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000
```

### backend/.env  (copy from .env.example)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
REDIS_URL=rediss://default:token@host.upstash.io:6379
GITHUB_TOKEN=ghp_xxxx          # optional — raises rate limit 60→5000/hr
ANTHROPIC_API_KEY=sk-ant-xxxx
ALLOWED_ORIGINS=http://localhost:5173
```

## Architecture

```
User → React UI
         │  POST /analyze
         ▼
      FastAPI
         ├─ Check Redis cache (6h TTL)
         ├─ Check Postgres cache
         ├─ [miss] → GitHub API (parallel asyncio.gather)
         ├─ Data pipeline → 5 scores
         ├─ Prompt builder
         └─ Claude API → SSE stream → React
```

## Five Developer Scores (backend/app/utils/scoring.py)
All return float 0.0–10.0, fed into the Claude prompt as structured context.

1. `language_diversity_score` — weighted spread across languages used
2. `commit_consistency_score` — inverse std dev of weekly commit counts
3. `project_depth_score` — ratio of repos with >10 commits + issues + PRs
4. `collaboration_index` — external PRs + issue comments on other repos
5. `activity_recency_score` — exponential decay weighting on recent events

## Caching Strategy
- Redis first (fast, 6h TTL), key: `analysis:{username}`
- Postgres second (persistent), table: `analyses`
- Force refresh: `?force=true` query param
- Store after streaming completes (async background task)

## Database Tables
- `users` — github_username, avatar_url, profile_json, last_fetched_at
- `analyses` — user_id FK, analysis_text, scores_json, created_at

## What's Pre-built in This Scaffold
- [x] Full directory structure
- [x] All TypeScript types/interfaces
- [x] React Router v6 routing
- [x] All page layouts and component shells with placeholder UI
- [x] Zustand store skeleton
- [x] Axios API client + SSE hook stubs
- [x] FastAPI app, CORS, lifespan, health endpoint
- [x] All API route stubs with correct signatures
- [x] Pydantic request/response models
- [x] SQLAlchemy async models
- [x] All service skeletons (GitHub, Claude, cache)
- [x] Scoring utility stubs with docstrings
- [x] Prompt builder skeleton
- [x] Alembic migration setup
- [x] requirements.txt, package.json, tsconfig, vite.config, tailwind

## What You Implement in Claude Code
- [ ] GitHub API calls in `backend/app/services/github_service.py`
- [ ] Scoring functions in `backend/app/utils/scoring.py`
- [ ] Prompt builder in `backend/app/utils/prompt_builder.py`
- [ ] Claude SSE streaming in `backend/app/services/claude_service.py`
- [ ] Cache read/write in `backend/app/services/cache_service.py`
- [ ] Wire the `/analyze` endpoint end-to-end in `backend/app/api/analyze.py`
- [ ] Recharts visualizations in `frontend/src/components/dashboard/`
- [ ] SSE consumer in `frontend/src/hooks/useAnalysis.ts`
- [ ] Error states and loading skeletons throughout
- [ ] Alembic migration: `alembic revision --autogenerate -m "init"`
- [ ] Set prod env vars and deploy

## Code Conventions
- Python: Black, type hints everywhere, async/await throughout, no sync DB calls
- TypeScript: strict mode, no `any`, explicit return types
- Components: functional only, logic in hooks
- Naming: PascalCase components, camelCase functions/vars

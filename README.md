# GitPulse — AI GitHub Activity Analyzer

> Enter any GitHub username → get an AI-powered deep dive into coding patterns, language trends, consistency scores, and personalized skill-gap recommendations powered by Claude.

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- Python 3.11+
- A PostgreSQL database (Supabase free tier works great)
- An Upstash Redis instance (free tier)
- GitHub personal access token (optional but recommended)
- Anthropic API key

---

### 1. Clone & set up frontend

```bash
cd frontend
npm install
cp .env .env.local      # already has defaults for localhost
npm run dev             # → http://localhost:5173
```

---

### 2. Set up backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` with your real values:
```
DATABASE_URL=postgresql+asyncpg://...   # Supabase connection string
REDIS_URL=rediss://...                  # Upstash Redis URL
GITHUB_TOKEN=ghp_...                    # Optional — raises API limit 60→5000/hr
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:5173
```

---

### 3. Run database migrations

```bash
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

### 4. Start the backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API is now live at http://localhost:8000  
Health check: http://localhost:8000/health

---

## Project Structure

```
github-analyzer/
├── CLAUDE.md                   ← Claude Code instructions (start here)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             ← Button, Card, Badge, Skeleton, Navbar
│   │   │   ├── landing/        ← Hero, Features
│   │   │   └── dashboard/      ← ProfileHeader, ScoreCards, charts, AnalysisPanel
│   │   ├── pages/              ← LandingPage, DashboardPage, NotFoundPage
│   │   ├── hooks/              ← useAnalysis (SSE consumer)
│   │   ├── services/           ← axios API client
│   │   ├── store/              ← Zustand analysis state
│   │   ├── types/              ← All TypeScript types
│   │   └── utils/              ← helpers (cn, formatNumber, scoreColor, etc.)
│   └── ...config files
└── backend/
    ├── app/
    │   ├── main.py             ← FastAPI app, CORS, lifespan
    │   ├── api/
    │   │   └── analyze.py      ← GET /api/analyze/stream (SSE endpoint)
    │   ├── services/
    │   │   ├── github_service.py  ← GitHub API fetching (implement me)
    │   │   ├── claude_service.py  ← Claude streaming (implement me)
    │   │   └── cache_service.py   ← Redis + Postgres cache (implement me)
    │   ├── models/
    │   │   ├── db_models.py    ← SQLAlchemy User + Analysis tables
    │   │   └── schemas.py      ← Pydantic request/response models
    │   ├── core/
    │   │   ├── config.py       ← Settings from .env
    │   │   ├── database.py     ← Async SQLAlchemy engine
    │   │   └── redis.py        ← Redis client
    │   └── utils/
    │       ├── scoring.py      ← 5 developer score functions (implement me)
    │       └── prompt_builder.py ← Claude prompt assembly (implement me)
    ├── alembic/                ← Database migrations
    ├── requirements.txt
    └── Procfile                ← For Railway/Render deployment
```

---

## Deployment (All Free)

| Service | What | Free Tier |
|---------|------|-----------|
| **Vercel** | Frontend | Unlimited, 100GB bandwidth |
| **Railway** | FastAPI backend | $5/mo credit (resets monthly) |
| **Render** | FastAPI backend (alt) | 750 hrs/mo, spins down on idle |
| **Supabase** | PostgreSQL | 500MB, 2 projects |
| **Upstash** | Redis | 10k commands/day |

### Deploy frontend → Vercel
1. Push to GitHub
2. Import repo in Vercel → set root to `frontend`
3. Set env var: `VITE_API_BASE_URL=https://your-backend.railway.app`
4. Deploy

### Deploy backend → Railway
1. New Project → Deploy from GitHub repo
2. Set root directory to `backend`
3. Add all env vars from `.env.example`
4. Railway auto-detects Python and uses `Procfile`

### Deploy backend → Render (alternative)
1. New Web Service → connect repo → root dir `backend`
2. Build command: `pip install -r requirements.txt`  
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add env vars

---

## What's Implemented vs What Needs Work

### ✅ Done (scaffold)
- Full directory structure and routing
- All TypeScript types
- React pages: Landing, Dashboard, 404
- UI components: Button, Card, Badge, Skeleton, Navbar
- Landing page: Hero with search, Features grid
- Dashboard: ProfileHeader, ScoreCards (with ring viz), TopRepos, AnalysisPanel
- Zustand store for analysis state
- FastAPI app with CORS, health endpoint, SSE route stub
- All Pydantic + SQLAlchemy models
- Alembic migration setup

### 🔧 Implement in Claude Code
- `backend/app/services/github_service.py` — GitHub API calls
- `backend/app/utils/scoring.py` — 5 developer score functions
- `backend/app/utils/prompt_builder.py` — Claude prompt builder
- `backend/app/services/claude_service.py` — Claude SSE streaming
- `backend/app/services/cache_service.py` — Redis + Postgres cache
- `backend/app/api/analyze.py` — wire the full pipeline
- `frontend/src/hooks/useAnalysis.ts` — SSE consumer
- `frontend/src/components/dashboard/LanguageChart.tsx` — Recharts donut
- `frontend/src/components/dashboard/ActivityChart.tsx` — Recharts bar

---

## API Reference

### `GET /api/analyze/stream?username={username}&force={bool}`
SSE stream. Connect with `EventSource`.

**Events emitted:**
```
data: {"type": "data",  "payload": "<ProcessedGitHubData JSON>"}
data: {"type": "token", "payload": "<Claude text chunk>"}
data: {"type": "done",  "payload": ""}
data: {"type": "error", "payload": "<error message>"}
```

### `GET /health`
```json
{ "status": "ok", "version": "0.1.0", "timestamp": "..." }
```

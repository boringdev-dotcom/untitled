# Agents

## Cursor Cloud specific instructions

### Architecture overview

This is a multi-agent scripture discussion platform with two services:

- **Backend** (`backend/`): Python 3.12 + FastAPI, managed by `uv`. Serves REST API (SSE) and WebSocket on port 8000.
- **Frontend** (`frontend/`): React 19 + Vite + TypeScript + Tailwind CSS. Dev server on port 5173; proxies `/api` and `/ws` to backend.
- **Database**: PostgreSQL 16 with pgvector extension. The `DATABASE_URL` env var points to the configured database (may be remote).

### Required environment variables

- `GEMINI_API_KEY` — Google Gemini API key (must be valid / not expired)
- `DATABASE_URL` — PostgreSQL connection string (the backend also reads from `backend/.env`)

The backend reads `.env` from its working directory (`backend/.env`). If `DATABASE_URL` or `GEMINI_API_KEY` are set as environment variables, they override values in `.env`.

### Starting services

1. **PostgreSQL**: `pg_ctlcluster 16 main start` (only needed if using a local database)
2. **Backend**: `cd backend && uv run council` (starts uvicorn on port 8000 with hot-reload)
3. **Frontend**: `cd frontend && npm run dev` (starts Vite dev server on port 5173)

### Lint / type-check / build

- **Frontend lint**: `cd frontend && npx eslint .` (has pre-existing warnings/errors in the repo)
- **Frontend type-check**: `cd frontend && npx tsc -b --noEmit`
- **Frontend build**: `cd frontend && npm run build`
- **Backend**: No linter or test suite is configured in the repo.

### Gotchas

- Node.js is available via nvm at `/home/ubuntu/.nvm/versions/node/v22.22.2/bin/`. Ensure this is on `PATH`.
- `uv` is installed at `$HOME/.local/bin/uv`. Ensure `$HOME/.local/bin` is on `PATH`.
- The backend uses `pydantic-settings` with `env_file = ".env"`. The CWD must be `backend/` when running `uv run council` for the `.env` to be found.
- The backend's `init_db()` runs on FastAPI startup and creates tables + pgvector extension automatically.
- Scripture data must be ingested once via `cd backend && uv run download-scriptures && uv run ingest` before the council can answer questions. If using the production database, data is already ingested.

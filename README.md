# Council of Faiths

Multi-agent scripture discussion platform. AI agents representing five world religions discuss philosophical questions, each grounded exclusively in their sacred scriptures via RAG (Retrieval-Augmented Generation).

## Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python (UV) + FastAPI + Google GenAI SDK (Gemini)
- **Vector DB**: PostgreSQL + pgvector
- **Embeddings**: Gemini embedding-001

## Faiths

| Faith | Agent Name | Scripture |
|-------|-----------|-----------|
| Hinduism | Rishi | Bhagavad Gita, Upanishads |
| Islam | Sheikh | Quran |
| Christianity | Father Thomas | Bible (KJV) |
| Buddhism | Bhikkhu | Dhammapada |
| Judaism | Rabbi | Torah / Tanakh |

## Setup

### Prerequisites

- Python 3.12+
- [UV](https://docs.astral.sh/uv/) (Python package manager)
- Node.js 20+
- PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension
- Google Gemini API key

### 1. Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your GEMINI_API_KEY and DATABASE_URL
```

### 2. Backend

```bash
cd backend
uv sync
```

### 3. Download Scriptures

```bash
cd backend
uv run download-scriptures
```

### 4. Ingest into Vector DB

```bash
cd backend
uv run ingest
```

### 5. Start Backend

```bash
cd backend
uv run council
```

The API runs on `http://localhost:8000`.

### 6. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` to the backend.

## Discussion Flow

1. **Phase 1 — Initial Opinions**: Each scholar independently answers the question, citing their scriptures
2. **Phase 2 — Cross-Examination**: Each scholar reviews the others' opinions, agreeing and disagreeing
3. **Phase 3 — Final Synthesis**: An impartial moderator produces a balanced report

## API

### `POST /api/council/ask`

Request body:
```json
{
  "question": "What is the meaning of suffering?",
  "faiths": ["hinduism", "islam", "christianity", "buddhism", "judaism"]
}
```

Returns a Server-Sent Events stream of `CouncilEvent` objects.

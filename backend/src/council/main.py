from __future__ import annotations

import json
from collections.abc import Iterator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from council.council import CouncilOrchestrator
from council.db import close_db, init_db
from council.schemas import CouncilEvent, QuestionRequest

app = FastAPI(title="Council of Faiths", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.on_event("shutdown")
def on_shutdown() -> None:
    close_db()


def _event_stream(question: str, faiths=None) -> Iterator[dict]:
    orchestrator = CouncilOrchestrator(faiths=faiths)
    for event in orchestrator.run_session(question):
        yield {
            "event": event.phase,
            "data": event.model_dump_json(),
        }


@app.post("/api/council/ask")
async def ask_council(request: QuestionRequest):
    return EventSourceResponse(
        _event_stream(request.question, request.faiths)
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}


def run() -> None:
    uvicorn.run("council.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()

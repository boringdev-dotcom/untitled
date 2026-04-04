from __future__ import annotations

import json
from collections.abc import Iterator

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from council.council import CouncilOrchestrator
from council.db import close_db, create_session, init_db, load_session, update_session_events
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
    faith_names = [f.value if hasattr(f, "value") else f for f in faiths] if faiths else []
    session_id = create_session(question, faith_names)

    saved_event = CouncilEvent(
        phase="session_saved",
        content="",
        session_id=session_id,
    )
    yield {
        "event": "session_saved",
        "data": saved_event.model_dump_json(),
    }

    orchestrator = CouncilOrchestrator(faiths=faiths)
    collected: list[dict] = []

    for event in orchestrator.run_session(question):
        event_dict = event.model_dump()
        collected.append(event_dict)
        if event.faith and event.faith not in faith_names:
            faith_names.append(event.faith)
        yield {
            "event": event.phase,
            "data": event.model_dump_json(),
        }

    update_session_events(session_id, collected)


@app.post("/api/council/ask")
async def ask_council(request: QuestionRequest):
    return EventSourceResponse(
        _event_stream(request.question, request.faiths)
    )


@app.get("/api/council/sessions/{session_id}")
async def get_session(session_id: str):
    session = load_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/api/health")
async def health():
    return {"status": "ok"}


def run() -> None:
    uvicorn.run("council.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()

from __future__ import annotations

import logging
from collections.abc import Iterator

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from council.council import CouncilOrchestrator
from council.db import close_db, create_session, init_db, load_session, update_session_events
from council.live_council import LiveCouncilOrchestrator
from council.schemas import CouncilEvent, QuestionRequest

logger = logging.getLogger(__name__)

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


ALL_FAITH_KEYS = ["hinduism", "islam", "christianity", "buddhism", "judaism"]


@app.websocket("/ws/council/live")
async def live_council(websocket: WebSocket):
    await websocket.accept()
    orchestrator: LiveCouncilOrchestrator | None = None
    try:
        init_msg = await websocket.receive_json()
        question = init_msg.get("question", "").strip()
        if not question:
            await websocket.send_json({"type": "error", "text": "No question provided"})
            await websocket.close()
            return

        faiths = init_msg.get("faiths", ALL_FAITH_KEYS)
        num_rounds = init_msg.get("rounds", 2)

        async def send_to_client(msg: dict) -> None:
            await websocket.send_json(msg)

        orchestrator = LiveCouncilOrchestrator(
            question=question,
            faiths=faiths,
            send_to_client=send_to_client,
            num_rounds=num_rounds,
        )

        await orchestrator.start()
        await orchestrator.run_discussion()
        await websocket.send_json({"type": "complete"})
    except WebSocketDisconnect:
        logger.info("Live council client disconnected")
    except Exception:
        logger.exception("Live council error")
        try:
            await websocket.send_json({"type": "error", "text": "An unexpected error occurred"})
        except Exception:
            pass
    finally:
        if orchestrator:
            await orchestrator.cancel()


@app.get("/api/health")
async def health():
    return {"status": "ok"}


def run() -> None:
    uvicorn.run("council.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()

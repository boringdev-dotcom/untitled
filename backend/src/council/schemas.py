from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel


class Faith(str, Enum):
    HINDUISM = "hinduism"
    ISLAM = "islam"
    CHRISTIANITY = "christianity"
    BUDDHISM = "buddhism"
    JUDAISM = "judaism"


class QuestionRequest(BaseModel):
    question: str
    faiths: list[Faith] | None = None


class ScriptureChunk(BaseModel):
    id: int
    faith: str
    book: str
    chapter: str | None = None
    verse_range: str | None = None
    content: str


class AgentOpinion(BaseModel):
    faith: str
    agent_name: str
    opinion: str
    scripture_refs: list[ScriptureChunk]


class AgentRebuttal(BaseModel):
    faith: str
    agent_name: str
    rebuttal: str


class CouncilEvent(BaseModel):
    phase: Literal["opinion", "rebuttal", "report"]
    faith: str | None = None
    agent_name: str | None = None
    content: str
    scripture_refs: list[ScriptureChunk] = []

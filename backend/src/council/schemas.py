from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


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


class FaithPairAgreement(BaseModel):
    faith_a: str = Field(description="First faith in the pair, e.g. 'hinduism'")
    faith_b: str = Field(description="Second faith in the pair, e.g. 'islam'")
    score: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Agreement score between this pair of faiths on the discussed question. "
            "0.0 = fundamentally oppose each other, 0.2 = mostly disagree, "
            "0.4 = more disagreement than agreement, 0.5 = evenly split, "
            "0.6 = more agreement than disagreement, 0.8 = strongly agree, "
            "1.0 = virtually identical positions. "
            "Scores MUST vary between pairs — different faith pairs will have different levels of agreement."
        ),
    )
    summary: str = Field(description="One-sentence explanation of why this pair has this agreement level")


class ThemePosition(BaseModel):
    faith: str = Field(description="The faith tradition, e.g. 'hinduism'")
    stance: str = Field(description="Must be one of: 'agree', 'disagree', or 'nuanced'")
    brief: str = Field(description="One-sentence summary of this faith's position on the theme")


class AnalysisTheme(BaseModel):
    name: str = Field(description="Short name for the theme, e.g. 'Nature of the Soul'")
    description: str = Field(description="One-sentence description of the theme")
    positions: list[ThemePosition]


class CouncilAnalysis(BaseModel):
    overall_consensus: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Overall consensus level across all faiths. "
            "0.0 = no agreement at all, 0.5 = mixed, 1.0 = complete unanimity. "
            "Most interfaith discussions land between 0.3 and 0.7."
        ),
    )
    agreements: list[FaithPairAgreement] = Field(
        description="One entry for every unique pair of participating faiths with their pairwise agreement score"
    )
    themes: list[AnalysisTheme] = Field(description="3-5 key themes from the discussion")
    strongest_agreement: str = Field(description="One sentence describing the strongest point of agreement and which faiths share it")
    strongest_disagreement: str = Field(description="One sentence describing the sharpest disagreement and which faiths are on opposing sides")


class CouncilEvent(BaseModel):
    phase: Literal["opinion", "rebuttal", "report", "analysis", "session_saved"]
    faith: str | None = None
    agent_name: str | None = None
    content: str
    scripture_refs: list[ScriptureChunk] = []
    analysis: CouncilAnalysis | None = None
    session_id: str | None = None

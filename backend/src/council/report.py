from __future__ import annotations

from google import genai
from google.genai.types import GenerateContentConfig

from council.config import settings
from council.schemas import AgentOpinion, AgentRebuttal


SYNTHESIZER_SYSTEM_PROMPT = (
    "You are an impartial moderator of the Council of Faiths. "
    "Your role is to synthesize a balanced, respectful final report from the council's discussion. "
    "You do NOT favor any tradition. You present each perspective fairly and identify genuine "
    "points of convergence and divergence. You write in clear, accessible language."
)


class ReportSynthesizer:
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    def generate(
        self,
        question: str,
        opinions: list[AgentOpinion],
        rebuttals: list[AgentRebuttal],
    ) -> str:
        opinions_text = ""
        for op in opinions:
            opinions_text += f"\n### {op.agent_name} ({op.faith.title()}):\n{op.opinion}\n"

        rebuttals_text = ""
        for reb in rebuttals:
            rebuttals_text += f"\n### {reb.agent_name} ({reb.faith.title()}):\n{reb.rebuttal}\n"

        prompt = (
            f"The Council of Faiths was asked:\n\"{question}\"\n\n"
            f"## Initial Opinions\n{opinions_text}\n\n"
            f"## Cross-Examination & Rebuttals\n{rebuttals_text}\n\n"
            f"---\n\n"
            f"Please produce a final synthesis report with these sections:\n\n"
            f"1. **Question Restated** — rephrase the question clearly\n"
            f"2. **Summary of Each Tradition's View** — a concise paragraph for each faith\n"
            f"3. **Points of Agreement** — where the traditions converge\n"
            f"4. **Points of Disagreement** — where they diverge, with the reasoning from each side\n"
            f"5. **Common Ground & Complementary Insights** — deeper synthesis\n"
            f"6. **Closing Reflection** — a brief, balanced closing thought\n\n"
            f"Be thorough, balanced, and respectful."
        )

        response = self._client.models.generate_content(
            model=settings.gemini_model,
            config=GenerateContentConfig(
                system_instruction=SYNTHESIZER_SYSTEM_PROMPT,
                temperature=0.5,
            ),
            contents=prompt,
        )

        return response.text

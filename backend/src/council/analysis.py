from __future__ import annotations

import json

from google import genai
from google.genai.types import GenerateContentConfig

from council.config import settings
from council.schemas import (
    AgentOpinion,
    AgentRebuttal,
    CouncilAnalysis,
)

ANALYZER_SYSTEM_PROMPT = (
    "You are an analytical engine for the Council of Faiths. "
    "Given a philosophical question and the full council discussion (opinions and rebuttals), "
    "produce a structured quantitative analysis.\n\n"
    "CRITICAL RULES for agreement scores:\n"
    "- Scores MUST reflect the ACTUAL content of the opinions and rebuttals.\n"
    "- Different faith pairs MUST have DIFFERENT scores — no two pairs should be identical unless truly warranted.\n"
    "- Use the FULL range: 0.1 for near-total disagreement, 0.9 for near-total agreement.\n"
    "- DO NOT default everything to 0.5. Read what each scholar actually said and score accordingly.\n"
    "- Example: If Hinduism and Buddhism both emphasize karma and cycles, score them 0.7-0.9. "
    "If Islam and Buddhism differ fundamentally on God's nature, score them 0.2-0.4.\n\n"
    "For themes, identify 3-5 major themes and record each faith's stance as 'agree', 'disagree', or 'nuanced'."
)


class CouncilAnalyzer:
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    def analyze(
        self,
        question: str,
        opinions: list[AgentOpinion],
        rebuttals: list[AgentRebuttal],
    ) -> CouncilAnalysis:
        opinions_text = ""
        for op in opinions:
            opinions_text += f"\n### {op.agent_name} ({op.faith.title()}):\n{op.opinion}\n"

        rebuttals_text = ""
        for reb in rebuttals:
            rebuttals_text += f"\n### {reb.agent_name} ({reb.faith.title()}):\n{reb.rebuttal}\n"

        faiths = [op.faith for op in opinions]

        pairs_desc = []
        for i, a in enumerate(faiths):
            for b in faiths[i + 1 :]:
                pairs_desc.append(f"  - {a.title()} & {b.title()}")
        pairs_list = "\n".join(pairs_desc)

        prompt = (
            f'The Council of Faiths was asked:\n"{question}"\n\n'
            f"Participating faiths: {', '.join(f.title() for f in faiths)}\n\n"
            f"## Initial Opinions\n{opinions_text}\n\n"
            f"## Cross-Examination & Rebuttals\n{rebuttals_text}\n\n"
            f"---\n\n"
            f"Analyze this discussion carefully. Read each opinion and rebuttal to understand "
            f"where faiths genuinely agree or disagree.\n\n"
            f"Produce structured JSON with:\n\n"
            f"1. **overall_consensus** (float 0.0-1.0): How much the council agrees overall.\n\n"
            f"2. **agreements**: A score for EACH of these {len(faiths) * (len(faiths) - 1) // 2} faith pairs:\n"
            f"{pairs_list}\n"
            f"   Each score must be based on the ACTUAL positions expressed. "
            f"Scores should VARY — e.g. one pair might be 0.8 while another is 0.3. "
            f"Use faith names in lowercase (e.g. 'hinduism', 'islam').\n\n"
            f"3. **themes**: 3-5 major themes. For each, include EVERY faith's stance.\n\n"
            f"4. **strongest_agreement**: Which faiths agreed most and on what?\n\n"
            f"5. **strongest_disagreement**: Which faiths clashed most sharply and on what?\n"
        )

        response = self._client.models.generate_content(
            model=settings.gemini_model,
            config=GenerateContentConfig(
                system_instruction=ANALYZER_SYSTEM_PROMPT,
                temperature=0.3,
                response_mime_type="application/json",
                response_schema=CouncilAnalysis,
            ),
            contents=prompt,
        )

        return CouncilAnalysis.model_validate(json.loads(response.text))

from __future__ import annotations

from google import genai
from google.genai.types import GenerateContentConfig

from council.config import settings
from council.personas import PersonaConfig
from council.retriever import retriever
from council.schemas import AgentOpinion, AgentRebuttal, ScriptureChunk


class FaithAgent:
    def __init__(self, persona: PersonaConfig):
        self.persona = persona
        self.faith = persona.faith.value
        self.name = persona.agent_name
        self._client = genai.Client(api_key=settings.gemini_api_key)

    def _format_scripture_context(self, chunks: list[ScriptureChunk]) -> str:
        parts: list[str] = []
        for i, chunk in enumerate(chunks, 1):
            source = chunk.book
            if chunk.chapter:
                source += f", {chunk.chapter}"
            if chunk.verse_range:
                source += f":{chunk.verse_range}"
            parts.append(f"[{i}] ({source})\n{chunk.content}")
        return "\n\n".join(parts)

    def opine(self, question: str) -> AgentOpinion:
        chunks = retriever.retrieve(question, self.faith)
        scripture_context = self._format_scripture_context(chunks)

        prompt = (
            f"You have been given the following passages from your sacred scriptures:\n\n"
            f"{scripture_context}\n\n"
            f"---\n\n"
            f"A seeker asks the Council of Faiths:\n\"{question}\"\n\n"
            f"As {self.name}, a {self.persona.tradition} scholar, provide your perspective "
            f"on this question. Ground every point in the scripture passages above. "
            f"Be thorough but concise (300-500 words)."
        )

        response = self._client.models.generate_content(
            model=settings.gemini_model,
            config=GenerateContentConfig(
                system_instruction=self.persona.system_prompt,
                temperature=0.7,
            ),
            contents=prompt,
        )

        return AgentOpinion(
            faith=self.faith,
            agent_name=self.name,
            opinion=response.text,
            scripture_refs=chunks,
        )

    def rebut(
        self,
        question: str,
        other_opinions: list[AgentOpinion],
    ) -> AgentRebuttal:
        chunks = retriever.retrieve(question, self.faith)
        scripture_context = self._format_scripture_context(chunks)

        others_text = ""
        for op in other_opinions:
            others_text += f"\n### {op.agent_name} ({op.faith.title()}):\n{op.opinion}\n"

        prompt = (
            f"You have been given the following passages from your sacred scriptures:\n\n"
            f"{scripture_context}\n\n"
            f"---\n\n"
            f"The question was: \"{question}\"\n\n"
            f"Here are the opinions of the other council members:\n{others_text}\n"
            f"---\n\n"
            f"As {self.name}, review the other scholars' opinions. For each one:\n"
            f"- State what you AGREE with and why (referencing your own scriptures)\n"
            f"- State what you DISAGREE with and why (referencing your own scriptures)\n"
            f"- Note any common ground or complementary insights\n\n"
            f"Be respectful, scholarly, and grounded in your scriptures. (300-500 words)"
        )

        response = self._client.models.generate_content(
            model=settings.gemini_model,
            config=GenerateContentConfig(
                system_instruction=self.persona.system_prompt,
                temperature=0.7,
            ),
            contents=prompt,
        )

        return AgentRebuttal(
            faith=self.faith,
            agent_name=self.name,
            rebuttal=response.text,
        )

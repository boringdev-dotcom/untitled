from __future__ import annotations

import asyncio
import base64
import logging
import random
from collections.abc import Callable, Coroutine
from typing import Any

from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig

from council.config import settings
from council.personas import PersonaConfig
from council.personas.buddhist import BUDDHIST
from council.personas.christian import CHRISTIAN
from council.personas.hindu import HINDU
from council.personas.islam import ISLAM
from council.personas.jewish import JEWISH
from council.retriever import retriever
from council.schemas import ScriptureChunk

logger = logging.getLogger(__name__)

ALL_PERSONAS = [HINDU, ISLAM, CHRISTIAN, BUDDHIST, JEWISH]

VOICE_MAP: dict[str, str] = {
    "hinduism": "Orus",
    "islam": "Charon",
    "christianity": "Puck",
    "buddhism": "Aoede",
    "judaism": "Zephyr",
}

PERSONA_MAP: dict[str, PersonaConfig] = {
    p.faith.value: p for p in ALL_PERSONAS
}

SendFn = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]

CLOSING_PROMPTS = [
    (
        "The council is wrapping up. Here's what was discussed:\n{recent_context}\n\n"
        "As {self_name}, give a brief closing thought — 15 to 20 seconds. "
        "Acknowledge where you found common ground and where you still differ. "
        "End with something warm and wise."
    ),
    (
        "Final remarks. The discussion covered:\n{recent_context}\n\n"
        "As {self_name}, offer a parting reflection. What did you appreciate "
        "hearing from the other scholars? What remains unresolved? Be brief."
    ),
]


def _format_scripture_context(chunks: list[ScriptureChunk]) -> str:
    parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.book
        if chunk.chapter:
            source += f", {chunk.chapter}"
        if chunk.verse_range:
            source += f":{chunk.verse_range}"
        parts.append(f"[{i}] ({source})\n{chunk.content}")
    return "\n\n".join(parts)


def _build_live_system_prompt(
    persona: PersonaConfig,
    scripture_text: str,
    other_panelists: list[tuple[str, str]],
) -> str:
    panelist_lines = "\n".join(
        f"- {name} ({tradition})" for name, tradition in other_panelists
    )
    return (
        persona.system_prompt + "\n\n"
        "YOU ARE IN A LIVE PANEL DISCUSSION.\n\n"
        "The other scholars on this panel are:\n"
        f"{panelist_lines}\n\n"
        "IMPORTANT: These are the ONLY other scholars present. "
        "Do NOT mention, address, or refer to any scholars or faith traditions "
        "that are not listed above.\n\n"
        "How to behave:\n"
        "- Speak naturally, like a real person in a lively debate.\n"
        "- Address the other scholars by name when responding to them.\n"
        "- Vary your responses — sometimes a quick reaction, sometimes a longer thought.\n"
        "- Show personality. You can be passionate, thoughtful, surprised, or amused.\n"
        "- It's okay to strongly agree or strongly disagree.\n"
        "- Don't repeat what you've already said. Build on the conversation.\n\n"
        "GROUNDING RULES (non-negotiable):\n"
        "- You must ONLY draw upon the scripture passages provided below.\n"
        "- Do NOT use any knowledge outside these passages.\n"
        "- If a topic isn't covered by your passages, say so honestly.\n"
        "- When you cite scripture, mention the book and passage.\n\n"
        "YOUR SCRIPTURE PASSAGES:\n"
        f"{scripture_text}\n"
    )


def _truncate(text: str, max_len: int = 300) -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len].rsplit(" ", 1)[0] + "..."


class _ConversationEntry:
    __slots__ = ("faith", "agent_name", "text", "turn")

    def __init__(self, faith: str, agent_name: str, text: str, turn: int):
        self.faith = faith
        self.agent_name = agent_name
        self.text = text
        self.turn = turn


class LiveCouncilOrchestrator:
    def __init__(
        self,
        question: str,
        faiths: list[str],
        send_to_client: SendFn,
        num_rounds: int = 2,
    ) -> None:
        self.question = question
        self.faiths = faiths
        self.send_to_client = send_to_client
        self.num_discussion_turns = max(len(faiths) * num_rounds, 6)
        self.sessions: dict[str, Any] = {}
        self._session_contexts: dict[str, Any] = {}
        self._conversation_log: list[_ConversationEntry] = []
        self._turn_counter = 0
        self._client = genai.Client(api_key=settings.gemini_api_key)

    # ------------------------------------------------------------------
    # Session setup
    # ------------------------------------------------------------------

    async def start(self) -> None:
        await self.send_to_client({"type": "status", "text": "Retrieving scriptures..."})

        loop = asyncio.get_event_loop()
        scripture_map: dict[str, str] = {}
        for faith in self.faiths:
            chunks = await loop.run_in_executor(
                None, retriever.retrieve, self.question, faith
            )
            scripture_map[faith] = _format_scripture_context(chunks)

        await self.send_to_client({"type": "status", "text": "Connecting scholars..."})

        for faith in self.faiths:
            persona = PERSONA_MAP[faith]
            other_panelists = [
                (PERSONA_MAP[f].agent_name, PERSONA_MAP[f].tradition)
                for f in self.faiths if f != faith
            ]
            system_prompt = _build_live_system_prompt(
                persona, scripture_map[faith], other_panelists
            )

            config = types.LiveConnectConfig(
                response_modalities=["AUDIO"],
                output_audio_transcription=types.AudioTranscriptionConfig(),
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=VOICE_MAP[faith]
                        )
                    )
                ),
                system_instruction=types.Content(
                    parts=[types.Part(text=system_prompt)]
                ),
                context_window_compression=types.ContextWindowCompressionConfig(
                    sliding_window=types.SlidingWindow()
                ),
            )

            ctx = self._client.aio.live.connect(
                model="gemini-3.1-flash-live-preview",
                config=config,
            )
            session = await ctx.__aenter__()
            self.sessions[faith] = session
            self._session_contexts[faith] = ctx
            logger.info("Live session opened for %s", faith)

    # ------------------------------------------------------------------
    # Main discussion loop
    # ------------------------------------------------------------------

    async def run_discussion(self) -> None:
        try:
            # --- Phase 1: Opening statements ---
            await self.send_to_client({
                "type": "round_start",
                "round": 1,
                "label": "Opening Statements",
            })
            panelist_names = [PERSONA_MAP[f].agent_name for f in self.faiths]
            for faith in self.faiths:
                persona = PERSONA_MAP[faith]
                others = [n for n in panelist_names if n != persona.agent_name]
                others_str = ", ".join(others)
                prompt = (
                    f'A seeker asks the Council of Faiths: "{self.question}"\n\n'
                    f"You are on a panel with: {others_str}.\n"
                    f"As {persona.agent_name}, give your opening take. "
                    "Ground it in your scriptures. Keep it to about 30-45 seconds. "
                    "Only address the scholars listed above."
                )
                await self._agent_speak(faith, prompt)

            # --- Phase 2: Free-flowing discussion driven by agent intelligence ---
            await self.send_to_client({
                "type": "round_start",
                "round": 2,
                "label": "Open Discussion",
            })

            last_speaker: str | None = self.faiths[-1] if self.faiths else None
            for _ in range(self.num_discussion_turns):
                next_faith = await self._bid_for_floor(last_speaker)
                prompt = self._build_discussion_prompt(next_faith)
                await self._agent_speak(next_faith, prompt)
                last_speaker = next_faith

            # --- Phase 3: Closing reflection ---
            await self.send_to_client({
                "type": "round_start",
                "round": 3,
                "label": "Closing Reflections",
            })
            closing_faith = self._pick_closing_speaker()
            prompt = self._build_closing_prompt(closing_faith)
            await self._agent_speak(closing_faith, prompt)

        finally:
            await self._close_all()

    # ------------------------------------------------------------------
    # Agent-driven speaker selection via bidding
    # ------------------------------------------------------------------

    async def _bid_for_floor(self, last_speaker: str | None) -> str:
        """Ask each agent how urgently they want to speak. Highest bid wins."""
        candidates = [f for f in self.faiths if f != last_speaker]
        if not candidates:
            candidates = list(self.faiths)

        recent_context = self._format_recent_context(4)

        bid_prompt = (
            f"You are listening to a live council discussion about: \"{self.question}\"\n\n"
            f"Here is what was just said:\n{recent_context}\n\n"
            "How urgently do you want to respond right now?\n"
            "Consider: Were you addressed by name? Do you disagree with something? "
            "Do you have a scripture passage that directly speaks to what was just said? "
            "Or has your point already been made?\n\n"
            "Reply with ONLY a single integer from 1 to 10.\n"
            "1 = I have nothing to add right now.\n"
            "10 = I must respond immediately — I was addressed or strongly disagree.\n"
            "Just the number, nothing else."
        )

        async def _get_bid(faith: str) -> tuple[str, int]:
            persona = PERSONA_MAP[faith]
            try:
                response = await self._client.aio.models.generate_content(
                    model=settings.gemini_model,
                    config=GenerateContentConfig(
                        system_instruction=f"You are {persona.agent_name}, a {persona.tradition} scholar.",
                        temperature=0.3,
                        max_output_tokens=5,
                    ),
                    contents=bid_prompt,
                )
                text = (response.text or "").strip()
                # Extract first integer found
                for token in text.split():
                    digits = "".join(c for c in token if c.isdigit())
                    if digits:
                        return faith, max(1, min(10, int(digits)))
                return faith, 5
            except Exception:
                logger.exception("Bid failed for %s", faith)
                return faith, 5

        tasks = [_get_bid(f) for f in candidates]
        results = await asyncio.gather(*tasks)

        # Pick the highest bidder; break ties randomly
        bids = list(results)
        random.shuffle(bids)
        bids.sort(key=lambda x: x[1], reverse=True)

        winner = bids[0][0]
        logger.info(
            "Bids: %s → winner: %s",
            {PERSONA_MAP[f].agent_name: score for f, score in results},
            PERSONA_MAP[winner].agent_name,
        )
        return winner

    # ------------------------------------------------------------------
    # Prompt construction
    # ------------------------------------------------------------------

    def _format_recent_context(self, n: int = 3) -> str:
        recent = self._conversation_log[-n:]
        if not recent:
            return "(No remarks yet)"
        return "\n".join(
            f"- {e.agent_name}: \"{_truncate(e.text)}\""
            for e in recent
        )

    def _build_discussion_prompt(self, faith: str) -> str:
        persona = PERSONA_MAP[faith]
        last_entry = self._conversation_log[-1] if self._conversation_log else None
        recent_context = self._format_recent_context(4)

        grounding = (
            "\nRemember: use ONLY your provided scripture passages. "
            "Only address scholars who are on this panel."
        )

        # Directly addressed by name — specific reply prompt
        if last_entry and persona.agent_name.lower() in last_entry.text.lower():
            return (
                f"{last_entry.agent_name} just addressed you directly. "
                f'They said: "{_truncate(last_entry.text, 250)}"\n\n'
                f"As {persona.agent_name}, respond to {last_entry.agent_name}. "
                "Answer their point, agree or push back, and cite your scriptures."
                + grounding
            )

        # You won the bid — speak your mind freely
        return (
            f"The discussion so far:\n{recent_context}\n\n"
            f"As {persona.agent_name}, you wanted to jump in. Speak your mind. "
            "You can react to what was just said, challenge someone, agree, "
            "raise a new angle from your scriptures, or directly address "
            "another scholar. Be natural and conversational."
            + grounding
        )

    def _pick_closing_speaker(self) -> str:
        counts = {f: 0 for f in self.faiths}
        for entry in self._conversation_log:
            if entry.faith in counts:
                counts[entry.faith] += 1
        return min(counts, key=counts.get)  # type: ignore[arg-type]

    def _build_closing_prompt(self, faith: str) -> str:
        persona = PERSONA_MAP[faith]
        recent_context = self._format_recent_context(5)
        template = random.choice(CLOSING_PROMPTS)
        return template.format(
            recent_context=recent_context,
            self_name=persona.agent_name,
        )

    # ------------------------------------------------------------------
    # Audio turn execution
    # ------------------------------------------------------------------

    async def _agent_speak(self, faith: str, prompt: str) -> None:
        session = self.sessions.get(faith)
        if session is None:
            logger.warning("No session for %s, skipping", faith)
            return

        persona = PERSONA_MAP[faith]
        self._turn_counter += 1
        turn = self._turn_counter

        await self.send_to_client({
            "type": "speaker_start",
            "faith": faith,
            "agent_name": persona.agent_name,
            "turn": turn,
        })

        try:
            await session.send_realtime_input(text=prompt)

            transcript_parts: list[str] = []
            async for response in session.receive():
                sc = response.server_content
                if sc is None:
                    continue

                if sc.model_turn and sc.model_turn.parts:
                    for part in sc.model_turn.parts:
                        if part.inline_data and part.inline_data.data:
                            audio_b64 = base64.b64encode(
                                part.inline_data.data
                            ).decode("ascii")
                            await self.send_to_client({
                                "type": "audio",
                                "faith": faith,
                                "data": audio_b64,
                            })

                if sc.output_transcription and sc.output_transcription.text:
                    transcript_parts.append(sc.output_transcription.text)
                    await self.send_to_client({
                        "type": "transcript",
                        "faith": faith,
                        "text": sc.output_transcription.text,
                        "turn": turn,
                    })

                if sc.turn_complete:
                    break

            full_transcript = " ".join(transcript_parts)
            self._conversation_log.append(
                _ConversationEntry(faith, persona.agent_name, full_transcript, turn)
            )

        except Exception:
            logger.exception("Error during %s turn", faith)
            await self.send_to_client({
                "type": "error",
                "faith": faith,
                "text": f"{persona.agent_name} encountered an error and was skipped.",
            })

        await self.send_to_client({
            "type": "speaker_end",
            "faith": faith,
            "agent_name": persona.agent_name,
            "turn": turn,
        })

    # ------------------------------------------------------------------
    # Cleanup
    # ------------------------------------------------------------------

    async def _close_all(self) -> None:
        for faith, ctx in self._session_contexts.items():
            try:
                await ctx.__aexit__(None, None, None)
                logger.info("Closed session for %s", faith)
            except Exception:
                logger.exception("Error closing session for %s", faith)
        self.sessions.clear()
        self._session_contexts.clear()

    async def cancel(self) -> None:
        await self._close_all()

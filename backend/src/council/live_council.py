from __future__ import annotations

import asyncio
import base64
import logging
import random
from collections.abc import Callable, Coroutine
from typing import Any

from google import genai
from google.genai import types

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

# --- Prompt variety for natural discussion flow ---

REACTION_PROMPTS = [
    (
        '{last_name} just said: "{excerpt}"\n\n'
        "React honestly. Do you agree or disagree? Be direct and cite your scriptures."
    ),
    (
        '{last_name} just made this point: "{excerpt}"\n\n'
        "Jump in with a brief reaction — just a sentence or two. "
        "Be natural, like you're in a real conversation."
    ),
    (
        "You've been listening to the discussion. {last_name} just said: "
        '"{excerpt}"\n\n'
        "What's your take? Speak from your tradition."
    ),
    (
        '{last_name} claimed: "{excerpt}"\n\n'
        "If you see this differently, push back. If you agree, say so and explain "
        "how your own scriptures support the same idea."
    ),
    (
        'Responding to {last_name} who said: "{excerpt}"\n\n'
        "Build on their point or take it in a completely different direction. "
        "Reference your scriptures."
    ),
    (
        "The conversation has turned to this from {last_name}: "
        '"{excerpt}"\n\n'
        "Address {last_name} directly. You can agree, disagree, or add nuance. "
        "Keep it conversational."
    ),
]

INTERJECTION_PROMPTS = [
    (
        "You've been quiet. The others have been saying:\n{recent_context}\n\n"
        "Interject briefly with something the others have missed. "
        "One or two sentences max."
    ),
    (
        "The others have been going back and forth:\n{recent_context}\n\n"
        "Jump in. What would your tradition say about this? "
        "Keep it short and punchy."
    ),
]

DEEPER_PROMPTS = [
    (
        "The discussion so far:\n{recent_context}\n\n"
        "As {self_name}, go deeper on a point that hasn't been fully explored. "
        "What do your scriptures really say about this? "
        "Take 30-45 seconds."
    ),
    (
        "The council has covered some ground:\n{recent_context}\n\n"
        "As {self_name}, bring up something the others have overlooked — "
        "a teaching from your scriptures that changes the picture. "
        "Be specific with your citation."
    ),
]

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


def _build_live_system_prompt(persona: PersonaConfig, scripture_text: str) -> str:
    return (
        persona.system_prompt + "\n\n"
        "YOU ARE IN A LIVE PANEL DISCUSSION WITH OTHER SCHOLARS.\n\n"
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
            system_prompt = _build_live_system_prompt(persona, scripture_map[faith])

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

    async def run_discussion(self) -> None:
        try:
            # --- Phase 1: Opening statements (ordered, one per faith) ---
            await self.send_to_client({
                "type": "round_start",
                "round": 1,
                "label": "Opening Statements",
            })
            for faith in self.faiths:
                persona = PERSONA_MAP[faith]
                prompt = (
                    f'A seeker asks the Council of Faiths: "{self.question}"\n\n'
                    f"As {persona.agent_name}, give your opening take. "
                    "Ground it in your scriptures. Keep it to about 30-45 seconds."
                )
                await self._agent_speak(faith, prompt)

            # --- Phase 2: Free-flowing discussion ---
            await self.send_to_client({
                "type": "round_start",
                "round": 2,
                "label": "Open Discussion",
            })

            last_speaker: str | None = None
            for i in range(self.num_discussion_turns):
                next_faith = self._pick_next_speaker(last_speaker)
                prompt = self._build_discussion_prompt(next_faith, i)
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

    def _pick_next_speaker(self, last_speaker: str | None) -> str:
        """Pick the next speaker using weighted selection for natural flow."""
        candidates = [f for f in self.faiths if f != last_speaker]
        if not candidates:
            candidates = list(self.faiths)

        weights: list[float] = []
        recent_speakers = [
            e.faith for e in self._conversation_log[-3:]
        ]
        last_text = self._conversation_log[-1].text if self._conversation_log else ""

        for faith in candidates:
            w = 1.0
            persona = PERSONA_MAP[faith]

            # Strong boost if mentioned by name in last remark
            if persona.agent_name.lower() in last_text.lower():
                w += 5.0

            # Boost if tradition/faith referenced
            if faith in last_text.lower() or persona.tradition.lower().split("(")[0].strip() in last_text.lower():
                w += 2.0

            # Boost for agents who haven't spoken recently
            if faith not in recent_speakers:
                w += 3.0

            # Slight penalty for speaking too often overall
            speak_count = sum(1 for e in self._conversation_log if e.faith == faith)
            avg_count = (len(self._conversation_log) + 1) / max(len(self.faiths), 1)
            if speak_count > avg_count:
                w *= 0.5

            # Small random factor for variety
            w += random.random() * 1.5

            weights.append(max(w, 0.1))

        total = sum(weights)
        r = random.random() * total
        cumulative = 0.0
        for faith, w in zip(candidates, weights):
            cumulative += w
            if r <= cumulative:
                return faith
        return candidates[-1]

    def _build_discussion_prompt(self, faith: str, turn_index: int) -> str:
        persona = PERSONA_MAP[faith]
        last_entry = self._conversation_log[-1] if self._conversation_log else None

        recent_entries = self._conversation_log[-3:]
        recent_context = "\n".join(
            f"- {e.agent_name}: \"{_truncate(e.text)}\""
            for e in recent_entries
        ) if recent_entries else ""

        # Decide prompt style based on context
        if last_entry and persona.agent_name.lower() in last_entry.text.lower():
            # Was directly addressed — must respond
            template = random.choice(REACTION_PROMPTS)
            return template.format(
                last_name=last_entry.agent_name,
                excerpt=_truncate(last_entry.text, 200),
                self_name=persona.agent_name,
            ) + "\nRespond using ONLY your provided scripture passages."

        if last_entry and turn_index < self.num_discussion_turns * 0.6:
            # Early/mid discussion — react to what was just said
            template = random.choice(REACTION_PROMPTS)
            return template.format(
                last_name=last_entry.agent_name,
                excerpt=_truncate(last_entry.text, 200),
                self_name=persona.agent_name,
            ) + "\nRespond using ONLY your provided scripture passages."

        # Hasn't spoken in a while — interjection or deeper point
        my_speak_count = sum(1 for e in self._conversation_log if e.faith == faith)
        if my_speak_count == 0 or (turn_index > 2 and random.random() < 0.3):
            template = random.choice(INTERJECTION_PROMPTS)
            return template.format(
                recent_context=recent_context,
                self_name=persona.agent_name,
            ) + "\nUse ONLY your provided scripture passages."

        # Later in discussion — go deeper
        template = random.choice(DEEPER_PROMPTS)
        return template.format(
            recent_context=recent_context,
            self_name=persona.agent_name,
        ) + "\nUse ONLY your provided scripture passages."

    def _pick_closing_speaker(self) -> str:
        """Pick the agent who's spoken least to give closing remarks."""
        counts = {f: 0 for f in self.faiths}
        for entry in self._conversation_log:
            if entry.faith in counts:
                counts[entry.faith] += 1
        return min(counts, key=counts.get)  # type: ignore[arg-type]

    def _build_closing_prompt(self, faith: str) -> str:
        persona = PERSONA_MAP[faith]
        recent_entries = self._conversation_log[-5:]
        recent_context = "\n".join(
            f"- {e.agent_name}: \"{_truncate(e.text)}\""
            for e in recent_entries
        )
        template = random.choice(CLOSING_PROMPTS)
        return template.format(
            recent_context=recent_context,
            self_name=persona.agent_name,
        )

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

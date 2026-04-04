from __future__ import annotations

import concurrent.futures
from collections.abc import Iterator

from council.agents import FaithAgent
from council.personas.buddhist import BUDDHIST
from council.personas.christian import CHRISTIAN
from council.personas.hindu import HINDU
from council.personas.islam import ISLAM
from council.personas.jewish import JEWISH
from council.report import ReportSynthesizer
from council.schemas import AgentOpinion, AgentRebuttal, CouncilEvent, Faith

ALL_PERSONAS = [HINDU, ISLAM, CHRISTIAN, BUDDHIST, JEWISH]


class CouncilOrchestrator:
    def __init__(self, faiths: list[Faith] | None = None) -> None:
        personas = ALL_PERSONAS
        if faiths:
            faith_set = set(faiths)
            personas = [p for p in ALL_PERSONAS if p.faith in faith_set]
        self.agents = [FaithAgent(p) for p in personas]
        self.synthesizer = ReportSynthesizer()

    def run_session(self, question: str) -> Iterator[CouncilEvent]:
        """Run the full 3-phase council discussion, yielding events as they complete."""

        # --- Phase 1: Initial opinions (parallel) ---
        opinions: list[AgentOpinion] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(self.agents)) as pool:
            future_to_agent = {
                pool.submit(agent.opine, question): agent
                for agent in self.agents
            }
            for future in concurrent.futures.as_completed(future_to_agent):
                opinion = future.result()
                opinions.append(opinion)
                yield CouncilEvent(
                    phase="opinion",
                    faith=opinion.faith,
                    agent_name=opinion.agent_name,
                    content=opinion.opinion,
                    scripture_refs=opinion.scripture_refs,
                )

        # --- Phase 2: Cross-examination (parallel) ---
        rebuttals: list[AgentRebuttal] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(self.agents)) as pool:
            future_to_agent = {}
            for agent in self.agents:
                other_opinions = [o for o in opinions if o.faith != agent.faith]
                future_to_agent[pool.submit(agent.rebut, question, other_opinions)] = agent
            for future in concurrent.futures.as_completed(future_to_agent):
                rebuttal = future.result()
                rebuttals.append(rebuttal)
                yield CouncilEvent(
                    phase="rebuttal",
                    faith=rebuttal.faith,
                    agent_name=rebuttal.agent_name,
                    content=rebuttal.rebuttal,
                )

        # --- Phase 3: Final synthesis ---
        report = self.synthesizer.generate(question, opinions, rebuttals)
        yield CouncilEvent(
            phase="report",
            content=report,
        )

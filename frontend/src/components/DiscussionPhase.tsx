import type { CouncilEvent, Phase } from "../types";
import { AgentCard } from "./AgentCard";

const PHASE_CONFIG: Record<
  Phase,
  { title: string; description: string; badge: string }
> = {
  opinion: {
    title: "Initial Opinions",
    description:
      "Each scholar shares their perspective grounded in their sacred scriptures.",
    badge: "Phase 1",
  },
  rebuttal: {
    title: "Cross-Examination",
    description:
      "Scholars review each other's positions — agreeing, disagreeing, and finding common ground.",
    badge: "Phase 2",
  },
  report: {
    title: "Final Synthesis",
    description:
      "An impartial moderator synthesizes the council's discussion into a balanced report.",
    badge: "Phase 3",
  },
};

interface Props {
  phase: Phase;
  events: CouncilEvent[];
}

export function DiscussionPhase({ phase, events }: Props) {
  const config = PHASE_CONFIG[phase];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
                     bg-accent/20 text-accent"
        >
          {config.badge}
        </span>
        <h2 className="text-xl font-bold text-white">{config.title}</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5">{config.description}</p>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {events.map((event, i) => (
          <AgentCard key={`${phase}-${event.faith}-${i}`} event={event} />
        ))}
      </div>
    </section>
  );
}

import type { CouncilEvent, Phase } from "../types";
import { AgentCard } from "./AgentCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { ReportCard } from "./ReportCard";

const PHASE_CONFIG: Record<
  Phase,
  { title: string; description: string; eyebrow: string }
> = {
  opinion: {
    eyebrow: "Phase I",
    title: "The Thesis",
    description:
      "Each scholar speaks in turn, grounded exclusively in their sacred scriptures.",
  },
  rebuttal: {
    eyebrow: "Phase II",
    title: "The Dialectic",
    description:
      "The scholars contend with one another — agreeing, disputing, and sharpening the argument.",
  },
  report: {
    eyebrow: "Phase III",
    title: "The Convergence",
    description:
      "An impartial scribe weaves the deliberation into a single, balanced synthesis.",
  },
  analysis: {
    eyebrow: "Phase IV",
    title: "Council Analytics",
    description: "A quantitative lens upon qualitative metaphysics.",
  },
  session_saved: {
    eyebrow: "",
    title: "Session Saved",
    description: "This session has been archived and may be shared.",
  },
};

interface Props {
  phase: Phase;
  events: CouncilEvent[];
}

export function DiscussionPhase({ phase, events }: Props) {
  const config = PHASE_CONFIG[phase];

  if (phase === "report" && events.length > 0) {
    return (
      <CollapsibleSection
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        badge="Scribe's Conclusion"
        defaultOpen
      >
        <ReportCard event={events[0]} />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      eyebrow={config.eyebrow}
      title={config.title}
      description={config.description}
      badge={`${events.length} response${events.length !== 1 ? "s" : ""}`}
      defaultOpen
    >
      <div
        className={`grid gap-6 ${
          phase === "opinion"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {events.map((event, i) => (
          <div
            key={`${phase}-${event.faith}-${i}`}
            className="stagger-item"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <AgentCard event={event} />
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

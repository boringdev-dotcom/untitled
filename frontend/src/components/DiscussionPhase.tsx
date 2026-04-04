import type { CouncilEvent, Phase } from "../types";
import { AgentCard } from "./AgentCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { ReportCard } from "./ReportCard";

const PHASE_CONFIG: Record<Phase, { title: string; description: string }> = {
  opinion: {
    title: "Initial Opinions",
    description:
      "Each scholar shares their perspective grounded in their sacred scriptures.",
  },
  rebuttal: {
    title: "Cross-Examination",
    description:
      "Scholars review each other's positions — agreeing, disagreeing, and finding common ground.",
  },
  report: {
    title: "Final Synthesis",
    description:
      "An impartial moderator synthesizes the council's discussion into a balanced report.",
  },
  analysis: {
    title: "Council Analytics",
    description:
      "Quantitative analysis of the council's discussion.",
  },
  session_saved: {
    title: "Session Saved",
    description: "This session has been saved and can be shared.",
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
        title={config.title}
        description={config.description}
        badge={`${events.length} report`}
      >
        <ReportCard event={events[0]} />
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title={config.title}
      description={config.description}
      badge={`${events.length} response${events.length !== 1 ? "s" : ""}`}
    >
      <div
        className={`grid gap-4 ${
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

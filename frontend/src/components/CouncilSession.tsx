import type { CouncilEvent, Phase } from "../types";
import { DiscussionPhase } from "./DiscussionPhase";

interface Props {
  events: CouncilEvent[];
  isLoading: boolean;
  currentPhase: string | null;
}

const PHASES: Phase[] = ["opinion", "rebuttal", "report"];

export function CouncilSession({ events, isLoading, currentPhase }: Props) {
  if (events.length === 0 && !isLoading) return null;

  const grouped: Record<Phase, CouncilEvent[]> = {
    opinion: [],
    rebuttal: [],
    report: [],
  };
  for (const e of events) {
    grouped[e.phase].push(e);
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      {PHASES.map((phase) => {
        if (grouped[phase].length === 0) {
          if (
            isLoading &&
            currentPhase !== null &&
            PHASES.indexOf(phase) <=
              PHASES.indexOf(currentPhase as Phase)
          ) {
            return null;
          }
          return null;
        }
        return (
          <DiscussionPhase
            key={phase}
            phase={phase}
            events={grouped[phase]}
          />
        );
      })}

      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <div
            className="h-2 w-2 rounded-full bg-accent animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-2 w-2 rounded-full bg-accent animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
          <span className="text-sm text-gray-400 ml-2">
            {currentPhase === "opinion" && "Scholars are forming their opinions..."}
            {currentPhase === "rebuttal" && "Cross-examination in progress..."}
            {currentPhase === "report" && "Synthesizing final report..."}
            {!currentPhase && "Convening the council..."}
          </span>
        </div>
      )}
    </div>
  );
}

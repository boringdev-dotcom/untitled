import type { CouncilEvent, Faith, Phase } from "../types";
import { AnalysisDashboard } from "./AnalysisDashboard";
import { CouncilAvatarBar } from "./CouncilAvatarBar";
import { DiscussionPhase } from "./DiscussionPhase";
import { PhaseTimeline } from "./PhaseTimeline";

interface Props {
  events: CouncilEvent[];
  isLoading: boolean;
  currentPhase: string | null;
  question: string;
  faiths: Faith[];
}

const DISPLAY_PHASES: Phase[] = ["opinion", "rebuttal", "report"];

export function CouncilSession({
  events,
  isLoading,
  currentPhase,
  question,
  faiths,
}: Props) {
  if (events.length === 0 && !isLoading) return null;

  const grouped: Record<string, CouncilEvent[]> = {
    opinion: [],
    rebuttal: [],
    report: [],
    analysis: [],
  };
  for (const e of events) {
    if (grouped[e.phase]) grouped[e.phase].push(e);
  }

  const completedPhases: Phase[] = [];
  if (grouped.opinion.length > 0 && currentPhase !== "opinion") completedPhases.push("opinion");
  if (grouped.rebuttal.length > 0 && currentPhase !== "rebuttal") completedPhases.push("rebuttal");
  if (grouped.report.length > 0 && currentPhase !== "report") completedPhases.push("report");
  if (grouped.analysis.length > 0 && !isLoading) completedPhases.push("analysis");

  const speakingFaith: Faith | null = isLoading && events.length > 0
    ? (events[events.length - 1].faith as Faith | null)
    : null;

  const respondedFaiths: Faith[] = [
    ...new Set(
      events
        .filter((e) => e.phase === (currentPhase ?? "opinion") && e.faith)
        .map((e) => e.faith as Faith)
    ),
  ];

  const analysisEvent = grouped.analysis.find((e) => e.analysis);
  const analysisData = analysisEvent?.analysis ?? null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Question banner */}
      <div className="stagger-item mb-6 px-5 py-4 rounded-xl bg-surface-3/50 border border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          Question before the Council
        </p>
        <p className="text-white font-medium leading-relaxed">{question}</p>
      </div>

      <PhaseTimeline
        currentPhase={(currentPhase as Phase) ?? null}
        completedPhases={completedPhases}
        isLoading={isLoading}
      />

      <CouncilAvatarBar
        faiths={faiths}
        speakingFaith={speakingFaith}
        respondedFaiths={respondedFaiths}
      />

      {DISPLAY_PHASES.map((phase) => {
        if (grouped[phase].length === 0) return null;
        return (
          <DiscussionPhase
            key={phase}
            phase={phase}
            events={grouped[phase]}
          />
        );
      })}

      {/* Analysis Dashboard */}
      {analysisData && (
        <AnalysisDashboard
          analysis={analysisData}
          opinionEvents={grouped.opinion}
          faiths={faiths}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-sm text-gray-400">
            {currentPhase === "opinion" && "Scholars are forming their opinions..."}
            {currentPhase === "rebuttal" && "Cross-examination in progress..."}
            {currentPhase === "report" && "Synthesizing final report..."}
            {currentPhase === "analysis" && "Generating analytics..."}
            {!currentPhase && "Convening the council..."}
          </span>
        </div>
      )}
    </div>
  );
}

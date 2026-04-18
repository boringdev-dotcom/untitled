import { useState } from "react";
import type { CouncilEvent, Faith, Phase } from "../types";
import { AnalysisDashboard } from "./AnalysisDashboard";
import { CouncilAvatarBar } from "./CouncilAvatarBar";
import { DiscussionPhase } from "./DiscussionPhase";
import { Icon } from "./Icon";
import { PhaseTimeline } from "./PhaseTimeline";

interface Props {
  events: CouncilEvent[];
  isLoading: boolean;
  currentPhase: string | null;
  question: string;
  faiths: Faith[];
  sessionId?: string | null;
}

const DISPLAY_PHASES: Phase[] = ["opinion", "rebuttal", "report"];

export function CouncilSession({
  events,
  isLoading,
  currentPhase,
  question,
  faiths,
  sessionId,
}: Props) {
  const [copied, setCopied] = useState(false);

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
  if (grouped.opinion.length > 0 && currentPhase !== "opinion")
    completedPhases.push("opinion");
  if (grouped.rebuttal.length > 0 && currentPhase !== "rebuttal")
    completedPhases.push("rebuttal");
  if (grouped.report.length > 0 && currentPhase !== "report")
    completedPhases.push("report");
  if (grouped.analysis.length > 0 && !isLoading)
    completedPhases.push("analysis");

  const speakingFaith: Faith | null =
    isLoading && events.length > 0
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

  const handleShare = () => {
    if (!sessionId) return;
    const url = `${window.location.origin}/s/${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      {/* Question Banner — the thesis */}
      <div className="stagger-item mb-12 text-center">
        <div className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-3">
          Debate Session · The Inquiry
        </div>
        <h2 className="font-headline text-3xl md:text-5xl text-primary leading-[1.1] max-w-4xl mx-auto">
          {question}
        </h2>
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="flourish" aria-hidden="true" />
          {sessionId && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-sm ghost-border bg-surface-container-low hover:bg-surface-container-lowest font-label text-[10px] uppercase tracking-[0.2em] text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Icon name="check_circle" filled className="text-[14px]" />
                  Link Copied
                </>
              ) : (
                <>
                  <Icon name="link" className="text-[14px]" />
                  Share Session
                </>
              )}
            </button>
          )}
        </div>
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

      {analysisData && (
        <AnalysisDashboard
          analysis={analysisData}
          opinionEvents={grouped.opinion}
          faiths={faiths}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="flex gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <div
              className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <span className="font-label text-xs uppercase tracking-[0.25em] text-secondary ml-2">
            {currentPhase === "opinion" && "Scholars forming opinions"}
            {currentPhase === "rebuttal" && "Cross-examination in progress"}
            {currentPhase === "report" && "Synthesizing final convergence"}
            {currentPhase === "analysis" && "Generating analytics"}
            {!currentPhase && "Convening the council"}
          </span>
        </div>
      )}
    </div>
  );
}

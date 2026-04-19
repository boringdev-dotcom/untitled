import { useEffect, useRef } from "react";
import type { Faith, LivePhase, LiveTranscriptEntry } from "../types";
import { FAITH_META } from "../types";
import type { AudioStreamPlayer } from "../utils/audioPlayer";
import { AudioVisualizer } from "./AudioVisualizer";
import { Icon } from "./Icon";
import { SpeakerAvatar } from "./SpeakerAvatar";

interface Props {
  phase: LivePhase;
  faiths: Faith[];
  activeSpeaker: string | null;
  transcripts: LiveTranscriptEntry[];
  currentRound: number;
  currentRoundLabel: string;
  statusText: string | null;
  error: string | null;
  player: AudioStreamPlayer | null;
  question: string;
  onStop: () => void;
}

export function LiveCouncilSession({
  phase,
  faiths,
  activeSpeaker,
  transcripts,
  currentRoundLabel,
  statusText,
  error,
  player,
  question,
  onStop,
}: Props) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const spokenFaiths = new Set(transcripts.map((t) => t.faith));

  const activeMeta = activeSpeaker ? FAITH_META[activeSpeaker as Faith] : null;
  const activeColor = activeMeta?.color ?? "#6b0109";

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      {/* Header — question */}
      <div className="stagger-item mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary">
            Live Disputation
          </span>
          {phase === "live" && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
                  On Air
                </span>
              </div>
            </>
          )}
          {currentRoundLabel && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
                {currentRoundLabel}
              </span>
            </>
          )}
        </div>
        <h2 className="font-headline text-3xl md:text-5xl text-primary leading-[1.1] max-w-4xl mx-auto">
          {question}
        </h2>
        <div className="flex justify-center items-center gap-4 mt-6">
          <span className="flourish" aria-hidden="true" />
          {(phase === "live" || phase === "connecting") && (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-error-container text-on-error-container font-label text-[10px] uppercase tracking-[0.2em] hover:brightness-95 transition-all cursor-pointer"
            >
              <Icon name="stop_circle" filled className="text-[14px]" />
              End Session
            </button>
          )}
          {phase === "complete" && (
            <span className="flex items-center gap-2 px-4 py-2 rounded-sm bg-secondary-container text-on-secondary-container font-label text-[10px] uppercase tracking-[0.2em]">
              <Icon name="check_circle" filled className="text-[14px]" />
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Scholarly amphitheater */}
      <div className="flex items-end justify-center gap-8 md:gap-14 flex-wrap mb-10">
        {faiths.map((faith) => (
          <SpeakerAvatar
            key={faith}
            faith={faith}
            isActive={activeSpeaker === faith}
            hasSpoken={spokenFaiths.has(faith)}
          />
        ))}
      </div>

      {/* Audio visualizer */}
      {phase === "live" && (
        <div className="mb-8 px-2">
          <AudioVisualizer
            player={player}
            color={activeColor}
            isActive={!!activeSpeaker}
          />
        </div>
      )}

      {/* Connecting status */}
      {phase === "connecting" && (
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
            {statusText ?? "Convening the chamber"}
          </span>
        </div>
      )}

      {statusText && phase === "live" && !activeSpeaker && (
        <div className="text-center mb-6">
          <span className="font-label text-xs uppercase tracking-[0.22em] text-on-surface-variant italic">
            {statusText}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-5 rounded-sm bg-error-container/40 border-l-2 border-error text-on-error-container text-sm text-center">
          {error}
        </div>
      )}

      {/* Live Synthesis (Scribe's Desk) */}
      {activeSpeaker && transcripts.length > 0 && (
        <div className="mb-8 rounded-sm bg-surface-container-low p-6 md:p-8 ghost-border border-l-4 border-primary ambient-shadow">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <Icon name="edit_note" filled className="text-[18px]" />
            <span className="font-label text-[10px] uppercase tracking-[0.25em] font-bold">
              Live Synthesis
            </span>
          </div>
          {(() => {
            const last = transcripts[transcripts.length - 1];
            const meta = FAITH_META[last.faith as Faith];
            return (
              <div className="font-headline text-xl md:text-2xl leading-relaxed italic text-on-surface-variant">
                <span className="text-primary font-bold not-italic mr-2">
                  {meta?.agentName ?? last.agentName}:
                </span>
                "{last.text}
                <span
                  className="border-r-2 border-primary inline-block w-1 h-5 align-middle ml-1"
                  style={{ animation: "candle-flicker 1s infinite" }}
                />
                "
              </div>
            );
          })()}
        </div>
      )}

      {/* Transcript feed */}
      {transcripts.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
            <div>
              <div className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-1">
                The Scribe's Log
              </div>
              <h3 className="font-headline italic text-2xl text-on-surface">
                Live Transcript
              </h3>
            </div>
            <span className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
              {transcripts.length} turn{transcripts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto thin-scrollbar rounded-sm bg-surface-container-lowest p-6 space-y-5 ambient-shadow">
            {transcripts.map((entry, i) => {
              const meta = FAITH_META[entry.faith as Faith];
              const isCurrentSpeaker =
                activeSpeaker === entry.faith && i === transcripts.length - 1;
              const prevEntry = i > 0 ? transcripts[i - 1] : null;
              const sameSpeaker = prevEntry?.faith === entry.faith;

              return (
                <div
                  key={`${entry.faith}-${entry.round}-${i}`}
                  className="stagger-item"
                >
                  {!sameSpeaker && (
                    <div className="flex items-baseline gap-3 mb-2">
                      <span
                        className="font-label text-[10px] uppercase tracking-[0.2em] font-bold"
                        style={{ color: meta?.color }}
                      >
                        {meta?.label}
                      </span>
                      <span className="font-headline text-base font-bold text-on-surface">
                        {entry.agentName}
                      </span>
                      {isCurrentSpeaker && (
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary animate-pulse">
                          Speaking
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className="rounded-sm px-5 py-3.5 font-body text-[15px] text-on-surface-variant leading-relaxed"
                    style={{
                      background: meta
                        ? `color-mix(in srgb, ${meta.color} 5%, var(--color-surface-container-low))`
                        : "var(--color-surface-container-low)",
                      borderLeft: `2px solid ${meta?.color ?? "var(--color-outline-variant)"}`,
                    }}
                  >
                    {entry.text}
                    {isCurrentSpeaker && (
                      <span
                        className="inline-block w-1 h-4 bg-primary ml-1 align-middle"
                        style={{ animation: "candle-flicker 1s infinite" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        </section>
      )}

      {phase === "complete" && transcripts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="font-headline italic text-on-surface-variant">
            The council has concluded its disputation.
          </p>
        </div>
      )}
    </div>
  );
}

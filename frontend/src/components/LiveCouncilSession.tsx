import { useEffect, useRef } from "react";
import type { Faith, LivePhase, LiveTranscriptEntry } from "../types";
import { FAITH_META } from "../types";
import type { AudioStreamPlayer } from "../utils/audioPlayer";
import { AudioVisualizer } from "./AudioVisualizer";
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

  const activeMeta = activeSpeaker
    ? FAITH_META[activeSpeaker as Faith]
    : null;
  const activeColor = activeMeta?.color ?? "var(--color-accent)";

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {/* Question banner */}
      <div className="stagger-item mb-6 px-5 py-4 rounded-xl bg-surface-3/50 border border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Live Council Discussion
            </p>
            <p className="text-white font-medium leading-relaxed">{question}</p>
          </div>
          {(phase === "live" || phase === "connecting") && (
            <button
              onClick={onStop}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              End Session
            </button>
          )}
          {phase === "complete" && (
            <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-600/20 text-green-400">
              <span>&#10003;</span> Complete
            </span>
          )}
        </div>
      </div>

      {/* Live indicator */}
      {phase === "live" && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs text-red-400 font-medium uppercase tracking-wider">
            Live
          </span>
          {currentRoundLabel && (
            <span className="text-xs text-gray-500 ml-2">
              — {currentRoundLabel}
            </span>
          )}
        </div>
      )}

      {/* Speaker avatars */}
      <div className="flex items-center justify-center gap-6 mb-8">
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
        <div className="mb-8 px-4">
          <AudioVisualizer
            player={player}
            color={activeColor}
            isActive={!!activeSpeaker}
          />
        </div>
      )}

      {/* Status / connecting */}
      {phase === "connecting" && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <div
              className="h-2 w-2 rounded-full bg-accent animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="h-2 w-2 rounded-full bg-accent animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <span className="text-sm text-gray-400">{statusText}</span>
        </div>
      )}

      {statusText && phase === "live" && !activeSpeaker && (
        <div className="text-center mb-6">
          <span className="text-sm text-gray-500">{statusText}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Transcript feed — chat-like thread */}
      {transcripts.length > 0 && (
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl bg-surface-2/30 border border-white/5 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
            Live Transcript
          </p>
          <div className="space-y-4">
            {transcripts.map((entry, i) => {
              const meta = FAITH_META[entry.faith as Faith];
              const isCurrentSpeaker =
                activeSpeaker === entry.faith &&
                i === transcripts.length - 1;

              const prevEntry = i > 0 ? transcripts[i - 1] : null;
              const sameSpeaker = prevEntry?.faith === entry.faith;

              return (
                <div
                  key={`${entry.faith}-${entry.round}`}
                  className="animate-fade-slide-up"
                >
                  {/* Show avatar + name unless same speaker continues */}
                  {!sameSpeaker && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{meta?.icon}</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: meta?.color }}
                      >
                        {entry.agentName}
                      </span>
                      {isCurrentSpeaker && (
                        <span className="text-[10px] text-gray-500 animate-pulse">
                          speaking...
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className="rounded-xl px-4 py-3 text-sm text-gray-300 leading-relaxed"
                    style={{
                      backgroundColor: meta
                        ? `color-mix(in srgb, ${meta.color} 6%, transparent)`
                        : "rgba(255,255,255,0.03)",
                      borderLeft: `3px solid ${meta?.color ?? "transparent"}`,
                    }}
                  >
                    {entry.text}
                    {isCurrentSpeaker && (
                      <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={transcriptEndRef} />
        </div>
      )}

      {/* Complete state */}
      {phase === "complete" && transcripts.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            The council has concluded its discussion.
          </p>
        </div>
      )}
    </div>
  );
}

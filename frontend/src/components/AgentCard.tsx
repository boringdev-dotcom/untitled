import { useState } from "react";
import type { CouncilEvent, Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  event: CouncilEvent;
}

export function AgentCard({ event }: Props) {
  const [showRefs, setShowRefs] = useState(false);
  const faith = event.faith as Faith | null;
  const meta = faith ? FAITH_META[faith] : null;

  return (
    <div
      className="rounded-xl bg-surface-2 border border-white/5 overflow-hidden
                 transition-all hover:border-white/10"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b border-white/5"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: meta?.color ?? "#888",
        }}
      >
        <span className="text-2xl">{meta?.icon ?? "🌍"}</span>
        <div>
          <h3 className="font-semibold text-white">
            {event.agent_name ?? "Council Moderator"}
          </h3>
          <p className="text-xs text-gray-400">
            {meta?.label ?? "Synthesis"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300 leading-relaxed">
          {event.content}
        </div>
      </div>

      {/* Scripture references */}
      {event.scripture_refs.length > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="text-xs text-accent/80 hover:text-accent transition-colors cursor-pointer"
          >
            {showRefs ? "Hide" : "Show"} scripture references (
            {event.scripture_refs.length})
          </button>
          {showRefs && (
            <div className="mt-3 space-y-2">
              {event.scripture_refs.map((ref) => (
                <div
                  key={ref.id}
                  className="text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                >
                  <span className="font-medium text-gray-300">
                    {ref.book}
                    {ref.chapter ? `, ${ref.chapter}` : ""}
                    {ref.verse_range ? `:${ref.verse_range}` : ""}
                  </span>
                  <p className="text-gray-500 mt-1 line-clamp-3">
                    {ref.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

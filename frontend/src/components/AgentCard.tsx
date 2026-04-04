import { useState } from "react";
import { Streamdown } from "streamdown";
import type { CouncilEvent, Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  event: CouncilEvent;
}

export function AgentCard({ event }: Props) {
  const [showRefs, setShowRefs] = useState(false);
  const faith = event.faith as Faith | null;
  const meta = faith ? FAITH_META[faith] : null;
  const color = meta?.color ?? "#888";

  return (
    <div className="rounded-xl bg-surface-2 border border-white/5 overflow-hidden transition-all hover:border-white/10">
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: `linear-gradient(to right, ${color}15, transparent)`,
        }}
      >
        <span className="text-2xl">{meta?.icon ?? "🌍"}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">
            {event.agent_name ?? "Council Moderator"}
          </h3>
          <p className="text-xs text-gray-400">
            {meta?.label ?? "Synthesis"}
          </p>
        </div>
        <div
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {meta?.scripture ?? "Report"}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
          <Streamdown>{event.content}</Streamdown>
        </div>
      </div>

      {event.scripture_refs.length > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="text-xs flex items-center gap-1.5 text-accent/80 hover:text-accent transition-colors cursor-pointer"
          >
            <span>{showRefs ? "▾" : "▸"}</span>
            {showRefs ? "Hide" : "Show"} scripture references ({event.scripture_refs.length})
          </button>
          {showRefs && (
            <div className="mt-3 space-y-2">
              {event.scripture_refs.map((ref) => (
                <div
                  key={ref.id}
                  className="text-xs rounded-lg px-3 py-2 border border-white/5"
                  style={{ backgroundColor: `${color}08` }}
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

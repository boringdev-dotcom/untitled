import { useState } from "react";
import { Streamdown } from "streamdown";
import type { CouncilEvent, Faith } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  event: CouncilEvent;
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function AgentCard({ event }: Props) {
  const [showRefs, setShowRefs] = useState(false);
  const faith = event.faith as Faith | null;
  const meta = faith ? FAITH_META[faith] : null;
  const color = meta?.color ?? "var(--color-tertiary)";
  const symbol = faith ? FAITH_SYMBOL[faith] : "history_edu";

  return (
    <article
      className="relative rounded-sm bg-surface-container-lowest ambient-shadow overflow-hidden"
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <header className="px-6 pt-5 pb-4 flex items-start gap-4 border-b border-outline-variant/20">
        <div
          className="w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ghost-border"
          style={{
            background: `color-mix(in srgb, ${color} 12%, var(--color-surface-container-low))`,
          }}
        >
          <Icon
            name={symbol}
            filled
            className="text-[22px]"
            style={{ color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-label text-[10px] uppercase tracking-[0.22em] mb-1"
            style={{ color }}
          >
            {meta?.label ?? "Moderator"}
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface leading-tight">
            {event.agent_name ?? "Council Scribe"}
          </h3>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mt-1">
            {meta?.scripture ?? "Synthesis"}
          </p>
        </div>
        <Icon
          name="format_quote"
          className="text-[20px] text-outline-variant shrink-0"
        />
      </header>

      <div className="px-6 py-5">
        <div className="prose-scriptorium text-[15px]">
          <Streamdown>{event.content}</Streamdown>
        </div>
      </div>

      {event.scripture_refs.length > 0 && (
        <div className="px-6 pb-5 border-t border-outline-variant/20 pt-4">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.22em] text-secondary hover:text-primary transition-colors cursor-pointer"
            aria-expanded={showRefs}
          >
            <Icon
              name={showRefs ? "expand_less" : "expand_more"}
              className="text-[16px]"
            />
            {showRefs ? "Hide" : "Show"} Citations ({event.scripture_refs.length})
          </button>
          {showRefs && (
            <div className="mt-4 space-y-3">
              {event.scripture_refs.map((ref) => (
                <div
                  key={ref.id}
                  className="rounded-sm px-4 py-3 bg-surface-container-low"
                  style={{
                    borderLeft: `2px solid ${color}`,
                  }}
                >
                  <div className="font-label text-[10px] uppercase tracking-[0.22em] text-secondary mb-1.5">
                    {ref.book}
                    {ref.chapter ? ` · ${ref.chapter}` : ""}
                    {ref.verse_range ? `:${ref.verse_range}` : ""}
                  </div>
                  <p className="font-headline italic text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                    "{ref.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

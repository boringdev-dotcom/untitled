import { useState } from "react";
import type { Faith, FaithPairAgreement } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  agreements: FaithPairAgreement[];
  faiths: Faith[];
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

function scoreStyle(score: number): React.CSSProperties {
  if (score >= 0.66) {
    return {
      background: `color-mix(in srgb, var(--color-secondary-container) ${40 + score * 60}%, var(--color-surface-container-lowest))`,
      color: "var(--color-on-secondary-container)",
    };
  }
  if (score <= 0.33) {
    return {
      background: `color-mix(in srgb, var(--color-primary) ${15 + (1 - score) * 25}%, var(--color-surface-container-lowest))`,
      color: "var(--color-primary)",
    };
  }
  return {
    background: "var(--color-surface-container)",
    color: "var(--color-on-surface-variant)",
  };
}

function getScore(
  agreements: FaithPairAgreement[],
  a: string,
  b: string
): FaithPairAgreement | undefined {
  return agreements.find(
    (ag) =>
      (ag.faith_a === a && ag.faith_b === b) ||
      (ag.faith_a === b && ag.faith_b === a)
  );
}

export function AgreementMatrix({ agreements, faiths }: Props) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="h-full rounded-sm bg-surface-container-highest p-8">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-3">
        <div>
          <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary mb-1">
            Agreement Matrix
          </div>
          <h3 className="font-headline italic text-xl text-on-surface">
            Cross-Traditional Syncretism
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <span className="font-label uppercase tracking-wider text-on-surface-variant">
              Tension
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-secondary-container" />
            <span className="font-label uppercase tracking-wider text-on-surface-variant">
              Equilibrium
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto thin-scrollbar">
        <div
          className="grid gap-2 w-fit min-w-full"
          style={{
            gridTemplateColumns: `9rem repeat(${faiths.length}, minmax(4rem, 1fr))`,
          }}
        >
          <div className="h-12" />
          {faiths.map((f) => (
            <div
              key={`h-${f}`}
              className="h-12 flex items-center justify-center"
              title={FAITH_META[f].label}
            >
              <Icon
                name={FAITH_SYMBOL[f]}
                className="text-[22px]"
                style={{ color: FAITH_META[f].color }}
              />
            </div>
          ))}

          {faiths.map((row) => (
            <div
              key={`row-${row}`}
              className="contents"
            >
              <div
                className="h-12 flex items-center gap-2 pr-3 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface font-bold"
                title={FAITH_META[row].label}
              >
                <Icon
                  name={FAITH_SYMBOL[row]}
                  className="text-[16px]"
                  style={{ color: FAITH_META[row].color }}
                />
                <span>{FAITH_META[row].label}</span>
              </div>
              {faiths.map((col) => {
                if (row === col) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="h-12 rounded-sm flex items-center justify-center text-[10px] text-outline-variant"
                      style={{
                        background: "var(--color-surface-container-low)",
                      }}
                    >
                      —
                    </div>
                  );
                }
                const pair = getScore(agreements, row, col);
                const score = pair?.score ?? 0.5;
                return (
                  <div
                    key={`${row}-${col}`}
                    className="h-12 rounded-sm flex items-center justify-center font-label text-xs font-bold cursor-default transition-transform hover:scale-105 ghost-border"
                    style={scoreStyle(score)}
                    onMouseEnter={(e) => {
                      if (pair?.summary) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          text: pair.summary,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {score.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 max-w-xs px-4 py-3 rounded-sm bg-tertiary text-tertiary-fixed text-xs shadow-xl pointer-events-none font-body leading-relaxed"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { Faith, FaithPairAgreement } from "../types";
import { FAITH_META } from "../types";

interface Props {
  agreements: FaithPairAgreement[];
  faiths: Faith[];
}

function scoreToColor(score: number): string {
  const hue = score * 120;
  return `hsl(${hue}, 70%, 40%)`;
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
    <div className="rounded-xl bg-surface-2 border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Agreement Matrix
      </h3>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 w-fit mx-auto"
          style={{
            gridTemplateColumns: `2.5rem repeat(${faiths.length}, 3.5rem)`,
          }}
        >
          {/* Header row */}
          <div />
          {faiths.map((f) => (
            <div
              key={`h-${f}`}
              className="text-center text-lg"
              title={FAITH_META[f].label}
            >
              {FAITH_META[f].icon}
            </div>
          ))}

          {/* Data rows */}
          {faiths.map((row) => (
            <>
              <div
                key={`r-${row}`}
                className="text-lg flex items-center justify-center"
                title={FAITH_META[row].label}
              >
                {FAITH_META[row].icon}
              </div>
              {faiths.map((col) => {
                if (row === col) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-14 h-10 rounded flex items-center justify-center text-[10px] text-gray-600"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                    >
                      --
                    </div>
                  );
                }
                const pair = getScore(agreements, row, col);
                const score = pair?.score ?? 0.5;
                return (
                  <div
                    key={`${row}-${col}`}
                    className="w-14 h-10 rounded flex items-center justify-center text-xs font-medium text-white cursor-default transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: scoreToColor(score) }}
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
                    {score.toFixed(1)}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 max-w-xs px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-xs text-gray-300 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-500">
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: scoreToColor(0) }}
        />
        <span>Disagree</span>
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: scoreToColor(0.5) }}
        />
        <span>Mixed</span>
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: scoreToColor(1) }}
        />
        <span>Agree</span>
      </div>
    </div>
  );
}

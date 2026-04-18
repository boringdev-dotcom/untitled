import { useState } from "react";
import type { AnalysisTheme, Faith } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  themes: AnalysisTheme[];
}

const STANCE_META: Record<
  string,
  { icon: string; label: string; color: string; bg: string }
> = {
  agree: {
    icon: "check",
    label: "Agree",
    color: "var(--color-on-secondary-container)",
    bg: "var(--color-secondary-container)",
  },
  disagree: {
    icon: "close",
    label: "Disagree",
    color: "var(--color-primary)",
    bg: "color-mix(in srgb, var(--color-primary) 15%, var(--color-surface-container-lowest))",
  },
  nuanced: {
    icon: "balance",
    label: "Nuanced",
    color: "var(--color-secondary)",
    bg: "var(--color-surface-container)",
  },
};

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function ThemeBreakdown({ themes }: Props) {
  const [hovered, setHovered] = useState<{
    theme: number;
    faith: string;
  } | null>(null);

  return (
    <div className="h-full rounded-sm bg-surface-container-low p-8">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <div>
          <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary mb-1">
            Thematic Nodes
          </div>
          <h3 className="font-headline italic text-xl text-on-surface">
            Key Themes
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {themes.map((theme, ti) => {
          const agreeCount = theme.positions.filter(
            (p) => p.stance === "agree"
          ).length;
          const total = theme.positions.length;
          const alignment = total > 0 ? agreeCount / total : 0;
          const isTension = alignment < 0.5;

          return (
            <div
              key={ti}
              className="p-5 rounded-sm bg-surface-container-lowest ghost-border"
              style={{
                borderLeft: `3px solid ${isTension ? "var(--color-primary)" : "var(--color-secondary)"}`,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4
                  className="font-headline text-lg font-bold leading-tight"
                  style={{
                    color: isTension
                      ? "var(--color-primary)"
                      : "var(--color-secondary)",
                  }}
                >
                  {theme.name}
                </h4>
                <span className="font-label text-[9px] uppercase tracking-[0.22em] text-outline shrink-0">
                  {isTension ? "High Tension" : "Alignment"}
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant mb-4 leading-relaxed">
                {theme.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {theme.positions.map((pos) => {
                  const faith = pos.faith.toLowerCase() as Faith;
                  const meta = FAITH_META[faith];
                  if (!meta) return null;
                  const stance = STANCE_META[pos.stance] ?? STANCE_META.nuanced;
                  const isHovered =
                    hovered?.theme === ti && hovered?.faith === pos.faith;

                  return (
                    <div
                      key={pos.faith}
                      className="relative"
                      onMouseEnter={() =>
                        setHovered({ theme: ti, faith: pos.faith })
                      }
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm cursor-default ghost-border"
                        style={{ background: stance.bg }}
                      >
                        <Icon
                          name={FAITH_SYMBOL[faith]}
                          className="text-[14px]"
                          style={{ color: meta.color }}
                        />
                        <Icon
                          name={stance.icon}
                          className="text-[12px]"
                          style={{ color: stance.color }}
                        />
                      </div>
                      {isHovered && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-sm bg-tertiary text-tertiary-fixed text-[11px] shadow-xl pointer-events-none">
                          <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                            {meta.label} · {stance.label}
                          </span>
                          <p className="font-body mt-1 leading-relaxed">
                            {pos.brief}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

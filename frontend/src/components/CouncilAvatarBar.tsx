import type { Faith } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  faiths: Faith[];
  speakingFaith: Faith | null;
  respondedFaiths: Faith[];
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function CouncilAvatarBar({
  faiths,
  speakingFaith,
  respondedFaiths,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-10 mb-12 flex-wrap">
      {faiths.map((faith) => {
        const meta = FAITH_META[faith];
        const isSpeaking = speakingFaith === faith;
        const hasResponded = respondedFaiths.includes(faith);

        return (
          <div
            key={faith}
            className="flex flex-col items-center gap-2 transition-all duration-500"
            style={{ transform: isSpeaking ? "scale(1.08)" : "scale(1)" }}
          >
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-sm flex items-center justify-center transition-all duration-500 ghost-border ${
                  isSpeaking ? "ambient-shadow" : ""
                }`}
                style={{
                  background:
                    hasResponded || isSpeaking
                      ? `color-mix(in srgb, ${meta.color} 16%, var(--color-surface-container-lowest))`
                      : "var(--color-surface-container)",
                }}
              >
                <Icon
                  name={FAITH_SYMBOL[faith]}
                  filled={isSpeaking || hasResponded}
                  className="text-[24px]"
                  style={{ color: meta.color }}
                />
                {isSpeaking && (
                  <span
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      border: `2px solid ${meta.color}`,
                      animation: "pulse-ring 1.5s ease-out infinite",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-headline text-sm font-bold ${
                  isSpeaking
                    ? "text-primary"
                    : hasResponded
                      ? "text-on-surface"
                      : "text-outline"
                }`}
              >
                {meta.agentName}
              </div>
              <div className="font-label text-[9px] uppercase tracking-[0.22em] text-secondary">
                {isSpeaking
                  ? "Speaking"
                  : hasResponded
                    ? "Spoken"
                    : "Awaiting"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

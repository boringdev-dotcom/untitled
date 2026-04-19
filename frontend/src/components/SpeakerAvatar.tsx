import type { Faith } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  faith: Faith;
  isActive: boolean;
  hasSpoken: boolean;
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function SpeakerAvatar({ faith, isActive, hasSpoken }: Props) {
  const meta = FAITH_META[faith];

  return (
    <div
      className="flex flex-col items-center gap-3 transition-all duration-500"
      style={{ transform: isActive ? "scale(1.08)" : "scale(1)" }}
    >
      <div className="relative">
        <div
          className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-1 transition-all duration-500 ghost-border ${
            isActive ? "ambient-shadow-lg" : ""
          }`}
          style={{
            background: isActive
              ? `color-mix(in srgb, ${meta.color} 22%, var(--color-surface-container-lowest))`
              : hasSpoken
                ? `color-mix(in srgb, ${meta.color} 10%, var(--color-surface-container-lowest))`
                : "var(--color-surface-container)",
            boxShadow: isActive
              ? `0 0 0 2px ${meta.color}, 0 0 28px 4px color-mix(in srgb, ${meta.color} 35%, transparent)`
              : undefined,
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: isActive
                ? `color-mix(in srgb, ${meta.color} 14%, var(--color-surface-container-low))`
                : "var(--color-surface-container-low)",
            }}
          >
            <Icon
              name={FAITH_SYMBOL[faith]}
              filled={isActive}
              className="text-[40px]"
              style={{ color: meta.color }}
            />
          </div>
        </div>

        {isActive && (
          <>
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `2px solid ${meta.color}`,
                animation: "pulse-ring 1.8s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `2px solid ${meta.color}`,
                animation: "pulse-ring 1.8s ease-out infinite 0.6s",
                opacity: 0.5,
              }}
            />
          </>
        )}
      </div>

      <div className="text-center">
        <div
          className={`font-headline text-lg font-bold leading-tight ${
            isActive ? "text-primary" : hasSpoken ? "text-on-surface" : "text-outline"
          }`}
        >
          {meta.agentName}
        </div>
        <div
          className="font-label text-[10px] uppercase tracking-[0.25em] mt-1"
          style={{
            color: isActive
              ? "var(--color-secondary)"
              : "var(--color-on-surface-variant)",
          }}
        >
          {isActive ? "Speaking now" : hasSpoken ? "Spoken" : "Listening"}
        </div>
      </div>
    </div>
  );
}

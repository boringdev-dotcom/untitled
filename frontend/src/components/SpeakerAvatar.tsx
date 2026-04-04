import type { Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  faith: Faith;
  isActive: boolean;
  hasSpoken: boolean;
}

export function SpeakerAvatar({ faith, isActive, hasSpoken }: Props) {
  const meta = FAITH_META[faith];

  return (
    <div
      className="flex flex-col items-center gap-2 transition-all duration-500"
      style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
    >
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500"
          style={{
            backgroundColor: isActive
              ? `color-mix(in srgb, ${meta.color} 25%, transparent)`
              : hasSpoken
                ? `color-mix(in srgb, ${meta.color} 12%, transparent)`
                : "rgba(255,255,255,0.05)",
            boxShadow: isActive
              ? `0 0 24px 8px color-mix(in srgb, ${meta.color} 40%, transparent), 0 0 48px 16px color-mix(in srgb, ${meta.color} 15%, transparent)`
              : "none",
          }}
        >
          {meta.icon}
        </div>

        {isActive && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${meta.color}`,
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${meta.color}`,
                animation: "pulse-ring 1.5s ease-out infinite 0.5s",
                opacity: 0.5,
              }}
            />
          </>
        )}
      </div>

      <div className="text-center">
        <span
          className={`text-xs font-semibold transition-colors duration-300 block ${
            isActive ? "text-white" : hasSpoken ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {meta.agentName}
        </span>
        {isActive && (
          <span
            className="text-[10px] font-medium animate-pulse"
            style={{ color: meta.color }}
          >
            Speaking...
          </span>
        )}
        {!isActive && hasSpoken && (
          <span className="text-[10px] text-gray-600">Spoke</span>
        )}
      </div>
    </div>
  );
}

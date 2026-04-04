import type { Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  faiths: Faith[];
  speakingFaith: Faith | null;
  respondedFaiths: Faith[];
}

export function CouncilAvatarBar({ faiths, speakingFaith, respondedFaiths }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {faiths.map((faith) => {
        const meta = FAITH_META[faith];
        const isSpeaking = speakingFaith === faith;
        const hasResponded = respondedFaiths.includes(faith);

        return (
          <div
            key={faith}
            className="flex flex-col items-center gap-1 transition-all duration-300"
            style={{
              transform: isSpeaking ? "scale(1.15)" : "scale(1)",
            }}
          >
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-xl"
              style={{
                backgroundColor: hasResponded || isSpeaking
                  ? `${meta.color}20`
                  : "rgba(255,255,255,0.05)",
                boxShadow: isSpeaking
                  ? `0 0 16px 4px ${meta.color}55`
                  : hasResponded
                    ? `0 0 8px 1px ${meta.color}22`
                    : "none",
              }}
            >
              {meta.icon}
              {isSpeaking && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${meta.color}`,
                    animation: "pulse-ring 1.5s ease-out infinite",
                  }}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isSpeaking
                  ? "text-white"
                  : hasResponded
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              {meta.agentName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

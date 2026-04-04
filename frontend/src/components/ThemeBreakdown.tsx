import { useState } from "react";
import type { AnalysisTheme, Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  themes: AnalysisTheme[];
}

const STANCE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  agree: { bg: "bg-green-500/20", text: "text-green-400", label: "✓" },
  disagree: { bg: "bg-red-500/20", text: "text-red-400", label: "✗" },
  nuanced: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "~" },
};

export function ThemeBreakdown({ themes }: Props) {
  const [hoveredPosition, setHoveredPosition] = useState<{
    theme: number;
    faith: string;
  } | null>(null);

  return (
    <div className="rounded-xl bg-surface-2 border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Key Themes
      </h3>
      <div className="space-y-3">
        {themes.map((theme, ti) => (
          <div
            key={ti}
            className="rounded-lg bg-white/[0.02] border border-white/5 p-3"
          >
            <h4 className="text-xs font-semibold text-gray-200 mb-1">
              {theme.name}
            </h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-snug">
              {theme.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {theme.positions.map((pos) => {
                const faith = pos.faith.toLowerCase() as Faith;
                const meta = FAITH_META[faith];
                if (!meta) return null;
                const style = STANCE_STYLE[pos.stance] ?? STANCE_STYLE.nuanced;
                const isHovered =
                  hoveredPosition?.theme === ti &&
                  hoveredPosition?.faith === pos.faith;

                return (
                  <div
                    key={pos.faith}
                    className="relative"
                    onMouseEnter={() =>
                      setHoveredPosition({ theme: ti, faith: pos.faith })
                    }
                    onMouseLeave={() => setHoveredPosition(null)}
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${style.bg} cursor-default transition-transform hover:scale-105`}
                    >
                      <span className="text-sm">{meta.icon}</span>
                      <span className={`text-[10px] font-bold ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    {isHovered && (
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-[11px] text-gray-300 shadow-xl pointer-events-none">
                        <span className="font-medium text-white">
                          {meta.label}:
                        </span>{" "}
                        {pos.brief}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-[10px] text-gray-500">
        {Object.entries(STANCE_STYLE).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className={`w-4 h-4 rounded-full ${s.bg} ${s.text} flex items-center justify-center text-[8px] font-bold`}
            >
              {s.label}
            </span>
            <span className="capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

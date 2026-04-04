import type { CouncilEvent, Faith } from "../types";
import { FAITH_META } from "../types";

interface Props {
  opinionEvents: CouncilEvent[];
}

export function ScriptureStats({ opinionEvents }: Props) {
  const counts: { faith: Faith; count: number }[] = opinionEvents
    .filter((e) => e.faith)
    .map((e) => ({
      faith: e.faith as Faith,
      count: e.scripture_refs.length,
    }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="rounded-xl bg-surface-2 border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Scripture Citations
      </h3>
      <div className="space-y-3">
        {counts.map(({ faith, count }) => {
          const meta = FAITH_META[faith];
          if (!meta) return null;
          const pct = (count / maxCount) * 100;

          return (
            <div key={faith} className="flex items-center gap-3">
              <span className="text-lg w-7 shrink-0 text-center">
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{meta.label}</span>
                  <span className="text-xs font-medium text-gray-300">
                    {count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

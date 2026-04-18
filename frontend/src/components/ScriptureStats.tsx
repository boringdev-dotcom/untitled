import type { CouncilEvent, Faith } from "../types";
import { FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  opinionEvents: CouncilEvent[];
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function ScriptureStats({ opinionEvents }: Props) {
  const counts: { faith: Faith; count: number }[] = opinionEvents
    .filter((e) => e.faith)
    .map((e) => ({
      faith: e.faith as Faith,
      count: e.scripture_refs.length,
    }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  const total = counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="h-full rounded-sm bg-tertiary text-tertiary-fixed p-8 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-[0.08] pointer-events-none select-none flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon
          name="menu_book"
          filled
          className="text-secondary-fixed-dim"
          style={{ fontSize: "12rem" }}
        />
      </div>
      <div className="relative">
        <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary-fixed-dim mb-1">
          Sacred Text Citations
        </div>
        <h3 className="font-headline italic text-xl text-surface mb-1">
          Citation Volume
        </h3>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/60 mb-6">
          {total} Total References
        </p>

        <div className="space-y-5">
          {counts.map(({ faith, count }) => {
            const meta = FAITH_META[faith];
            if (!meta) return null;
            const pct = (count / maxCount) * 100;

            return (
              <div key={faith}>
                <div className="flex items-center justify-between mb-1.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      name={FAITH_SYMBOL[faith]}
                      className="text-[16px] shrink-0"
                      style={{ color: meta.color }}
                    />
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] truncate text-tertiary-fixed">
                      {meta.label}
                    </span>
                  </div>
                  <span className="font-label text-[10px] font-bold tracking-wider text-secondary-fixed-dim shrink-0">
                    {count} refs
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-tertiary-fixed/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(to right, ${meta.color}, color-mix(in srgb, ${meta.color} 60%, var(--color-secondary)))`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

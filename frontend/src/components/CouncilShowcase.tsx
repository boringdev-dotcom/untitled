import type { Faith } from "../types";
import { ALL_FAITHS, FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  selectedFaiths: Faith[];
  onToggleFaith: (faith: Faith) => void;
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function CouncilShowcase({ selectedFaiths, onToggleFaith }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
      {ALL_FAITHS.map((faith, i) => {
        const meta = FAITH_META[faith];
        const active = selectedFaiths.includes(faith);

        return (
          <button
            key={faith}
            type="button"
            onClick={() => onToggleFaith(faith)}
            className={`stagger-item group relative flex flex-col text-left rounded-sm overflow-hidden transition-all duration-500 cursor-pointer ${
              active
                ? "bg-surface-container-lowest ambient-shadow-lg -translate-y-0.5"
                : "bg-surface-container-low hover:bg-surface-container-lowest hover:-translate-y-0.5 hover:ambient-shadow"
            }`}
            style={{
              animationDelay: `${i * 90}ms`,
            }}
            aria-pressed={active}
            aria-label={`${active ? "Remove" : "Add"} ${meta.label} scholar`}
          >
            <div
              className={`h-1 w-full transition-all duration-500`}
              style={{
                background: active ? meta.color : "transparent",
              }}
            />
            <div className="px-6 pt-6 pb-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-sm flex items-center justify-center ghost-border"
                  style={{
                    background: active
                      ? `color-mix(in srgb, ${meta.color} 14%, transparent)`
                      : "var(--color-surface-container)",
                  }}
                >
                  <Icon
                    name={FAITH_SYMBOL[faith]}
                    filled={active}
                    className="text-[28px]"
                    style={{ color: meta.color }}
                  />
                </div>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-outline group-hover:bg-surface-container-highest"
                  }`}
                  aria-hidden="true"
                >
                  <Icon
                    name={active ? "check" : "add"}
                    className="text-[16px]"
                  />
                </div>
              </div>

              <div className="font-label text-[10px] uppercase tracking-[0.22em] text-secondary mb-2">
                {meta.label}
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight mb-2">
                {meta.agentName}
              </h3>
              <p className="font-body text-sm italic text-on-surface-variant leading-relaxed mb-5">
                {meta.tagline}
              </p>

              <div className="mt-auto pt-4 border-t border-outline-variant/25 flex items-center justify-between">
                <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                  {meta.scripture}
                </span>
                <span
                  className={`font-label text-[10px] uppercase tracking-[0.18em] font-bold transition-colors ${
                    active ? "text-primary" : "text-outline"
                  }`}
                >
                  {active ? "Seated" : "Invite"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

import type { Faith } from "../types";
import { ALL_FAITHS, FAITH_META } from "../types";
import { Icon } from "./Icon";

interface Props {
  selectedFaiths: Faith[];
  onToggle: (faith: Faith) => void;
}

const FAITH_SYMBOL: Record<Faith, string> = {
  hinduism: "self_improvement",
  islam: "star_half",
  christianity: "church",
  buddhism: "brightness_high",
  judaism: "candle",
};

export function FaithSelector({ selectedFaiths, onToggle }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
      <span className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary mr-1">
        Seated Scholars
      </span>
      {ALL_FAITHS.map((faith) => {
        const meta = FAITH_META[faith];
        const active = selectedFaiths.includes(faith);
        return (
          <button
            key={faith}
            type="button"
            title={`${active ? "Remove" : "Add"} ${meta.label}`}
            onClick={() => onToggle(faith)}
            aria-pressed={active}
            className={`relative w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 cursor-pointer ghost-border ${
              active ? "ambient-shadow" : "opacity-50 hover:opacity-100"
            }`}
            style={{
              background: active
                ? `color-mix(in srgb, ${meta.color} 14%, var(--color-surface-container-lowest))`
                : "var(--color-surface-container)",
            }}
          >
            <Icon
              name={FAITH_SYMBOL[faith]}
              filled={active}
              className="text-[20px]"
              style={{ color: meta.color }}
            />
          </button>
        );
      })}
    </div>
  );
}

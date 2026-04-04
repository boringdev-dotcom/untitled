import type { Faith } from "../types";
import { ALL_FAITHS, FAITH_META } from "../types";

interface Props {
  selectedFaiths: Faith[];
  onToggle: (faith: Faith) => void;
}

export function FaithSelector({ selectedFaiths, onToggle }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <span className="text-xs text-gray-500 mr-1">Council:</span>
      {ALL_FAITHS.map((faith) => {
        const meta = FAITH_META[faith];
        const active = selectedFaiths.includes(faith);
        return (
          <button
            key={faith}
            type="button"
            title={`${active ? "Remove" : "Add"} ${meta.label}`}
            onClick={() => onToggle(faith)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center
                       text-xl transition-all duration-200 cursor-pointer
                       border-2"
            style={{
              borderColor: active ? meta.color : "transparent",
              backgroundColor: active ? `${meta.color}15` : "rgba(255,255,255,0.03)",
              opacity: active ? 1 : 0.4,
              boxShadow: active ? `0 0 12px -2px ${meta.color}44` : "none",
            }}
          >
            {meta.icon}
          </button>
        );
      })}
    </div>
  );
}

import { ALL_FAITHS, FAITH_META } from "../types";

export function CouncilShowcase() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
      {ALL_FAITHS.map((faith, i) => {
        const meta = FAITH_META[faith];
        return (
          <div
            key={faith}
            className="stagger-item group relative rounded-2xl bg-surface-2 border border-white/5
                       p-5 text-center transition-all duration-300
                       hover:border-white/10 hover:-translate-y-1"
            style={{
              animationDelay: `${i * 100}ms`,
              "--glow-color": meta.color,
            } as React.CSSProperties}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                boxShadow: `0 0 30px -5px ${meta.color}33, inset 0 1px 0 ${meta.color}22`,
              }}
            />
            <span className="text-4xl block mb-3">{meta.icon}</span>
            <h3 className="text-white font-semibold text-sm">{meta.agentName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{meta.label}</p>
            <div
              className="mt-3 text-[10px] px-2 py-1 rounded-full inline-block font-medium"
              style={{
                backgroundColor: `${meta.color}15`,
                color: meta.color,
              }}
            >
              {meta.scripture}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 leading-snug italic">
              {meta.tagline}
            </p>
          </div>
        );
      })}
    </div>
  );
}

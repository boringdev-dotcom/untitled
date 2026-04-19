import { Streamdown } from "streamdown";
import type { CouncilEvent } from "../types";
import { Icon } from "./Icon";

interface Props {
  event: CouncilEvent;
}

export function ReportCard({ event }: Props) {
  return (
    <article className="stagger-item relative rounded-sm bg-surface-container-low ambient-shadow-lg overflow-hidden">
      {/* Spotlight decoration */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 10%, transparent) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      {/* Decorative Ω background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]"
        aria-hidden="true"
      >
        <span className="font-headline text-[22rem] leading-none text-primary">
          Ω
        </span>
      </div>

      <div className="relative z-10 px-8 md:px-14 py-12 md:py-16 max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <Icon
            name="edit_square"
            className="text-[32px] text-secondary mx-auto mb-3"
          />
          <h3 className="font-headline text-3xl md:text-4xl font-bold italic text-on-surface mb-3">
            The Scribe's Conclusion
          </h3>
          <div className="flex justify-center">
            <span className="flourish" aria-hidden="true" />
          </div>
        </header>

        <div className="prose-scriptorium illuminated-letter text-lg leading-[1.8]">
          <Streamdown>{event.content}</Streamdown>
        </div>

        <footer className="mt-12 pt-6 border-t border-outline-variant/30 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary">
              Authorized By
            </div>
            <div className="font-headline text-base font-bold mt-1">
              The Council Scribe
            </div>
          </div>
          <div className="text-right">
            <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary">
              Session Stamped
            </div>
            <div className="font-body text-sm mt-1">
              A.S. MMXXVI · {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

import { Icon } from "./Icon";

interface Props {
  consensus: number;
  strongestAgreement: string;
  strongestDisagreement: string;
}

export function ConsensusGauge({
  consensus,
  strongestAgreement,
  strongestDisagreement,
}: Props) {
  const pct = Math.round(consensus * 100);
  const turns = Math.max(0, Math.min(1, consensus));

  return (
    <div className="h-full rounded-sm bg-surface-container-low p-8 flex flex-col">
      <div className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary mb-1">
        Active Session Consensus
      </div>
      <h3 className="font-headline italic text-xl text-on-surface mb-6">
        Harmonic Convergence
      </h3>

      <div className="flex items-center justify-center mb-6">
        <div
          className="relative w-48 h-48 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(var(--color-primary) 0% ${turns * 100}%, var(--color-surface-container-high) ${turns * 100}% 100%)`,
          }}
          role="img"
          aria-label={`${pct}% consensus`}
        >
          <div className="absolute w-40 h-40 bg-surface-container-low rounded-full flex flex-col items-center justify-center text-center">
            <span className="font-headline text-5xl font-bold text-primary leading-none">
              {pct}%
            </span>
            <span className="font-label text-[9px] uppercase tracking-[0.25em] text-secondary mt-2">
              Unified Core
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <div className="flex items-start gap-3 text-sm">
          <span className="shrink-0 w-7 h-7 rounded-sm bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <Icon name="check" className="text-[16px]" filled />
          </span>
          <p className="text-on-surface-variant leading-snug font-body">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary block mb-0.5">
              Strongest Agreement
            </span>
            {strongestAgreement}
          </p>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <span className="shrink-0 w-7 h-7 rounded-sm bg-error-container text-on-error-container flex items-center justify-center">
            <Icon name="bolt" className="text-[16px]" filled />
          </span>
          <p className="text-on-surface-variant leading-snug font-body">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary block mb-0.5">
              Strongest Disagreement
            </span>
            {strongestDisagreement}
          </p>
        </div>
      </div>
    </div>
  );
}

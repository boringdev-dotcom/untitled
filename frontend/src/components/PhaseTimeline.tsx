import type { Phase } from "../types";
import { Icon } from "./Icon";

interface Props {
  currentPhase: Phase | null;
  completedPhases: Phase[];
  isLoading: boolean;
}

const STEPS: { phase: Phase; label: string; icon: string; roman: string }[] = [
  { phase: "opinion", label: "Thesis", icon: "forum", roman: "I" },
  { phase: "rebuttal", label: "Dialectic", icon: "swap_horiz", roman: "II" },
  { phase: "report", label: "Convergence", icon: "edit_square", roman: "III" },
  { phase: "analysis", label: "Analytics", icon: "analytics", roman: "IV" },
];

export function PhaseTimeline({
  currentPhase,
  completedPhases,
  isLoading,
}: Props) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-y-5 mb-12">
      {STEPS.map((step, i) => {
        const isCompleted = completedPhases.includes(step.phase);
        const isActive = currentPhase === step.phase && isLoading;
        const isReached = isCompleted || isActive || currentPhase === step.phase;

        return (
          <div key={step.phase} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-sm flex items-center justify-center transition-all duration-500 ghost-border ${
                    isCompleted
                      ? "bg-secondary-container text-on-secondary-container"
                      : isActive
                        ? "wax-seal text-on-primary"
                        : isReached
                          ? "bg-surface-container-highest text-on-surface"
                          : "bg-surface-container-low text-outline"
                  }`}
                >
                  {isCompleted ? (
                    <Icon name="check" filled className="text-[20px]" />
                  ) : (
                    <Icon
                      name={step.icon}
                      filled={isActive}
                      className="text-[20px]"
                    />
                  )}
                </div>
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      border: `2px solid var(--color-primary)`,
                      animation: "pulse-ring 1.6s ease-out infinite",
                    }}
                  />
                )}
              </div>
              <div className="text-center">
                <div className="font-label text-[9px] uppercase tracking-[0.3em] text-secondary">
                  Phase {step.roman}
                </div>
                <div
                  className={`font-headline text-sm italic ${
                    isReached ? "text-on-surface" : "text-outline"
                  }`}
                >
                  {step.label}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-10 sm:w-20 h-px mx-3 mb-10 transition-colors duration-500 ${
                  completedPhases.includes(step.phase)
                    ? "bg-secondary/60"
                    : "bg-outline-variant/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

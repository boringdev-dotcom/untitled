import type { Phase } from "../types";

interface Props {
  currentPhase: Phase | null;
  completedPhases: Phase[];
  isLoading: boolean;
}

const STEPS: { phase: Phase; label: string; icon: string }[] = [
  { phase: "opinion", label: "Opinions", icon: "💬" },
  { phase: "rebuttal", label: "Cross-Examination", icon: "⚖️" },
  { phase: "report", label: "Synthesis", icon: "📜" },
  { phase: "analysis", label: "Analytics", icon: "📊" },
];

export function PhaseTimeline({ currentPhase, completedPhases, isLoading }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, i) => {
        const isCompleted = completedPhases.includes(step.phase);
        const isActive = currentPhase === step.phase && isLoading;
        const isReached = isCompleted || isActive || currentPhase === step.phase;

        return (
          <div key={step.phase} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300 relative
                  ${isCompleted ? "bg-accent/20" : ""}
                  ${isActive ? "bg-accent/20" : ""}
                  ${!isReached ? "bg-white/5 opacity-40" : ""}
                `}
              >
                {isCompleted ? (
                  <span className="text-accent text-sm">✓</span>
                ) : (
                  <span>{step.icon}</span>
                )}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-30"
                  />
                )}
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isReached ? "text-gray-200" : "text-gray-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-colors duration-300 ${
                  completedPhases.includes(step.phase) ? "bg-accent/40" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

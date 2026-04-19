import { useState } from "react";
import type { Faith } from "../types";
import { FaithSelector } from "./FaithSelector";
import { Icon } from "./Icon";

const EXAMPLE_QUESTIONS: { text: string; icon: string }[] = [
  { text: "What is the meaning of suffering?", icon: "whatshot" },
  { text: "How should one live a virtuous life?", icon: "local_florist" },
  { text: "What happens after death?", icon: "brightness_4" },
  { text: "Is there free will, or is everything predestined?", icon: "psychology" },
  { text: "What is the nature of God or the divine?", icon: "auto_awesome" },
];

interface Props {
  onSubmit: (question: string, faiths?: Faith[]) => void;
  isLoading: boolean;
  onCancel: () => void;
  selectedFaiths: Faith[];
  onToggleFaith: (faith: Faith) => void;
  liveMode?: boolean;
}

export function QuestionInput({
  onSubmit,
  isLoading,
  onCancel,
  selectedFaiths,
  onToggleFaith,
  liveMode = false,
}: Props) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || selectedFaiths.length === 0) return;
    onSubmit(q, selectedFaiths);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <FaithSelector selectedFaiths={selectedFaiths} onToggle={onToggleFaith} />

      <div className="rounded-sm bg-surface-container-lowest ambient-shadow-lg overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <label
            htmlFor="council-question"
            className="font-label text-[10px] uppercase tracking-[0.25em] text-secondary block mb-2"
          >
            Your Inquiry
          </label>
          <textarea
            id="council-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pose a philosophical question for the Council to deliberate..."
            rows={3}
            className="w-full bg-transparent font-headline text-xl md:text-2xl text-on-surface placeholder:text-on-surface-variant/50 placeholder:italic placeholder:font-headline resize-none focus:outline-none leading-relaxed"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 bg-surface-container-low border-t border-outline-variant/20">
          <span className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
            {selectedFaiths.length === 0
              ? "Seat at least one scholar"
              : `${selectedFaiths.length} scholar${selectedFaiths.length !== 1 ? "s" : ""} seated · ⌘ + Enter to send`}
          </span>
          <div className="flex gap-3 sm:justify-end">
            {isLoading ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-sm bg-error-container text-on-error-container font-label text-[11px] uppercase tracking-[0.2em] hover:brightness-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Icon name="stop_circle" className="text-[16px]" />
                Cancel
              </button>
            ) : (
              <button
                type="submit"
                disabled={!question.trim() || selectedFaiths.length === 0}
                className="wax-seal px-6 py-2.5 rounded-sm text-on-primary font-label text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <Icon
                  name={liveMode ? "podcasts" : "gavel"}
                  filled
                  className="text-[16px]"
                />
                {liveMode ? "Convene Live" : "Convene the Scriptorium"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary mb-4">
          Thematic Presets
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_QUESTIONS.map((eq, i) => (
            <button
              key={eq.text}
              type="button"
              onClick={() => setQuestion(eq.text)}
              className="group text-left px-5 py-4 rounded-sm bg-surface-container-low hover:bg-surface-container-lowest ghost-border transition-all cursor-pointer flex items-center gap-4 border-l-2 border-secondary/30 hover:border-secondary"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Icon
                name={eq.icon}
                className="text-[20px] text-secondary shrink-0 group-hover:text-primary transition-colors"
              />
              <span className="font-body text-sm text-on-surface-variant group-hover:text-on-surface transition-colors italic">
                {eq.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

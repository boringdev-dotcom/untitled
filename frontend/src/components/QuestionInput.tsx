import { useState } from "react";
import type { Faith } from "../types";
import { FaithSelector } from "./FaithSelector";

const EXAMPLE_QUESTIONS = [
  { text: "What is the meaning of suffering?", icon: "🔥" },
  { text: "How should one live a virtuous life?", icon: "🌿" },
  { text: "What happens after death?", icon: "🌅" },
  { text: "Is there free will, or is everything predestined?", icon: "🔮" },
  { text: "What is the nature of God or the divine?", icon: "✨" },
];

interface Props {
  onSubmit: (question: string, faiths?: Faith[]) => void;
  isLoading: boolean;
  onCancel: () => void;
  selectedFaiths: Faith[];
  onToggleFaith: (faith: Faith) => void;
}

export function QuestionInput({
  onSubmit,
  isLoading,
  onCancel,
  selectedFaiths,
  onToggleFaith,
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

      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the Council a philosophical question..."
          rows={3}
          className="w-full rounded-xl bg-surface-2 border border-white/10 px-5 py-4 text-gray-100
                     placeholder-gray-500 resize-none focus:outline-none focus:ring-2
                     focus:ring-accent/50 focus:border-accent/50 transition-all"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-600">
            {selectedFaiths.length === 0
              ? "Select at least one faith above"
              : `${selectedFaiths.length} scholar${selectedFaiths.length !== 1 ? "s" : ""} selected`}
          </span>
          <div className="flex gap-3">
            {isLoading ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white
                           font-medium transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
            ) : (
              <button
                type="submit"
                disabled={!question.trim() || selectedFaiths.length === 0}
                className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/80 text-white
                           font-medium transition-colors disabled:opacity-40
                           disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                Ask the Council
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
          Try asking
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_QUESTIONS.map((eq) => (
            <button
              key={eq.text}
              type="button"
              onClick={() => setQuestion(eq.text)}
              className="text-left text-sm px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5
                         text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] hover:border-white/10
                         transition-all cursor-pointer flex items-center gap-3"
            >
              <span className="text-lg shrink-0">{eq.icon}</span>
              {eq.text}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

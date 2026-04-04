import { useState } from "react";
import type { Faith } from "../types";

const EXAMPLE_QUESTIONS = [
  "What is the meaning of suffering?",
  "How should one live a virtuous life?",
  "What happens after death?",
  "Is there free will, or is everything predestined?",
  "What is the nature of God or the divine?",
];

interface Props {
  onSubmit: (question: string, faiths?: Faith[]) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function QuestionInput({ onSubmit, isLoading, onCancel }: Props) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    onSubmit(q);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
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
        <div className="flex justify-end mt-3 gap-3">
          {isLoading ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white
                         font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              disabled={!question.trim()}
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/80 text-white
                         font-medium transition-colors disabled:opacity-40
                         disabled:cursor-not-allowed cursor-pointer"
            >
              Ask the Council
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
          Example questions
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => setQuestion(eq)}
              className="text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10
                         text-gray-400 hover:text-gray-200 hover:bg-white/10
                         transition-colors cursor-pointer"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

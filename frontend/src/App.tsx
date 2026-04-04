import { useCallback, useEffect, useMemo, useState } from "react";
import { CouncilSession } from "./components/CouncilSession";
import { CouncilShowcase } from "./components/CouncilShowcase";
import { QuestionInput } from "./components/QuestionInput";
import { useCouncilStream } from "./hooks/useCouncilStream";
import { useSharedSession } from "./hooks/useSharedSession";
import type { Faith } from "./types";
import { ALL_FAITHS } from "./types";

function getSharedSessionId(): string | null {
  const match = window.location.pathname.match(/^\/s\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const sharedId = useMemo(() => getSharedSessionId(), []);
  const shared = useSharedSession(sharedId);

  const { events, isLoading, error, currentPhase, sessionId, ask, cancel } =
    useCouncilStream();

  const [selectedFaiths, setSelectedFaiths] = useState<Faith[]>([...ALL_FAITHS]);
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const hasSession = events.length > 0 || isLoading;
  const isSharedView = sharedId !== null;

  useEffect(() => {
    if (sessionId && window.location.pathname !== `/s/${sessionId}`) {
      window.history.pushState(null, "", `/s/${sessionId}`);
    }
  }, [sessionId]);

  const handleToggleFaith = useCallback((faith: Faith) => {
    setSelectedFaiths((prev) =>
      prev.includes(faith)
        ? prev.filter((f) => f !== faith)
        : [...prev, faith]
    );
  }, []);

  const handleSubmit = useCallback(
    (question: string, faiths?: Faith[]) => {
      setSubmittedQuestion(question);
      ask(question, faiths);
    },
    [ask]
  );

  const handleGoHome = () => {
    window.location.href = "/";
  };

  if (isSharedView) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-white/5 bg-surface-2/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Council of Faiths
              </h1>
              <p className="text-xs text-gray-500">
                Shared council session
              </p>
            </div>
            <button
              onClick={handleGoHome}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg
                         bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Ask Your Own Question
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-10">
          {shared.isLoading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.4s" }} />
              <span className="text-sm text-gray-400 ml-2">Loading session...</span>
            </div>
          )}

          {shared.error && (
            <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm text-center">
              {shared.error === "Session not found"
                ? "This session link is invalid or has expired."
                : shared.error}
            </div>
          )}

          {shared.session && (
            <CouncilSession
              events={shared.session.events}
              isLoading={false}
              currentPhase={null}
              question={shared.session.question}
              faiths={shared.session.faiths as Faith[]}
              sessionId={shared.session.id}
            />
          )}
        </main>

        <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
          Council of Faiths — Powered by Gemini
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-2/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Council of Faiths
            </h1>
            <p className="text-xs text-gray-500">
              Multi-agent scripture discussion platform
            </p>
          </div>
          {hasSession && (
            <button
              onClick={() => {
                cancel();
                setSubmittedQuestion("");
                window.history.pushState(null, "", "/");
              }}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg
                         bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              New Question
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        {!hasSession && (
          <>
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                Seek wisdom from the world's traditions
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Ask a philosophical question and hear perspectives from scholars
                of the world's great faiths — each grounded exclusively in
                their sacred scriptures.
              </p>
            </div>

            <div className="mb-12">
              <CouncilShowcase />
            </div>
          </>
        )}

        <QuestionInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={cancel}
          selectedFaiths={selectedFaiths}
          onToggleFaith={handleToggleFaith}
        />

        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <CouncilSession
          events={events}
          isLoading={isLoading}
          currentPhase={currentPhase}
          question={submittedQuestion}
          faiths={selectedFaiths}
          sessionId={sessionId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
        Council of Faiths — Powered by Gemini
      </footer>
    </div>
  );
}

export default App;

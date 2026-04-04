import { useCallback, useEffect, useMemo, useState } from "react";
import { CouncilSession } from "./components/CouncilSession";
import { CouncilShowcase } from "./components/CouncilShowcase";
import { LiveCouncilSession } from "./components/LiveCouncilSession";
import { QuestionInput } from "./components/QuestionInput";
import { useCouncilStream } from "./hooks/useCouncilStream";
import { useLiveCouncil } from "./hooks/useLiveCouncil";
import { useSharedSession } from "./hooks/useSharedSession";
import type { Faith } from "./types";
import { ALL_FAITHS } from "./types";

type CouncilMode = "ask" | "listen";

function getSharedSessionId(): string | null {
  const match = window.location.pathname.match(/^\/s\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const sharedId = useMemo(() => getSharedSessionId(), []);
  const shared = useSharedSession(sharedId);

  const { events, isLoading, error, currentPhase, sessionId, ask, cancel } =
    useCouncilStream();

  const live = useLiveCouncil();

  const [mode, setMode] = useState<CouncilMode>("ask");
  const [selectedFaiths, setSelectedFaiths] = useState<Faith[]>([...ALL_FAITHS]);
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const hasSession = events.length > 0 || isLoading;
  const hasLiveSession = live.phase !== "idle";
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
      if (mode === "listen") {
        live.start(question, faiths ?? selectedFaiths);
      } else {
        ask(question, faiths);
      }
    },
    [ask, live, mode, selectedFaiths]
  );

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReset = () => {
    cancel();
    live.stop();
    setSubmittedQuestion("");
    setMode("ask");
    window.history.pushState(null, "", "/");
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
          {(hasSession || hasLiveSession) && (
            <button
              onClick={handleReset}
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
        {!hasSession && !hasLiveSession && (
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

            {/* Mode Toggle */}
            <div className="flex items-center justify-center mb-10">
              <div className="inline-flex rounded-xl bg-surface-2 border border-white/10 p-1">
                <button
                  onClick={() => setMode("ask")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    mode === "ask"
                      ? "bg-accent text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Ask the Council
                </button>
                <button
                  onClick={() => setMode("listen")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    mode === "listen"
                      ? "bg-accent text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                    <path d="M19 10v2a7 7 0 01-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Listen Live
                </button>
              </div>
            </div>

            {mode === "listen" && (
              <div className="text-center mb-8 max-w-lg mx-auto">
                <p className="text-sm text-gray-500 leading-relaxed">
                  The scholars will have a live spoken debate about your question,
                  agreeing and disagreeing in real time — like a live audio space.
                </p>
              </div>
            )}

            <div className="mb-12">
              <CouncilShowcase />
            </div>
          </>
        )}

        {/* Question input — shown when no active session */}
        {!hasSession && !hasLiveSession && (
          <QuestionInput
            onSubmit={handleSubmit}
            isLoading={isLoading || live.phase === "connecting"}
            onCancel={mode === "listen" ? live.stop : cancel}
            selectedFaiths={selectedFaiths}
            onToggleFaith={handleToggleFaith}
            liveMode={mode === "listen"}
          />
        )}

        {/* Ask mode errors */}
        {mode === "ask" && error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Ask mode session */}
        {mode === "ask" && (
          <CouncilSession
            events={events}
            isLoading={isLoading}
            currentPhase={currentPhase}
            question={submittedQuestion}
            faiths={selectedFaiths}
            sessionId={sessionId}
          />
        )}

        {/* Live mode session */}
        {mode === "listen" && hasLiveSession && (
          <LiveCouncilSession
            phase={live.phase}
            faiths={selectedFaiths}
            activeSpeaker={live.activeSpeaker}
            transcripts={live.transcripts}
            currentRound={live.currentRound}
            currentRoundLabel={live.currentRoundLabel}
            statusText={live.statusText}
            error={live.error}
            player={live.player}
            question={submittedQuestion}
            onStop={live.stop}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
        Council of Faiths — Powered by Gemini
      </footer>
    </div>
  );
}

export default App;

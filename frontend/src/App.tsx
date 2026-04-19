import { useCallback, useEffect, useMemo, useState } from "react";
import { CouncilSession } from "./components/CouncilSession";
import { CouncilShowcase } from "./components/CouncilShowcase";
import { Icon } from "./components/Icon";
import { LiveCouncilSession } from "./components/LiveCouncilSession";
import { QuestionInput } from "./components/QuestionInput";
import { useCouncilStream } from "./hooks/useCouncilStream";
import { useLiveCouncil } from "./hooks/useLiveCouncil";
import { useLiveCouncilDemo } from "./hooks/useLiveCouncilDemo";
import { useSharedSession } from "./hooks/useSharedSession";
import type { Faith } from "./types";
import { ALL_FAITHS } from "./types";
import { DEMO_SESSION } from "./utils/demoData";

type CouncilMode = "ask" | "listen";

function getSharedSessionId(): string | null {
  const match = window.location.pathname.match(/^\/s\/(.+)$/);
  return match ? match[1] : null;
}

function TopNav({
  showReset,
  onReset,
  resetLabel,
}: {
  showReset?: boolean;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <nav className="glass-nav sticky top-0 z-40 border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm wax-seal flex items-center justify-center text-on-primary">
            <Icon name="menu_book" filled className="text-[20px]" />
          </div>
          <div className="leading-tight">
            <div className="font-headline italic font-bold text-xl text-primary tracking-tight">
              The Scriptorium
            </div>
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary">
              Council of Faiths
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a
            className="font-label text-[11px] uppercase tracking-[0.25em] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Assembly
          </a>
          <a
            className="font-label text-[11px] uppercase tracking-[0.25em] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Disputations
          </a>
          <a
            className="font-label text-[11px] uppercase tracking-[0.25em] text-on-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Archive
          </a>
        </div>
        <div className="flex items-center gap-3">
          {showReset && onReset && (
            <button
              onClick={onReset}
              className="font-label text-[11px] uppercase tracking-[0.2em] text-secondary hover:text-primary border-b border-secondary/40 hover:border-primary transition-colors pb-0.5 cursor-pointer"
            >
              {resetLabel ?? "New Inquiry"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-tertiary text-tertiary-fixed">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        <div>
          <div className="font-headline italic text-lg text-secondary-fixed-dim mb-3">
            The Scriptorium
          </div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] leading-loose text-tertiary-fixed/70 max-w-xs">
            Dedicated to the preservation of universal wisdom and the advancement
            of interfaith dialogue through digital scholarship.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ul className="space-y-3">
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                Abrahamic Traditions
              </a>
            </li>
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                Dharmic Paths
              </a>
            </li>
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                East Asian Wisdom
              </a>
            </li>
          </ul>
          <ul className="space-y-3">
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                Academic Archive
              </a>
            </li>
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                Citations
              </a>
            </li>
            <li>
              <a
                className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/70 hover:text-surface transition-colors"
                href="#"
              >
                Privacy
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex gap-5 text-secondary-fixed-dim">
            <Icon name="public" />
            <Icon name="history_edu" />
            <Icon name="auto_stories" />
          </div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed/50 md:text-right">
            Powered by Gemini · A.S. MMXXVI
          </p>
        </div>
      </div>
    </footer>
  );
}

type DemoMode = null | "session" | "live";

function getDemoMode(): DemoMode {
  const v = new URLSearchParams(window.location.search).get("demo");
  if (v === "session" || v === "live") return v;
  return null;
}

function App() {
  const sharedId = useMemo(() => getSharedSessionId(), []);
  const demoMode = useMemo(() => getDemoMode(), []);
  const demoSessionMode = demoMode === "session";
  const demoLiveMode = demoMode === "live";
  const shared = useSharedSession(sharedId);

  const { events, isLoading, error, currentPhase, sessionId, ask, cancel } =
    useCouncilStream();

  const realLive = useLiveCouncil();
  const demoLive = useLiveCouncilDemo(demoLiveMode);
  const live = demoLiveMode
    ? ({
        ...demoLive,
        start: () => {},
      } as unknown as typeof realLive)
    : realLive;

  const [mode, setMode] = useState<CouncilMode>(
    demoLiveMode ? "listen" : "ask"
  );
  const [selectedFaiths, setSelectedFaiths] = useState<Faith[]>([...ALL_FAITHS]);
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  const hasSession = events.length > 0 || isLoading || demoSessionMode;
  const hasLiveSession = live.phase !== "idle";
  const isSharedView = sharedId !== null;

  const activeEvents = demoSessionMode ? DEMO_SESSION.events : events;
  const activeQuestion = demoSessionMode
    ? DEMO_SESSION.question
    : demoLiveMode
      ? demoLive.question
      : submittedQuestion;
  const activeSessionId = demoSessionMode ? DEMO_SESSION.id : sessionId;
  const activeFaiths = demoSessionMode
    ? (DEMO_SESSION.faiths as Faith[])
    : selectedFaiths;

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
        <TopNav showReset onReset={handleGoHome} resetLabel="Ask Your Own" />

        <main className="flex-1 px-6 md:px-10 py-10 max-w-7xl w-full mx-auto">
          {shared.isLoading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <div
                className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
              <span className="font-label text-xs uppercase tracking-[0.25em] text-secondary ml-3">
                Loading session
              </span>
            </div>
          )}

          {shared.error && (
            <div className="max-w-3xl mx-auto mt-6 p-5 rounded-sm bg-error-container/40 border-l-2 border-error text-on-error-container text-sm">
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

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        showReset={hasSession || hasLiveSession}
        onReset={handleReset}
        resetLabel="New Inquiry"
      />

      <main className="flex-1 px-6 md:px-10 py-10 md:py-14 max-w-7xl w-full mx-auto relative">
        {!hasSession && !hasLiveSession && (
          <>
            <header className="max-w-3xl mx-auto text-center mb-12">
              <div className="font-label text-[11px] uppercase tracking-[0.35em] text-secondary mb-5">
                The Assembly
              </div>
              <h1 className="font-headline text-5xl md:text-6xl text-primary leading-[1.05] tracking-tight mb-6">
                Council of <span className="italic">Faith</span>
              </h1>
              <div className="flex justify-center mb-6">
                <span className="flourish" aria-hidden="true" />
              </div>
              <p className="text-lg text-on-surface-variant font-body leading-relaxed max-w-2xl mx-auto">
                Convene voices across centuries and traditions. Ask a
                philosophical question and let scholars of the world's great
                faiths illuminate it — each grounded exclusively in their sacred
                scriptures.
              </p>
            </header>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div
                role="tablist"
                className="inline-flex rounded-sm bg-surface-container-high ghost-border p-1"
              >
                <button
                  role="tab"
                  aria-selected={mode === "ask"}
                  onClick={() => setMode("ask")}
                  className={`px-6 py-3 rounded-sm font-label text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center gap-2 ${
                    mode === "ask"
                      ? "wax-seal text-on-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <Icon name="forum" className="text-[18px]" />
                  Ask the Council
                </button>
                <button
                  role="tab"
                  aria-selected={mode === "listen"}
                  onClick={() => setMode("listen")}
                  className={`px-6 py-3 rounded-sm font-label text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center gap-2 ${
                    mode === "listen"
                      ? "wax-seal text-on-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  <Icon name="podcasts" className="text-[18px]" />
                  Listen Live
                </button>
              </div>
            </div>

            {mode === "listen" && (
              <p className="text-center mb-10 max-w-xl mx-auto text-sm text-on-surface-variant italic font-headline leading-relaxed">
                The scholars will hold a live spoken disputation — agreeing,
                contesting, and weaving citations in real time.
              </p>
            )}

            <section className="mb-14">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="font-label text-[11px] uppercase tracking-[0.3em] text-secondary mb-2">
                    The Scholars
                  </div>
                  <h2 className="font-headline text-3xl italic text-on-surface">
                    Browse the Council
                  </h2>
                </div>
                <div className="hidden md:flex gap-5 text-[11px] font-label uppercase tracking-[0.2em] text-on-surface-variant/70">
                  <span className="text-on-surface border-b border-secondary pb-0.5">
                    All
                  </span>
                  <span className="cursor-pointer hover:text-on-surface transition-colors">
                    Abrahamic
                  </span>
                  <span className="cursor-pointer hover:text-on-surface transition-colors">
                    Dharmic
                  </span>
                </div>
              </div>
              <CouncilShowcase
                selectedFaiths={selectedFaiths}
                onToggleFaith={handleToggleFaith}
              />
            </section>
          </>
        )}

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

        {mode === "ask" && error && (
          <div className="max-w-3xl mx-auto mt-8 p-5 rounded-sm bg-error-container/40 border-l-2 border-error text-on-error-container text-sm">
            {error}
          </div>
        )}

        {mode === "ask" && (
          <CouncilSession
            events={activeEvents}
            isLoading={isLoading}
            currentPhase={currentPhase}
            question={activeQuestion}
            faiths={activeFaiths}
            sessionId={activeSessionId}
          />
        )}

        {mode === "listen" && hasLiveSession && (
          <LiveCouncilSession
            phase={live.phase}
            faiths={demoLiveMode ? [...ALL_FAITHS] : selectedFaiths}
            activeSpeaker={live.activeSpeaker}
            transcripts={live.transcripts}
            currentRound={live.currentRound}
            currentRoundLabel={live.currentRoundLabel}
            statusText={live.statusText}
            error={live.error}
            player={live.player}
            question={activeQuestion}
            onStop={live.stop}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;

import { CouncilSession } from "./components/CouncilSession";
import { QuestionInput } from "./components/QuestionInput";
import { useCouncilStream } from "./hooks/useCouncilStream";
import { FAITH_META } from "./types";

const faithValues = Object.values(FAITH_META);

function App() {
  const { events, isLoading, error, currentPhase, ask, cancel } =
    useCouncilStream();

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
          <div className="flex gap-1.5">
            {faithValues.map((f) => (
              <span
                key={f.key}
                title={f.label}
                className="text-lg cursor-default"
              >
                {f.icon}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-12">
        {/* Hero — only shown before first query */}
        {events.length === 0 && !isLoading && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
              Seek wisdom from the world's traditions
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Ask a philosophical question and hear perspectives from scholars
              of Hinduism, Islam, Christianity, Buddhism, and Judaism — each
              grounded exclusively in their sacred scriptures.
            </p>
          </div>
        )}

        <QuestionInput
          onSubmit={(q) => ask(q)}
          isLoading={isLoading}
          onCancel={cancel}
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

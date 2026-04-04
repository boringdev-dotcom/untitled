import { useCallback, useRef, useState } from "react";
import type { CouncilEvent, Faith } from "../types";

interface CouncilState {
  events: CouncilEvent[];
  isLoading: boolean;
  error: string | null;
  currentPhase: string | null;
  sessionId: string | null;
}

export function useCouncilStream() {
  const [state, setState] = useState<CouncilState>({
    events: [],
    isLoading: false,
    error: null,
    currentPhase: null,
    sessionId: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (question: string, faiths?: Faith[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        events: [],
        isLoading: true,
        error: null,
        currentPhase: null,
        sessionId: null,
      });

      try {
        const body: Record<string, unknown> = { question };
        if (faiths && faiths.length > 0) body.faiths = faiths;

        const apiBase = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiBase}/api/council/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const jsonStr = line.slice(5).trim();
              if (!jsonStr) continue;
              try {
                const event: CouncilEvent = JSON.parse(jsonStr);
                if (event.phase === "session_saved" && event.session_id) {
                  setState((prev) => ({
                    ...prev,
                    sessionId: event.session_id ?? null,
                  }));
                } else {
                  setState((prev) => ({
                    ...prev,
                    events: [...prev.events, event],
                    currentPhase: event.phase,
                  }));
                }
              } catch {
                // skip malformed lines
              }
            }
          }
        }

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState({ events: [], isLoading: false, error: null, currentPhase: null, sessionId: null });
  }, []);

  return { ...state, ask, cancel };
}

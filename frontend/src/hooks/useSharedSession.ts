import { useEffect, useState } from "react";
import type { SavedSession } from "../types";

interface SharedSessionState {
  session: SavedSession | null;
  isLoading: boolean;
  error: string | null;
}

export function useSharedSession(sessionId: string | null) {
  const [session, setSession] = useState<SavedSession | null>(null);
  const [isLoading, setIsLoading] = useState(sessionId !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_URL || "";

    fetch(`${apiBase}/api/council/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Session not found" : `Error ${res.status}`);
        return res.json();
      })
      .then((data: SavedSession) => {
        if (!cancelled) {
          setSession(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [sessionId]);

  return { session, isLoading, error } as SharedSessionState;
}

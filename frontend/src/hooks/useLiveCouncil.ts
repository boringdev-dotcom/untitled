import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Faith,
  LiveMessage,
  LivePhase,
  LiveTranscriptEntry,
} from "../types";
import { FAITH_META } from "../types";
import { AudioStreamPlayer } from "../utils/audioPlayer";

export interface LiveCouncilState {
  phase: LivePhase;
  activeSpeaker: string | null;
  transcripts: LiveTranscriptEntry[];
  currentRound: number;
  currentRoundLabel: string;
  statusText: string | null;
  error: string | null;
}

export function useLiveCouncil() {
  const [state, setState] = useState<LiveCouncilState>({
    phase: "idle",
    activeSpeaker: null,
    transcripts: [],
    currentRound: 0,
    currentRoundLabel: "",
    statusText: null,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<AudioStreamPlayer | null>(null);
  const currentTranscriptRef = useRef<string>("");
  const currentTurnRef = useRef(0);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      playerRef.current?.destroy();
    };
  }, []);

  const start = useCallback(
    (question: string, faiths: Faith[], rounds: number = 2) => {
      wsRef.current?.close();
      playerRef.current?.destroy();

      const player = new AudioStreamPlayer();
      playerRef.current = player;

      setState({
        phase: "connecting",
        activeSpeaker: null,
        transcripts: [],
        currentRound: 0,
        currentRoundLabel: "",
        statusText: "Connecting to the Council...",
        error: null,
      });

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const apiBase = import.meta.env.VITE_API_URL || "";
      let wsUrl: string;
      if (apiBase) {
        const base = apiBase.replace(/^https?:/, protocol);
        wsUrl = `${base}/ws/council/live`;
      } else {
        wsUrl = `${protocol}//${window.location.host}/ws/council/live`;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            question,
            faiths,
            rounds,
          })
        );
        setState((prev) => ({
          ...prev,
          phase: "live",
          statusText: "Session started",
        }));
      };

      ws.onmessage = (event) => {
        const msg: LiveMessage = JSON.parse(event.data);
        handleMessage(msg, player);
      };

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          phase: "error",
          error: "WebSocket connection failed",
        }));
      };

      ws.onclose = () => {
        setState((prev) => {
          if (prev.phase === "live" || prev.phase === "connecting") {
            return { ...prev, phase: "complete" };
          }
          return prev;
        });
      };
    },
    []
  );

  const handleMessage = useCallback(
    (msg: LiveMessage, player: AudioStreamPlayer) => {
      switch (msg.type) {
        case "status":
          setState((prev) => ({
            ...prev,
            statusText: msg.text ?? null,
          }));
          break;

        case "round_start":
          setState((prev) => ({
            ...prev,
            currentRound: msg.round ?? 0,
            currentRoundLabel: msg.label ?? "",
            statusText: msg.label ?? null,
          }));
          break;

        case "speaker_start": {
          currentTranscriptRef.current = "";
          currentTurnRef.current = msg.turn ?? 0;
          player.resume();
          player.reset();
          setState((prev) => ({
            ...prev,
            activeSpeaker: msg.faith ?? null,
            statusText: null,
          }));
          break;
        }

        case "audio":
          if (msg.data) {
            player.feedChunk(msg.data);
          }
          break;

        case "transcript": {
          if (msg.text && msg.faith) {
            currentTranscriptRef.current += msg.text;
            const faith = msg.faith;
            const meta = FAITH_META[faith as Faith];
            const agentName = meta?.agentName ?? msg.faith;
            const turn = msg.turn ?? currentTurnRef.current;

            setState((prev) => {
              // Use turn as the unique key so each speaking turn is its own entry
              const existing = prev.transcripts.findIndex(
                (t) => t.faith === faith && t.round === turn
              );
              if (existing >= 0) {
                const updated = [...prev.transcripts];
                updated[existing] = {
                  ...updated[existing],
                  text: currentTranscriptRef.current,
                };
                return { ...prev, transcripts: updated };
              }
              return {
                ...prev,
                transcripts: [
                  ...prev.transcripts,
                  {
                    faith,
                    agentName,
                    text: currentTranscriptRef.current,
                    round: turn,
                  },
                ],
              };
            });
          }
          break;
        }

        case "speaker_end":
          setState((prev) => ({
            ...prev,
            activeSpeaker: null,
          }));
          break;

        case "complete":
          setState((prev) => ({
            ...prev,
            phase: "complete",
            activeSpeaker: null,
            statusText: "Discussion complete",
          }));
          break;

        case "error":
          setState((prev) => ({
            ...prev,
            error: msg.text ?? "Unknown error",
          }));
          break;
      }
    },
    []
  );

  const stop = useCallback(() => {
    wsRef.current?.close();
    playerRef.current?.destroy();
    playerRef.current = null;
    setState({
      phase: "idle",
      activeSpeaker: null,
      transcripts: [],
      currentRound: 0,
      currentRoundLabel: "",
      statusText: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    start,
    stop,
    player: playerRef.current,
  };
}

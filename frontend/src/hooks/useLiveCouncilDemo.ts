import { useCallback, useEffect, useRef, useState } from "react";
import type { Faith, LivePhase, LiveTranscriptEntry } from "../types";
import { FAITH_META } from "../types";
import type { AudioStreamPlayer } from "../utils/audioPlayer";

interface LiveCouncilState {
  phase: LivePhase;
  activeSpeaker: string | null;
  transcripts: LiveTranscriptEntry[];
  currentRound: number;
  currentRoundLabel: string;
  statusText: string | null;
  error: string | null;
}

interface Turn {
  faith: Faith;
  round: number;
  roundLabel: string;
  text: string;
}

const DEMO_QUESTION =
  "Does the preservation of silence carry more weight than the expression of truth?";

const DEMO_SCRIPT: Turn[] = [
  {
    faith: "hinduism",
    round: 1,
    roundLabel: "Round I · Opening Reflections",
    text:
      "In the Bhagavad Gita, silence is called an austerity of speech. But speech spoken in truth and without harm is itself a sacred act. Krishna counsels us to speak as we act — without attachment, offered as yajña.",
  },
  {
    faith: "islam",
    round: 1,
    roundLabel: "Round I · Opening Reflections",
    text:
      "The Qur'an is emphatic — stand firm in justice, witnesses for Allah, even against yourselves. Silence in the face of wrong is itself a form of complicity. Truth is the trust placed upon every believer.",
  },
  {
    faith: "christianity",
    round: 1,
    roundLabel: "Round I · Opening Reflections",
    text:
      "Ecclesiastes teaches there is a time to keep silence, and a time to speak. Christ before Pilate held his peace — silence can be the loudest testimony. Yet when the neighbor suffers, truth must rise in their defense.",
  },
  {
    faith: "buddhism",
    round: 1,
    roundLabel: "Round I · Opening Reflections",
    text:
      "The Dhammapada gives three gates for Right Speech — is it true, is it useful, is it kind? Where any is missing, silence is the more skillful offering. Yet the Buddha also taught the Noble Lion's Roar — the fearless proclamation of what is.",
  },
  {
    faith: "judaism",
    round: 1,
    roundLabel: "Round I · Opening Reflections",
    text:
      "Lashon hara — evil speech — is forbidden even when true. But silence in the face of injustice is graver still. Do not stand idly by the blood of your neighbor. A fence around Torah is silence; a fence around justice is speech.",
  },
  {
    faith: "christianity",
    round: 2,
    roundLabel: "Round II · Cross-Examination",
    text:
      "I find profound accord with the Rabbi — a fence of speech around justice. And the Buddhist's threshold of true, useful, kind is the Gospel in another tongue. Silence is not evasion; it is the soil in which the Word takes root.",
  },
  {
    faith: "islam",
    round: 2,
    roundLabel: "Round II · Cross-Examination",
    text:
      "The Rishi and the Bhikkhu draw us toward discipline of speech — but let us not allow discipline to become privilege. The silence of the comfortable is the loudest lie. Bearing witness is the trust of every believer.",
  },
  {
    faith: "hinduism",
    round: 2,
    roundLabel: "Round II · Cross-Examination",
    text:
      "The Sheikh speaks rightly. Dharma is not passive. Yet Krishna also warns against speech in anger. The discipline is not silence for its own sake — it is the cultivation of speech that is true, beneficial, pleasing, and without cruelty.",
  },
];

// Per-turn timing: each turn streams its text word-by-word over this interval (ms).
const TURN_DURATION_MS = 6000;
const GAP_BETWEEN_TURNS_MS = 900;

function estimatedSpeechDurationMs(text: string): number {
  // Rough speech pacing: ~170 wpm. Cap between 5s and 10s.
  const words = text.split(/\s+/).length;
  const base = (words / 170) * 60 * 1000;
  return Math.min(10000, Math.max(TURN_DURATION_MS, base));
}

export function useLiveCouncilDemo(autoStart: boolean) {
  const [state, setState] = useState<LiveCouncilState>({
    phase: autoStart ? "connecting" : "idle",
    activeSpeaker: null,
    transcripts: [],
    currentRound: 0,
    currentRoundLabel: "",
    statusText: autoStart ? "Convening the chamber..." : null,
    error: null,
  });

  const timersRef = useRef<number[]>([]);
  const startedRef = useRef(false);

  const clearTimers = () => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  };

  const addTimer = (cb: () => void, delay: number) => {
    const id = window.setTimeout(cb, delay);
    timersRef.current.push(id);
    return id;
  };

  const play = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cursor = 0;

    addTimer(() => {
      setState((prev) => ({
        ...prev,
        phase: "live",
        statusText: null,
      }));
    }, 900);

    for (let i = 0; i < DEMO_SCRIPT.length; i++) {
      const turn = DEMO_SCRIPT[i];
      const duration = estimatedSpeechDurationMs(turn.text);
      const turnStart = cursor + 1200;

      addTimer(() => {
        setState((prev) => {
          const roundChanged = prev.currentRound !== turn.round;
          return {
            ...prev,
            phase: "live",
            activeSpeaker: turn.faith,
            currentRound: turn.round,
            currentRoundLabel: turn.roundLabel,
            statusText: roundChanged ? turn.roundLabel : null,
            transcripts: [
              ...prev.transcripts,
              {
                faith: turn.faith,
                agentName: FAITH_META[turn.faith].agentName,
                text: "",
                round: i + 1,
              },
            ],
          };
        });
      }, turnStart);

      const words = turn.text.split(" ");
      const perWord = duration / words.length;
      for (let w = 0; w < words.length; w++) {
        addTimer(() => {
          setState((prev) => {
            const transcripts = [...prev.transcripts];
            const idx = transcripts.length - 1;
            if (idx < 0) return prev;
            const cur = transcripts[idx];
            if (cur.faith !== turn.faith) return prev;
            transcripts[idx] = {
              ...cur,
              text: cur.text ? `${cur.text} ${words[w]}` : words[w],
            };
            return { ...prev, transcripts };
          });
        }, turnStart + perWord * (w + 1));
      }

      addTimer(() => {
        setState((prev) => ({
          ...prev,
          activeSpeaker: null,
        }));
      }, turnStart + duration);

      cursor = turnStart + duration + GAP_BETWEEN_TURNS_MS;
    }

    addTimer(() => {
      setState((prev) => ({
        ...prev,
        phase: "complete",
        activeSpeaker: null,
        statusText: "The council has concluded.",
      }));
    }, cursor + 600);
  }, []);

  useEffect(() => {
    if (autoStart) {
      play();
    }
    return () => {
      // React Strict Mode runs effects twice in dev; reset guard so the
      // second run re-schedules the demo playback.
      clearTimers();
      startedRef.current = false;
    };
  }, [autoStart, play]);

  const stop = useCallback(() => {
    clearTimers();
    startedRef.current = false;
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
    question: DEMO_QUESTION,
    player: null as AudioStreamPlayer | null,
    stop,
  };
}

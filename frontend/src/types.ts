export type Faith =
  | "hinduism"
  | "islam"
  | "christianity"
  | "buddhism"
  | "judaism";

export type Phase = "opinion" | "rebuttal" | "report" | "analysis" | "session_saved";

export interface ScriptureChunk {
  id: number;
  faith: string;
  book: string;
  chapter: string | null;
  verse_range: string | null;
  content: string;
}

export interface FaithPairAgreement {
  faith_a: string;
  faith_b: string;
  score: number;
  summary: string;
}

export interface ThemePosition {
  faith: string;
  stance: "agree" | "disagree" | "nuanced";
  brief: string;
}

export interface AnalysisTheme {
  name: string;
  description: string;
  positions: ThemePosition[];
}

export interface CouncilAnalysis {
  overall_consensus: number;
  agreements: FaithPairAgreement[];
  themes: AnalysisTheme[];
  strongest_agreement: string;
  strongest_disagreement: string;
}

export interface CouncilEvent {
  phase: Phase;
  faith: string | null;
  agent_name: string | null;
  content: string;
  scripture_refs: ScriptureChunk[];
  analysis?: CouncilAnalysis | null;
  session_id?: string | null;
}

export interface SavedSession {
  id: string;
  question: string;
  faiths: string[];
  events: CouncilEvent[];
  created_at: string | null;
}

export interface FaithMeta {
  key: Faith;
  label: string;
  agentName: string;
  color: string;
  icon: string;
  scripture: string;
  tagline: string;
}

export const FAITH_META: Record<Faith, FaithMeta> = {
  hinduism: {
    key: "hinduism",
    label: "Hinduism",
    agentName: "Rishi",
    color: "#c8741a",
    icon: "🕉️",
    scripture: "Bhagavad Gita",
    tagline: "Sanātana Dharma — the eternal way",
  },
  islam: {
    key: "islam",
    label: "Islam",
    agentName: "Sheikh",
    color: "#2f6b3a",
    icon: "☪️",
    scripture: "The Holy Quran",
    tagline: "Submission to the will of God",
  },
  christianity: {
    key: "christianity",
    label: "Christianity",
    agentName: "Father Thomas",
    color: "#3b5998",
    icon: "✝️",
    scripture: "Bible (KJV)",
    tagline: "Grace, redemption, and love",
  },
  buddhism: {
    key: "buddhism",
    label: "Buddhism",
    agentName: "Bhikkhu",
    color: "#b8871b",
    icon: "☸️",
    scripture: "Dhammapada",
    tagline: "The Middle Way to enlightenment",
  },
  judaism: {
    key: "judaism",
    label: "Judaism",
    agentName: "Rabbi",
    color: "#1f3a8a",
    icon: "✡️",
    scripture: "Torah & Tanakh",
    tagline: "Covenant, law, and wisdom",
  },
};

export const ALL_FAITHS: Faith[] = [
  "hinduism",
  "islam",
  "christianity",
  "buddhism",
  "judaism",
];

// --- Live Council types ---

export type LiveMessageType =
  | "speaker_start"
  | "speaker_end"
  | "audio"
  | "transcript"
  | "round_start"
  | "status"
  | "complete"
  | "error";

export interface LiveMessage {
  type: LiveMessageType;
  faith?: string;
  agent_name?: string;
  data?: string;
  text?: string;
  round?: number;
  label?: string;
  turn?: number;
}

export interface LiveTranscriptEntry {
  faith: string;
  agentName: string;
  text: string;
  round: number;
}

export type LivePhase = "idle" | "connecting" | "live" | "complete" | "error";

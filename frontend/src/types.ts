export type Faith =
  | "hinduism"
  | "islam"
  | "christianity"
  | "buddhism"
  | "judaism";

export type Phase = "opinion" | "rebuttal" | "report" | "analysis";

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
    color: "var(--color-hindu)",
    icon: "🕉️",
    scripture: "Bhagavad Gita",
    tagline: "Sanātana Dharma — the eternal way",
  },
  islam: {
    key: "islam",
    label: "Islam",
    agentName: "Sheikh",
    color: "var(--color-islam)",
    icon: "☪️",
    scripture: "The Holy Quran",
    tagline: "Submission to the will of God",
  },
  christianity: {
    key: "christianity",
    label: "Christianity",
    agentName: "Father Thomas",
    color: "var(--color-christian)",
    icon: "✝️",
    scripture: "Bible (KJV)",
    tagline: "Grace, redemption, and love",
  },
  buddhism: {
    key: "buddhism",
    label: "Buddhism",
    agentName: "Bhikkhu",
    color: "var(--color-buddhist)",
    icon: "☸️",
    scripture: "Dhammapada",
    tagline: "The Middle Way to enlightenment",
  },
  judaism: {
    key: "judaism",
    label: "Judaism",
    agentName: "Rabbi",
    color: "var(--color-jewish)",
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

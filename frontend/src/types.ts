export type Faith =
  | "hinduism"
  | "islam"
  | "christianity"
  | "buddhism"
  | "judaism";

export type Phase = "opinion" | "rebuttal" | "report";

export interface ScriptureChunk {
  id: number;
  faith: string;
  book: string;
  chapter: string | null;
  verse_range: string | null;
  content: string;
}

export interface CouncilEvent {
  phase: Phase;
  faith: string | null;
  agent_name: string | null;
  content: string;
  scripture_refs: ScriptureChunk[];
}

export interface FaithMeta {
  key: Faith;
  label: string;
  agentName: string;
  color: string;
  icon: string;
}

export const FAITH_META: Record<Faith, FaithMeta> = {
  hinduism: {
    key: "hinduism",
    label: "Hinduism",
    agentName: "Rishi",
    color: "var(--color-hindu)",
    icon: "🕉️",
  },
  islam: {
    key: "islam",
    label: "Islam",
    agentName: "Sheikh",
    color: "var(--color-islam)",
    icon: "☪️",
  },
  christianity: {
    key: "christianity",
    label: "Christianity",
    agentName: "Father Thomas",
    color: "var(--color-christian)",
    icon: "✝️",
  },
  buddhism: {
    key: "buddhism",
    label: "Buddhism",
    agentName: "Bhikkhu",
    color: "var(--color-buddhist)",
    icon: "☸️",
  },
  judaism: {
    key: "judaism",
    label: "Judaism",
    agentName: "Rabbi",
    color: "var(--color-jewish)",
    icon: "✡️",
  },
};

import type { SavedSession } from "../types";

// Mock data used when visiting `/?demo=session` — lets the UI be previewed
// without a running backend. Also used by the screen recorder walkthroughs.
export const DEMO_SESSION: SavedSession = {
  id: "demo-session",
  question: "Does the preservation of silence carry more weight than the expression of truth?",
  faiths: ["hinduism", "islam", "christianity", "buddhism", "judaism"],
  created_at: new Date().toISOString(),
  events: [
    {
      phase: "opinion",
      faith: "hinduism",
      agent_name: "Rishi",
      content:
        "In the teachings of the Bhagavad Gita, silence (*mauna*) is one of the austerities of speech — yet speech spoken in truth, without harming, is itself a form of sacred action. **Truth (satya)** is a cornerstone of *Sanātana Dharma*, but the sage cultivates both: when words ripen, they must be offered; when they would wound, silence is wiser.\n\nKrishna counsels Arjuna to act without attachment — speech, too, must be offered as yajña.",
      scripture_refs: [
        {
          id: 1,
          faith: "hinduism",
          book: "Bhagavad Gita",
          chapter: "17",
          verse_range: "15",
          content:
            "Speech which causes no distress, which is truthful, pleasing and beneficial, as well as the regular recitation of Vedic scriptures — these constitute the austerity of speech.",
        },
      ],
    },
    {
      phase: "opinion",
      faith: "islam",
      agent_name: "Sheikh",
      content:
        "The Holy Qur'an is emphatic: *\"O you who believe, speak the truth — even against yourselves.\"* Silence in the face of injustice is itself a form of complicity. Yet the Prophet also counselled: \"*Whoever believes in Allah and the Last Day, let him speak good or remain silent.*\" Truth must be spoken — but with wisdom, not in haste.",
      scripture_refs: [
        {
          id: 2,
          faith: "islam",
          book: "Qur'an",
          chapter: "4",
          verse_range: "135",
          content:
            "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves.",
        },
      ],
    },
    {
      phase: "opinion",
      faith: "christianity",
      agent_name: "Father Thomas",
      content:
        "In Ecclesiastes we are told *\"there is a time to keep silence, and a time to speak.\"* Christ himself spoke truth to power — and yet before Pilate, he held his peace. Silence is not cowardice; it is the soil in which the Word may take root. But when the neighbor suffers, truth must be the neighbor's defender.",
      scripture_refs: [
        {
          id: 3,
          faith: "christianity",
          book: "Ecclesiastes",
          chapter: "3",
          verse_range: "7",
          content:
            "A time to rend, and a time to sew; a time to keep silence, and a time to speak.",
        },
      ],
    },
    {
      phase: "opinion",
      faith: "buddhism",
      agent_name: "Bhikkhu",
      content:
        "The Dhammapada teaches the three gates of Right Speech: is it **true**, is it **useful**, is it **kind**? If any one of these is absent, silence is the more skillful offering. Yet the Buddha also taught *the Noble Lion's Roar* — the fearless proclamation of what is.\n\nBoth silence and truth are expressions of *mettā* and *paññā* — compassion and wisdom.",
      scripture_refs: [
        {
          id: 4,
          faith: "buddhism",
          book: "Dhammapada",
          chapter: "10",
          verse_range: "133",
          content:
            "Speak not harshly to anyone; those who are thus spoken to may retort. Painful indeed is angry speech.",
        },
      ],
    },
    {
      phase: "opinion",
      faith: "judaism",
      agent_name: "Rabbi",
      content:
        "The Torah and Talmud are rich with the ethics of speech. *Lashon hara* — evil speech — is forbidden even when true. Yet silence in the face of wrongdoing is a grave sin: *\"Do not stand idly by the blood of your neighbor.\"* The sages taught: **a fence around Torah is silence; but a fence around justice is speech.**",
      scripture_refs: [
        {
          id: 5,
          faith: "judaism",
          book: "Leviticus",
          chapter: "19",
          verse_range: "16",
          content:
            "Thou shalt not go up and down as a talebearer among thy people; neither shalt thou stand against the blood of thy neighbour.",
        },
      ],
    },
    {
      phase: "rebuttal",
      faith: "christianity",
      agent_name: "Father Thomas",
      content:
        "I find profound accord with the Rabbi's *\"fence of speech around justice.\"* Yet I would add: Christ's silence before Pilate was not moral evasion — it was testimony. There is a speech which only silence can utter. The Buddhist's test — **true, useful, kind** — is a Gospel truth in disguise.",
      scripture_refs: [],
    },
    {
      phase: "rebuttal",
      faith: "islam",
      agent_name: "Sheikh",
      content:
        "The Rishi and the Bhikkhu draw us to *discipline* of speech — but we must not let discipline become privilege. The silence of the comfortable is the loudest lie. Truth is the trust (*amanah*) placed upon every believer; the fear of offence does not absolve the duty to bear witness.",
      scripture_refs: [],
    },
    {
      phase: "report",
      faith: null,
      agent_name: null,
      content:
        "Having weighed the tension between the sacred seal of silence and the moral imperative of speech, the Council finds not a resolution but a **refined obligation**. Across traditions, truth and silence are not adversaries but *vessel and wine*.\n\nWe establish the **Doctrine of Echo**: truth released into the world is most luminous when it has first been *echoed* within — weighed, contextualized, seasoned by love. Silence without truth is complicity; truth without silence is violence. The Council holds both in one hand.\n\n> *\"Speak only what is true, useful, and kind — and when these three cannot agree, pause, but do not forget.\"*",
      scripture_refs: [],
    },
    {
      phase: "analysis",
      faith: null,
      agent_name: null,
      content: "",
      scripture_refs: [],
      analysis: {
        overall_consensus: 0.72,
        strongest_agreement:
          "All five traditions affirm that speech must be tempered by truthfulness and compassion.",
        strongest_disagreement:
          "Abrahamic traditions emphasize moral duty to speak; Dharmic traditions emphasize the discipline of restraint.",
        agreements: [
          {
            faith_a: "buddhism",
            faith_b: "hinduism",
            score: 0.92,
            summary: "Shared Dharmic roots on the austerity of speech.",
          },
          {
            faith_a: "christianity",
            faith_b: "judaism",
            score: 0.88,
            summary: "Common Abrahamic ethic of bearing witness against injustice.",
          },
          {
            faith_a: "islam",
            faith_b: "judaism",
            score: 0.85,
            summary: "Both hold truth-telling as a sacred trust.",
          },
          {
            faith_a: "hinduism",
            faith_b: "christianity",
            score: 0.65,
            summary: "Both honour contemplative silence, differ on its priority.",
          },
          {
            faith_a: "buddhism",
            faith_b: "islam",
            score: 0.4,
            summary: "Friction over whether silence can constitute complicity.",
          },
          {
            faith_a: "hinduism",
            faith_b: "islam",
            score: 0.45,
            summary: "Restraint vs. duty to bear witness.",
          },
          {
            faith_a: "christianity",
            faith_b: "buddhism",
            score: 0.7,
            summary: "Aligned on the 'true, useful, kind' threshold.",
          },
          {
            faith_a: "hinduism",
            faith_b: "judaism",
            score: 0.55,
            summary: "Nuanced: both agree on harmful speech, differ on duty.",
          },
          {
            faith_a: "christianity",
            faith_b: "islam",
            score: 0.82,
            summary: "Mutual imperative of prophetic witness.",
          },
          {
            faith_a: "buddhism",
            faith_b: "judaism",
            score: 0.5,
            summary: "Divergent: restraint of *lashon hara* vs. Noble Lion's Roar.",
          },
        ],
        themes: [
          {
            name: "The Sanctity of the Unspoken",
            description:
              "Contemplative silence as a discipline of the soul — a space in which truth may ripen.",
            positions: [
              { faith: "hinduism", stance: "agree", brief: "Mauna as austerity." },
              { faith: "buddhism", stance: "agree", brief: "Right Speech triad." },
              { faith: "christianity", stance: "nuanced", brief: "Silence before Pilate." },
              { faith: "islam", stance: "disagree", brief: "Silence is complicity." },
              { faith: "judaism", stance: "nuanced", brief: "Lashon hara vs. duty." },
            ],
          },
          {
            name: "The Duty to Bear Witness",
            description:
              "The moral obligation to speak against injustice — truth as covenant.",
            positions: [
              { faith: "islam", stance: "agree", brief: "Truth is amanah." },
              { faith: "judaism", stance: "agree", brief: "Do not stand idly by." },
              { faith: "christianity", stance: "agree", brief: "Prophetic witness." },
              { faith: "hinduism", stance: "nuanced", brief: "Speech as yajña." },
              { faith: "buddhism", stance: "nuanced", brief: "Noble Lion's Roar." },
            ],
          },
          {
            name: "Speech as Ethical Instrument",
            description:
              "All traditions converge on the tripartite test: truthful, beneficial, kind.",
            positions: [
              { faith: "hinduism", stance: "agree", brief: "Gita 17.15 triad." },
              { faith: "islam", stance: "agree", brief: "Hadith of good speech." },
              { faith: "christianity", stance: "agree", brief: "Letter of James." },
              { faith: "buddhism", stance: "agree", brief: "Right Speech." },
              { faith: "judaism", stance: "agree", brief: "Mussar of tongue." },
            ],
          },
        ],
      },
    },
  ],
};

import type { CouncilAnalysis, CouncilEvent, Faith } from "../types";
import { AgreementMatrix } from "./AgreementMatrix";
import { CollapsibleSection } from "./CollapsibleSection";
import { ConsensusGauge } from "./ConsensusGauge";
import { ScriptureStats } from "./ScriptureStats";
import { ThemeBreakdown } from "./ThemeBreakdown";

interface Props {
  analysis: CouncilAnalysis;
  opinionEvents: CouncilEvent[];
  faiths: Faith[];
}

export function AnalysisDashboard({ analysis, opinionEvents, faiths }: Props) {
  return (
    <CollapsibleSection
      title="Council Analytics"
      description="Quantitative analysis of the council's discussion — agreement levels, key themes, and scripture usage."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgreementMatrix agreements={analysis.agreements} faiths={faiths} />
        <ConsensusGauge
          consensus={analysis.overall_consensus}
          strongestAgreement={analysis.strongest_agreement}
          strongestDisagreement={analysis.strongest_disagreement}
        />
        <ThemeBreakdown themes={analysis.themes} />
        <ScriptureStats opinionEvents={opinionEvents} />
      </div>
    </CollapsibleSection>
  );
}

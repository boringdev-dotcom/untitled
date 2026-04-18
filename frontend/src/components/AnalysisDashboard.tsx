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

export function AnalysisDashboard({
  analysis,
  opinionEvents,
  faiths,
}: Props) {
  return (
    <CollapsibleSection
      eyebrow="Phase IV"
      title="Council Analytics"
      description="A quantitative lens upon qualitative metaphysics — agreement, themes, and citation weight."
      defaultOpen
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <ConsensusGauge
            consensus={analysis.overall_consensus}
            strongestAgreement={analysis.strongest_agreement}
            strongestDisagreement={analysis.strongest_disagreement}
          />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <AgreementMatrix
            agreements={analysis.agreements}
            faiths={faiths}
          />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <ThemeBreakdown themes={analysis.themes} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ScriptureStats opinionEvents={opinionEvents} />
        </div>
      </div>
    </CollapsibleSection>
  );
}

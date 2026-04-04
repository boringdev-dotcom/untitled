interface Props {
  consensus: number;
  strongestAgreement: string;
  strongestDisagreement: string;
}

function consensusColor(value: number): string {
  const hue = value * 120;
  return `hsl(${hue}, 70%, 50%)`;
}

export function ConsensusGauge({
  consensus,
  strongestAgreement,
  strongestDisagreement,
}: Props) {
  const pct = Math.round(consensus * 100);
  const radius = 70;
  const stroke = 12;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - consensus);

  return (
    <div className="rounded-xl bg-surface-2 border border-white/5 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Overall Consensus
      </h3>

      {/* SVG gauge */}
      <div className="flex justify-center mb-4">
        <svg
          width={radius * 2 + stroke}
          height={radius + stroke + 10}
          viewBox={`0 0 ${radius * 2 + stroke} ${radius + stroke + 10}`}
        >
          {/* Background arc */}
          <path
            d={`M ${stroke / 2} ${radius + stroke / 2} A ${radius} ${radius} 0 0 1 ${radius * 2 + stroke / 2} ${radius + stroke / 2}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={`M ${stroke / 2} ${radius + stroke / 2} A ${radius} ${radius} 0 0 1 ${radius * 2 + stroke / 2} ${radius + stroke / 2}`}
            fill="none"
            stroke={consensusColor(consensus)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Percentage text */}
          <text
            x={radius + stroke / 2}
            y={radius - 5}
            textAnchor="middle"
            className="text-2xl font-bold"
            fill="white"
            fontSize="28"
          >
            {pct}%
          </text>
          <text
            x={radius + stroke / 2}
            y={radius + 16}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
          >
            consensus
          </text>
        </svg>
      </div>

      {/* Strongest points */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <span className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px]">
            ✓
          </span>
          <p className="text-gray-400 leading-snug">{strongestAgreement}</p>
        </div>
        <div className="flex items-start gap-2 text-xs">
          <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px]">
            ✗
          </span>
          <p className="text-gray-400 leading-snug">{strongestDisagreement}</p>
        </div>
      </div>
    </div>
  );
}

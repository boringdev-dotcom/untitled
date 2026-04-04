import { Streamdown } from "streamdown";
import type { CouncilEvent } from "../types";

interface Props {
  event: CouncilEvent;
}

export function ReportCard({ event }: Props) {
  return (
    <div className="stagger-item relative rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, #ff993344, #00993344, #4169e144, #ffcc0044, #0038b844, #ff993344)",
          padding: "1px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />

      <div className="bg-surface-2 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent">
          <span className="text-2xl">📜</span>
          <div>
            <h3 className="font-semibold text-white">Council Synthesis</h3>
            <p className="text-xs text-gray-400">
              Final report from the moderator
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="prose prose-invert prose-sm max-w-none">
            <Streamdown>{event.content}</Streamdown>
          </div>
        </div>
      </div>
    </div>
  );
}

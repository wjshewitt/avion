"use client";

import { AlertTriangle, Shield, Zap, Info } from "lucide-react";
import type { RiskProfile } from "@/lib/weather/risk/types";

interface RiskPreferenceStepProps {
  profile: RiskProfile;
  updateData: (data: { riskProfile: RiskProfile }) => void;
}

export function RiskPreferenceStep({ profile, updateData }: RiskPreferenceStepProps) {
  const profiles: { id: RiskProfile; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: "standard",
      title: "Standard",
      desc: "Balanced approach. Uses standard aviation weather thresholds.",
      icon: Shield,
      color: "text-blue-500",
    },
    {
      id: "conservative",
      title: "Conservative",
      desc: "Safety first. Penalizes marginal weather more heavily. Ideal for VIP/Pax ops.",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      id: "aggressive",
      title: "Mission Critical",
      desc: "Prioritizes completion. Tolerates lower visibility if safety mins are met.",
      icon: Zap,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Risk Profile
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wide">
          How should we evaluate flight risks?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => updateData({ riskProfile: p.id })}
            className={`tactile-option p-4 rounded-md flex items-start gap-4 text-left transition-all border ${
              profile === p.id
                ? "bg-zinc-50 dark:bg-zinc-800 border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]"
                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div
              className={`icon-box w-10 h-10 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                profile === p.id ? "bg-white dark:bg-zinc-700" : "bg-zinc-50 dark:bg-zinc-800"
              }`}
            >
              <p.icon size={20} strokeWidth={1.5} className={p.color} />
            </div>
            <div>
              <div className="font-bold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                {p.title}
              </div>
              <div className="desc text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {p.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-sm border border-zinc-100 dark:border-zinc-800 flex gap-3 items-start">
        <Info size={16} className="text-zinc-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          This setting adjusts the sensitivity of the Flight Risk Engine v2. You can fine-tune specific weights (e.g., Wind vs. Icing) in Settings later.
        </div>
      </div>
    </div>
  );
}

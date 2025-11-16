"use client";

import { Plane, Briefcase } from "lucide-react";

interface RoleStepProps {
  role: string;
  updateData: (data: { role: string }) => void;
}

export function RoleStep({ role, updateData }: RoleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your role
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wide">
          Choose how you'll use FlightOps
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => updateData({ role: "flight_ops" })}
          className={`tactile-option p-4 rounded-md flex items-start gap-4 text-left transition-all ${
            role === "flight_ops" ? "selected" : "bg-white"
          }`}
        >
          <div className="icon-box w-10 h-10 rounded-sm bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0 transition-colors">
            <Plane size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-bold text-sm mb-1">Flight Management</div>
            <div className="desc text-xs text-zinc-500 leading-relaxed">
              Full access to fleet telemetry, risk analysis, and crew scheduling.
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-disabled="true"
          className="tactile-option relative p-4 rounded-md flex items-start gap-4 text-left transition-all bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-700 opacity-70 cursor-not-allowed"
        >
          <div className="icon-box w-10 h-10 rounded-sm bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0 transition-colors">
            <Briefcase size={20} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-sm">Charter Broker</div>
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 px-2 py-[2px] text-[10px] font-mono uppercase tracking-wide">
                Coming soon
              </span>
            </div>
            <div className="desc text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tools for charter sales and quoting will be available in a future update.
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-br from-white/40 to-transparent dark:from-zinc-900/40" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import {
  PRIMARY_TIMEZONE_REGIONS,
  resolveTimezoneByIdOrLabel,
  type TimezoneRegion,
} from "@/lib/utils/timezone-regions";
import { AvionDatePicker } from "@/components/ui/AvionDatePicker";

interface CalibrationStepProps {
  timezone: string;
  hqLocation: string;
  hqTimezoneSameAsMain: boolean;
  updateData: (data: { timezone?: string; hqLocation?: string; hqTimezoneSameAsMain?: boolean }) => void;
}

export function CalibrationStep({ timezone, hqLocation, hqTimezoneSameAsMain, updateData }: CalibrationStepProps) {
  const selectedRegion = resolveTimezoneByIdOrLabel(timezone);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSelectRegion = (region: TimezoneRegion) => {
    updateData({ timezone: region.label });
  };

  const handleSelectHQSame = () => {
    updateData({ hqTimezoneSameAsMain: !hqTimezoneSameAsMain });
  };

  return (
    <div
      ref={containerRef}
      className="md:grid md:grid-cols-[1.1fr_1.4fr] md:gap-10 space-y-6 md:space-y-0"
    >
      {/* Left column: timezones */}
      <div className="space-y-6 md:pr-4">
        <div className="rail-scroll relative max-h-[340px] pr-3 space-y-3">
          {PRIMARY_TIMEZONE_REGIONS.map((region) => {
            const isActive = timezone === region.label;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelectRegion(region)}
                className={`w-full px-3.5 py-3 rounded-sm flex items-center justify-between text-xs font-mono transition-all border ${
                  isActive
                    ? "bg-zinc-900 text-zinc-50 border-zinc-700 shadow-[0_0_0_1px_var(--accent-primary)]"
                    : "bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-6 w-[3px] ${
                      isActive ? "bg-[var(--accent-primary)]" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                  <span>{region.label}</span>
                </div>
                <span className={isActive ? "text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}>
                  {region.offset}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right column: HQ settings */}
      <div className="space-y-6">
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">
            Headquarters · Location
          </div>
          <input
            type="text"
            value={hqLocation}
            onChange={(e) => updateData({ hqLocation: e.target.value })}
            placeholder="e.g. London, UK"
            className="mt-2 w-full rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
          />

          <div className="mt-3 flex items-start gap-3 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2">
            <button
              type="button"
              onClick={handleSelectHQSame}
              className="mt-0.5 h-3 w-3 rounded-sm border border-zinc-400 dark:border-zinc-500 flex items-center justify-center bg-white dark:bg-zinc-900"
              aria-pressed={hqTimezoneSameAsMain}
              aria-label="Toggle whether operations timezone matches HQ local time"
            >
              {hqTimezoneSameAsMain && (
                <div className="h-2 w-2 bg-[var(--accent-primary)]" />
              )}
            </button>
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                Operations timezone matches HQ local time
              </div>
              <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                Uncheck if your team works to a different main timezone than the HQ city (e.g. UK-based, US-time operations).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

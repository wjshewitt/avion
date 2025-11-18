"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type NotamSeverity = "info" | "caution" | "critical";

interface Notam {
  id: string;
  type: "RUNWAY" | "AIRSPACE" | "NAV" | "FACILITIES";
  severity: NotamSeverity;
  effectiveTime: number; // Hours from now
  duration: number; // Hours
  title: string;
  description: string;
}

const sampleNotams: Notam[] = [
  {
    id: "N1",
    type: "RUNWAY",
    severity: "critical",
    effectiveTime: -2,
    duration: 6,
    title: "Runway 09/27 Closed",
    description: "RWY 09/27 CLSD FOR MAINT",
  },
  {
    id: "N2",
    type: "NAV",
    severity: "caution",
    effectiveTime: 0,
    duration: 12,
    title: "ILS 27 Out of Service",
    description: "ILS RWY 27 U/S",
  },
  {
    id: "N3",
    type: "AIRSPACE",
    severity: "info",
    effectiveTime: 3,
    duration: 4,
    title: "TFR Active",
    description: "TEMPORARY FLIGHT RESTRICTION 5NM RADIUS",
  },
  {
    id: "N4",
    type: "FACILITIES",
    severity: "caution",
    effectiveTime: 8,
    duration: 2,
    title: "Tower Hours Modified",
    description: "TOWER OPS 0600-2200 LOCAL",
  },
];

export function ExperimentalNotamTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "RUNWAY" | "AIRSPACE" | "NAV" | "FACILITIES">("ALL");

  const filteredNotams = filterType === "ALL" 
    ? sampleNotams 
    : sampleNotams.filter(n => n.type === filterType);

  const getSeverityColor = (severity: NotamSeverity) => {
    switch (severity) {
      case "critical":
        return "border-[#F04E30] bg-[#F04E30]/10";
      case "caution":
        return "border-amber-500 bg-amber-500/10";
      case "info":
        return "border-[#666] bg-[#666]/10";
    }
  };

  const getSeverityBadge = (severity: NotamSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-[#F04E30] text-white";
      case "caution":
        return "bg-amber-500 text-black";
      case "info":
        return "bg-[#999] text-black";
    }
  };

  // Timeline spans 24 hours
  const timelineHours = 24;
  const currentTimePosition = 20; // 20% from left represents "now"

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Active NOTAM Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            ACTIVE NOTAMS
          </div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F04E30] text-white text-xs font-mono font-bold">
            {filteredNotams.length}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex gap-1">
          {["ALL", "RUNWAY", "AIRSPACE", "NAV", "FACILITIES"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type as typeof filterType)}
              className={cn(
                "px-2 py-1 rounded-sm border border-[#333] text-[9px] font-mono uppercase tracking-widest transition-colors",
                filterType === type
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 relative rounded-sm bg-[#1A1A1A] p-4 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.05)]">
        {/* Hour Markers */}
        <div className="relative h-8 border-b border-[#333]">
          {Array.from({ length: 7 }).map((_, i) => {
            const hour = i * 4;
            const position = (hour / timelineHours) * 100;
            return (
              <div
                key={i}
                className="absolute"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                <div className="h-2 w-0.5 bg-[#666]" />
                <span className="text-[9px] font-mono text-[#999] absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {i === 0 ? "NOW" : `+${hour}h`}
                </span>
              </div>
            );
          })}

          {/* Current Time Indicator */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-[#F04E30]"
            style={{ left: `${currentTimePosition}%` }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* NOTAM Cards */}
        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {filteredNotams.map((notam, idx) => {
              const startPosition = ((notam.effectiveTime + 2) / timelineHours) * 100; // +2 to offset from start
              const width = (notam.duration / timelineHours) * 100;
              const isExpanded = expandedId === notam.id;

              return (
                <motion.div
                  key={notam.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {/* Timeline Bar */}
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      getSeverityColor(notam.severity),
                    )}
                    style={{
                      marginLeft: `${Math.max(0, startPosition)}%`,
                      width: `${Math.min(100 - startPosition, width)}%`,
                    }}
                  />

                  {/* NOTAM Card */}
                  <motion.div
                    layout
                    onClick={() => setExpandedId(isExpanded ? null : notam.id)}
                    className={cn(
                      "mt-1 cursor-pointer rounded-sm border bg-[#2A2A2A] p-3 transition-colors hover:bg-[#333]",
                      getSeverityColor(notam.severity),
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest",
                              getSeverityBadge(notam.severity),
                            )}
                          >
                            {notam.type}
                          </span>
                          <span className="text-xs font-mono text-white">{notam.title}</span>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-xs font-mono text-[#A1A1AA] mt-2">
                                {notam.description}
                              </p>
                              <div className="mt-2 flex gap-4 text-[10px] font-mono text-[#999]">
                                <span>
                                  EFFECTIVE: {notam.effectiveTime >= 0 ? `+${notam.effectiveTime}h` : `${notam.effectiveTime}h`}
                                </span>
                                <span>DURATION: {notam.duration}h</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="text-[#999]">
                        {isExpanded ? "▼" : "▶"}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

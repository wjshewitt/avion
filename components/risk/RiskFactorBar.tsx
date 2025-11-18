"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RiskFactorBarProps {
  name: string;
  score: number;
  severity?: "low" | "moderate" | "high";
  details?: {
    actualValue?: string | number;
    threshold?: string;
    impact?: string;
  };
  className?: string;
}

function getColorClasses(score: number, severity?: string) {
  if (severity === "high" || score >= 60) {
    return {
      bar: "bg-[#F04E30]",
      text: "text-[#F04E30]",
      bg: "bg-[#F04E30]/10",
    };
  }
  if (severity === "moderate" || score >= 30) {
    return {
      bar: "bg-blue-500",
      text: "text-blue-500",
      bg: "bg-blue-500/10",
    };
  }
  return {
    bar: "bg-emerald-500",
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
  };
}

function formatFactorName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function RiskFactorBar({
  name,
  score,
  severity,
  details,
  className,
}: RiskFactorBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getColorClasses(score, severity);
  const displayName = formatFactorName(name);
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          {displayName}
        </span>
        <span className={cn("text-sm font-mono tabular-nums", colors.text)}>
          {score}
        </span>
      </div>

      {/* Bar track */}
      <div className="relative h-2 bg-muted rounded-sm overflow-hidden">
        {/* Fill */}
        <motion.div
          className={cn("h-full", colors.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Tooltip */}
      {details && showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "absolute z-10 left-0 bottom-full mb-2 p-3 rounded-sm border border-border shadow-lg min-w-[200px]",
            colors.bg,
            "backdrop-blur-sm"
          )}
        >
          <div className="space-y-1 text-xs">
            {details.actualValue !== undefined && (
              <div>
                <span className="text-muted-foreground">Value: </span>
                <span className="text-foreground font-mono">{details.actualValue}</span>
              </div>
            )}
            {details.threshold && (
              <div>
                <span className="text-muted-foreground">Threshold: </span>
                <span className="text-foreground font-mono">{details.threshold}</span>
              </div>
            )}
            {details.impact && (
              <div className="pt-1 border-t border-border/50">
                <span className="text-foreground">{details.impact}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

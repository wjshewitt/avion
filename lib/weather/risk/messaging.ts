import type { AggregatedRiskResult } from "@/lib/weather/risk/types";

export interface WeatherRiskAlert {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface MessagingBundle {
  alerts: WeatherRiskAlert[];
  plainTextSummary: string;
  guestMessageTemplate: string;
  opsActionables: string[];
}

export function buildMessaging(agg: AggregatedRiskResult): MessagingBundle {
  const alerts: WeatherRiskAlert[] = [];
  for (const f of agg.factorBreakdown) {
    if (f.score >= 40 && f.messages.length) {
      alerts.push({
        title: f.name.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
        message: f.messages.join("; "),
        severity: f.score >= 70 ? "critical" : "warning",
      });
    }
  }

  const top = alerts[0];
  let summary = "Weather normal.";
  if (agg.status === "insufficient_data") {
    summary = "Insufficient data for a reliable weather risk assessment.";
  } else if (top) {
    summary = `${top.title}: ${top.message}`;
  }

  const guest = agg.tier === "high_disruption"
    ? "Weather may significantly impact timing today. Our team is monitoring conditions closely."
    : agg.tier === "monitor"
    ? "Weather could cause delays; we are tracking and will update proactively."
    : "Weather looks favorable; operations remain on track.";

  const ops: string[] = [];
  if (agg.tier === "high_disruption") {
    ops.push("Trigger diversion/contingency planning");
    ops.push("Notify stakeholders and adjust departure windows as needed");
  } else if (agg.tier === "monitor") {
    ops.push("Increase METAR/TAF refresh cadence");
    ops.push("Coordinate with crew on potential reroute or delays");
  } else {
    ops.push("No action required; continue routine monitoring");
  }

  return {
    alerts,
    plainTextSummary: summary,
    guestMessageTemplate: guest,
    opsActionables: ops,
  };
}

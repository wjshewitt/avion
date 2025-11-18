import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";
import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

const severityWeights: Record<string, number> = {
  extreme: 50,
  high: 40,
  moderate: 25,
  low: 10,
  info: 5,
  unknown: 5,
};

function isHazardActive(hazard: HazardFeatureNormalized, now: Date): boolean {
  const start = hazard.validFrom ? new Date(hazard.validFrom).getTime() : null;
  const end = hazard.validTo ? new Date(hazard.validTo).getTime() : null;
  const nowMs = now.getTime();
  if (start && nowMs < start) return false;
  if (end && nowMs > end) return false;
  return true;
}

function summarizeHazard(hazard: HazardFeatureNormalized): string {
  const name = hazard.name || hazard.kind.toUpperCase();
  const severity = hazard.severity.toUpperCase();
  return `${name} (${severity})`;
}

function computePirepSeverity(reports: PilotReport[]): number {
  return reports.reduce((score, report) => {
    const icing = report.icing ?? "unknown";
    const turb = report.turbulence ?? "unknown";
    const impact = Math.max(
      severityWeights[icing] ?? 0,
      severityWeights[turb] ?? 0
    );
    return Math.min(100, score + impact / 2);
  }, 0);
}

export function assessHazardAdvisories(
  input: RiskInputs
): WeatherRiskFactorResult {
  const hazards = (input.hazards || []).filter((hazard) =>
    isHazardActive(hazard, input.now)
  );
  const pireps = input.pireps || [];

  let score = hazards.reduce((total, hazard) => {
    return Math.min(100, total + (severityWeights[hazard.severity] ?? 0));
  }, 0);

  score = Math.min(100, score + computePirepSeverity(pireps));

  const messages: string[] = [];

  if (hazards.length) {
    const topHazards = hazards
      .slice(0, 3)
      .map((hazard) => summarizeHazard(hazard));
    messages.push(`Active advisories: ${topHazards.join(", ")}`);
  }

  if (pireps.length) {
    const severeReports = pireps.filter(
      (report) =>
        report.icing === "severe" ||
        report.turbulence === "severe" ||
        report.icing === "extreme" ||
        report.turbulence === "extreme"
    );
    if (severeReports.length) {
      messages.push(
        `${severeReports.length} severe pilot reports in the vicinity`
      );
    } else {
      messages.push(`${pireps.length} pilot reports in the vicinity`);
    }
  }

  if (!hazards.length && !pireps.length) {
    messages.push("No active hazard advisories nearby");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";

  return {
    name: "hazard_advisories",
    score,
    severity,
    confidencePenalty: hazards.length || pireps.length ? 0 : 0.15,
    messages,
    details: {
      actualValue: `${hazards.length} hazards, ${pireps.length} PIREPs`,
      threshold: "Active SIGMET/CWA/GAIRMET or severe PIREPs",
      impact:
        severity === "high"
          ? "Severe advisories in effect for planned operations"
          : severity === "moderate"
          ? "Advisories present; increased vigilance recommended"
          : "No significant advisories",
    },
    timeframe: {
      from: hazards[0]?.validFrom,
      to: hazards[0]?.validTo,
    },
    sources: ["awc.hazards"],
  };
}

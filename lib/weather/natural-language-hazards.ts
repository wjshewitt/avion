/**
 * Natural Language Hazard Formatter
 * Converts SIGMET/hazard and PIREP data into plain English
 */

import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";
import { haversineNm } from "@/lib/weather/geo";

export interface HazardBriefing {
  summary: string | null;
  items: string[];
  severity: "none" | "low" | "moderate" | "high" | "extreme";
}

/**
 * Format hazard type into readable name
 */
function formatHazardType(hazard: HazardFeatureNormalized): string {
  const name = hazard.name?.toLowerCase() || hazard.kind.toLowerCase();
  
  // Map common hazard types to friendly names
  const typeMap: Record<string, string> = {
    "turb": "turbulence",
    "turbulence": "turbulence",
    "ice": "icing",
    "icing": "icing",
    "ifr": "IFR conditions",
    "mtn obscn": "mountain obscuration",
    "mt obsc": "mountain obscuration",
    "convective": "thunderstorm activity",
    "ts": "thunderstorms",
    "thunderstorm": "thunderstorms",
    "llws": "low level wind shear",
    "sfc wnd": "surface winds",
    "fzlvl": "freezing level",
  };
  
  return typeMap[name] || name;
}

export function formatHazardSentence(hazard: HazardFeatureNormalized, airportCoords?: [number, number]): string {
  return formatHazard(hazard, airportCoords);
}

/**
 * Format altitude range into plain English
 */
function formatAltitude(altitude?: { lowerFt?: number | null; upperFt?: number | null }): string {
  if (!altitude) return "";
  
  const lower = altitude.lowerFt;
  const upper = altitude.upperFt;
  
  if (lower && upper) {
    return ` between ${(lower / 1000).toFixed(0)},000-${(upper / 1000).toFixed(0)},000 feet`;
  } else if (lower) {
    return ` above ${(lower / 1000).toFixed(0)},000 feet`;
  } else if (upper) {
    return ` below ${(upper / 1000).toFixed(0)},000 feet`;
  }
  
  return "";
}

/**
 * Format severity into plain English adjective
 */
function formatSeverityAdjective(severity: string): string {
  const severityMap: Record<string, string> = {
    "extreme": "severe",
    "high": "moderate to severe",
    "moderate": "moderate",
    "low": "light",
    "info": "",
    "unknown": "",
  };
  
  return severityMap[severity] || "";
}

/**
 * Format a single hazard into plain English with distance
 */
function formatHazard(
  hazard: HazardFeatureNormalized,
  airportCoords?: [number, number]
): string {
  const severityAdj = formatSeverityAdjective(hazard.severity);
  const hazardType = formatHazardType(hazard);
  const altitudeRange = formatAltitude(hazard.altitude);
  
  // Build the sentence
  const parts: string[] = [];
  
  if (severityAdj) {
    parts.push(severityAdj);
  }
  
  parts.push(hazardType);
  
  let sentence = parts.join(" ");
  
  // Capitalize first letter
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  
  // Add distance if airport coordinates available
  if (airportCoords && hazard.geometry?.centroid) {
    const [airportLon, airportLat] = airportCoords;
    const [hazardLon, hazardLat] = hazard.geometry.centroid;
    
    const distance = haversineNm(
      { lat: airportLat, lon: airportLon },
      { lat: hazardLat, lon: hazardLon }
    );
    
    // Format distance
    if (distance < 10) {
      sentence += " nearby";
    } else {
      sentence += ` ${Math.round(distance)} NM away`;
    }
  }
  
  // Add altitude
  if (altitudeRange) {
    sentence += altitudeRange;
  }
  
  return sentence;
}

/**
 * Format direction in degrees to cardinal direction
 */
function formatDirection(degrees: number): string {
  const directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index] || "unknown direction";
}

/**
 * Format PIREP severity
 */
function formatPirepSeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    "extreme": "extreme",
    "severe": "severe",
    "moderate": "moderate",
    "light": "light",
    "unknown": "",
  };
  
  return severityMap[severity] || "";
}

/**
 * Format a single PIREP into plain English
 */
function formatPirep(pirep: PilotReport): string | null {
  const conditions: string[] = [];
  
  // Turbulence
  if (pirep.turbulence && pirep.turbulence !== "unknown") {
    const severity = formatPirepSeverity(pirep.turbulence);
    if (severity) {
      conditions.push(`${severity} turbulence`);
    }
  }
  
  // Icing
  if (pirep.icing && pirep.icing !== "unknown") {
    const severity = formatPirepSeverity(pirep.icing);
    if (severity) {
      conditions.push(`${severity} icing`);
    }
  }
  
  if (conditions.length === 0) {
    return null;
  }
  
  let sentence = conditions.join(" and ");
  
  // Add altitude if available
  if (pirep.altitudeFtMsl) {
    const altitude = (pirep.altitudeFtMsl / 1000).toFixed(0);
    sentence += ` reported at ${altitude},000 feet`;
  } else {
    sentence += " reported by pilot";
  }
  
  // Capitalize first letter
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  
  return sentence;
}

/**
 * Determine overall severity from hazards
 */
function determineSeverity(hazards: HazardFeatureNormalized[], pireps: PilotReport[]): HazardBriefing["severity"] {
  if (hazards.length === 0 && pireps.length === 0) {
    return "none";
  }
  
  // Check for extreme hazards
  if (hazards.some(h => h.severity === "extreme")) {
    return "extreme";
  }
  
  // Check for severe PIREPs
  if (pireps.some(p => p.turbulence === "extreme" || p.icing === "extreme" || p.turbulence === "severe" || p.icing === "severe")) {
    return "high";
  }
  
  // Check for high severity hazards
  if (hazards.some(h => h.severity === "high")) {
    return "high";
  }
  
  // Check for moderate hazards or PIREPs
  if (hazards.some(h => h.severity === "moderate") || pireps.some(p => p.turbulence === "moderate" || p.icing === "moderate")) {
    return "moderate";
  }
  
  return "low";
}

/**
 * Generate summary sentence based on severity
 */
function generateSummary(severity: HazardBriefing["severity"], hazardCount: number, pirepCount: number): string | null {
  if (severity === "none") {
    return null;
  }
  
  const totalItems = hazardCount + pirepCount;
  
  switch (severity) {
    case "extreme":
      return `⚠️ SEVERE WEATHER: ${totalItems} active ${totalItems === 1 ? "advisory" : "advisories"} in effect. Exercise extreme caution.`;
    case "high":
      return `⚠️ Significant weather advisories: ${totalItems} active ${totalItems === 1 ? "condition" : "conditions"} reported. Review carefully before departure.`;
    case "moderate":
      return `${totalItems} weather ${totalItems === 1 ? "advisory" : "advisories"} in vicinity. Monitor conditions.`;
    case "low":
      return `${totalItems} minor weather ${totalItems === 1 ? "advisory" : "advisories"} nearby.`;
    default:
      return null;
  }
}

/**
 * Check if hazard is currently active
 */
function isHazardActive(hazard: HazardFeatureNormalized, now: Date): boolean {
  const nowMs = now.getTime();
  
  if (hazard.validFrom) {
    const start = new Date(hazard.validFrom).getTime();
    if (nowMs < start) return false;
  }
  
  if (hazard.validTo) {
    const end = new Date(hazard.validTo).getTime();
    if (nowMs > end) return false;
  }
  
  return true;
}

/**
 * Main function: Format hazard briefing in plain English
 */
export function formatHazardBriefing(
  hazards: HazardFeatureNormalized[],
  pireps: PilotReport[],
  airportCoords?: [number, number],
  now: Date = new Date()
): HazardBriefing {
  // Filter to active hazards only
  const activeHazards = hazards.filter(h => isHazardActive(h, now));
  
  // Sort by distance (closest first) if coordinates available, then by severity
  if (airportCoords) {
    activeHazards.sort((a, b) => {
      // First try to sort by distance
      if (a.geometry?.centroid && b.geometry?.centroid) {
        const distA = haversineNm(
          { lat: airportCoords[1], lon: airportCoords[0] },
          { lat: a.geometry.centroid[1], lon: a.geometry.centroid[0] }
        );
        const distB = haversineNm(
          { lat: airportCoords[1], lon: airportCoords[0] },
          { lat: b.geometry.centroid[1], lon: b.geometry.centroid[0] }
        );
        return distA - distB;
      }
      // Fall back to severity if no distance available
      const severityOrder = { extreme: 0, high: 1, moderate: 2, low: 3, info: 4, unknown: 5 };
      return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
    });
  } else {
    // Sort by severity only if no coordinates
    const severityOrder = { extreme: 0, high: 1, moderate: 2, low: 3, info: 4, unknown: 5 };
    activeHazards.sort((a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99));
  }
  
  // Group identical hazard types
  const typeGroups = new Map<string, HazardFeatureNormalized[]>();
  activeHazards.forEach(hazard => {
    const key = (hazard.name || hazard.kind).toLowerCase();
    if (!typeGroups.has(key)) {
      typeGroups.set(key, []);
    }
    typeGroups.get(key)!.push(hazard);
  });
  
  // Format each group (show closest of each type, with count if multiple)
  const hazardItems: string[] = [];
  typeGroups.forEach(group => {
    const closest = group[0]; // Already sorted by distance
    let text = formatHazard(closest, airportCoords);
    
    if (group.length > 1) {
      text += ` (${group.length} areas)`;
    }
    
    hazardItems.push(text);
  });
  
  // Sort PIREPs by severity
  const pirepSeverityOrder: Record<string, number> = {
    extreme: 0,
    severe: 1,
    moderate: 2,
    light: 3,
    unknown: 99,
  };
  
  const sortedPireps = [...pireps].sort((a, b) => {
    const aSeverity = Math.min(pirepSeverityOrder[a.turbulence || "unknown"] || 99, pirepSeverityOrder[a.icing || "unknown"] || 99);
    const bSeverity = Math.min(pirepSeverityOrder[b.turbulence || "unknown"] || 99, pirepSeverityOrder[b.icing || "unknown"] || 99);
    return aSeverity - bSeverity;
  });
  
  // Format PIREPs (limit to most significant)
  const pirepItems = sortedPireps
    .slice(0, 3) // Only show top 3 PIREPs
    .map(formatPirep)
    .filter((item): item is string => item !== null);
  
  const allItems = [...hazardItems, ...pirepItems];
  const severity = determineSeverity(activeHazards, sortedPireps);
  const summary = generateSummary(severity, activeHazards.length, sortedPireps.length);
  
  return {
    summary,
    items: allItems,
    severity,
  };
}

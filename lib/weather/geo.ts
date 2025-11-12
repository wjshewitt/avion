// Minimal geospatial helpers; avoids external heavy deps

export interface LatLon { lat: number; lon: number }

export function haversineNm(a: LatLon, b: LatLon): number {
  const R = 3440.065; // nautical miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type HazardSeverity = "high" | "moderate" | "info";

export function assessSigmetProximity(distanceNm: number): HazardSeverity {
  if (distanceNm <= 50) return "high";
  if (distanceNm <= 100) return "moderate";
  return "info";
}

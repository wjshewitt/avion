// Server-only AirportDB config helpers

export function getAirportDbToken(): string {
  const token = process.env.AIRPORTDB_API_TOKEN || process.env.AIRPORTDB_API_KEY;
  if (!token) {
    throw new Error("Missing AirportDB API token (AIRPORTDB_API_TOKEN)");
  }
  return token;
}

export function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("AirportDB token access is server-only");
  }
}

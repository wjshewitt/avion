export const queryKeys = {
  flights: {
    all: ["flights"] as const,
    lists: () => [...queryKeys.flights.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.flights.lists(), filters] as const,
    details: () => [...queryKeys.flights.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.flights.details(), id] as const,
  },
  auth: {
    session: ["auth", "session"] as const,
    user: ["auth", "user"] as const,
  },
  weather: {
    all: ["weather"] as const,
    airfield: (icao: string) =>
      [...queryKeys.weather.all, "airfield", icao.toUpperCase()] as const,
    metar: (icaos: string[]) =>
      [...queryKeys.weather.all, "metar", icaos.sort()] as const,
    taf: (icaos: string[]) =>
      [...queryKeys.weather.all, "taf", icaos.sort()] as const,
    station: (icaos: string[]) =>
      [...queryKeys.weather.all, "station", icaos.sort()] as const,
    metarRadius: (icao: string, miles: number) =>
      [...queryKeys.weather.all, "metar-radius", icao, miles] as const,
    complete: (icao: string) =>
      [...queryKeys.weather.all, "complete", icao] as const,
    risk: (params: { flightId?: string; airport?: string; mode?: string; scheduledDeparture?: string; scheduledArrival?: string }) =>
      [...queryKeys.weather.all, "risk", params] as const,
    riskExplanation: (params: { flightId?: string; airport?: string; riskData?: any }) =>
      [...queryKeys.weather.all, "risk-explanation", params] as const,
  },
  flightAlerts: {
    all: ["flight-alerts"] as const,
    lists: () => ["flight-alerts", "list"] as const,
    list: (filters?: Record<string, any>) =>
      ["flight-alerts", "list", filters] as const,
  },
  airports: {
    all: ["airports"] as const,
    filtered: (filters?: Record<string, any>) =>
      ["airports", "filtered", filters] as const,
    filterOptions: () => ["airports", "filter-options"] as const,
    allLite: () => ["airports", "all-lite"] as const,
  },
} as const;

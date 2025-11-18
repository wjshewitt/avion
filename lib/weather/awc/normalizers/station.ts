import { AwcStationInfoResponse } from "@/lib/weather/validation/awc";
import { StationInfo } from "@/types/weather";

export function normalizeStationInfo(
  response: AwcStationInfoResponse
): StationInfo[] {
  return response.stations.map((station) => {
    const elevationFt =
      station.elevation_ft ??
      (typeof station.elevation_m === "number"
        ? Math.round(station.elevation_m * 3.28084)
        : undefined);

    return {
      icaoId: station.icaoId,
      name: station.name,
      city: station.city ?? undefined,
      state: station.state ?? undefined,
      country: station.country ?? undefined,
      latitude: station.latitude ?? undefined,
      longitude: station.longitude ?? undefined,
      elevationFt,
      timezone: station.timezone ?? undefined,
      runwaySummary: station.runway?.map((runway) => ({
        id: runway.id,
        lengthFt: runway.length_ft ?? undefined,
        surface: runway.surface ?? undefined,
      })),
      siteTypes: station.siteType,
    } satisfies StationInfo;
  });
}

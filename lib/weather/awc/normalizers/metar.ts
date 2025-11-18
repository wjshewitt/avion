import { MetarData, ProviderTaggedMetar, WeatherSource } from "@/types/weather";

export function tagMetarSource(
  records: MetarData[],
  source: WeatherSource
): ProviderTaggedMetar[] {
  return records.map((record) => ({
    ...record,
    source,
  }));
}

import { ProviderTaggedTaf, TafData, WeatherSource } from "@/types/weather";

export function tagTafSource(
  records: TafData[],
  source: WeatherSource
): ProviderTaggedTaf[] {
  return records.map((record) => ({
    ...record,
    source,
  }));
}

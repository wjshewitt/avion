"use client";

import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import { MetarCard, TafCard } from "@/components/chat/tool-ui";
import type { WeatherData } from "@/components/chat/tool-ui/weather-card-components";
import {
  analyzeMetarConcerns,
  analyzeTafConcerns,
  generateWeatherSummary,
  DEFAULT_WEATHER_THRESHOLDS,
} from "@/lib/weather/weatherConcerns";

interface AirportWeatherGeminiCardProps {
  icao: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
}

function toWeatherData(icao: string, metar?: DecodedMetar | null, taf?: DecodedTaf | null): WeatherData {
  return {
    icao,
    metar: metar as unknown as WeatherData["metar"],
    taf: taf as unknown as WeatherData["taf"],
  };
}

export function AirportWeatherGeminiCard({ icao, metar, taf }: AirportWeatherGeminiCardProps) {
  const hasMetar = !!metar;
  const hasTaf = !!taf;

  if (!hasMetar && !hasTaf) {
    return null;
  }

  // Derive concerns/severity to influence card choice
  const concerns = [
    ...(metar ? analyzeMetarConcerns(metar, DEFAULT_WEATHER_THRESHOLDS) : []),
    ...(taf ? analyzeTafConcerns(taf, DEFAULT_WEATHER_THRESHOLDS) : []),
  ];
  const summary = generateWeatherSummary(concerns);

  const data = toWeatherData(icao, metar, taf);

  // If only one product is available, defer to the corresponding card
  if (hasMetar && !hasTaf) {
    return (
      <section className="mb-6">
        <MetarCard data={data} defaultExpanded />
      </section>
    );
  }

  if (hasTaf && !hasMetar) {
    return (
      <section className="mb-6">
        <TafCard data={data} defaultExpanded />
      </section>
    );
  }

  // Both METAR and TAF available: choose emphasis based on risk
  const hasExtreme = summary.hasExtremeConditions;
  const hasHigh = summary.hasHighRiskConditions;

  // For now, show METAR-focused card for benign conditions, TAF-focused for higher risk
  const emphasizeForecast = hasExtreme || hasHigh;

  return (
    <section className="mb-6 space-y-3">
      {emphasizeForecast && <TafCard data={data} defaultExpanded />}
      <MetarCard data={data} defaultExpanded={!emphasizeForecast} />
    </section>
  );
}

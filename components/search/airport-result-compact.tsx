import { FlightCategoryBadge } from './flight-category-badge';
import type { AirportSearchMatch } from '@/lib/search/unified-search';
import type { AirfieldWeatherData } from '@/lib/tanstack/hooks/useAirfieldWeather';

interface AirportResultCompactProps {
  airport: AirportSearchMatch;
  weather?: AirfieldWeatherData | null;
}

export function AirportResultCompact({ airport, weather }: AirportResultCompactProps) {
  return (
    <div className="px-3 py-3 flex items-start justify-between">
      {/* LEFT: Identifiers */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-mono font-semibold text-text-primary">
            {airport.icao}
          </span>
          {airport.iata && (
            <span className="text-[13px] font-mono text-text-secondary">
              · {airport.iata}
            </span>
          )}
        </div>
        <div className="text-[12px] text-text-primary">
          {airport.name}
        </div>
        <div className="text-[11px] text-text-secondary">
          {airport.city}, {airport.country}
        </div>
      </div>

      {/* RIGHT: Weather Hint */}
      {weather?.metar && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {weather.metar.temperature?.celsius !== undefined && (
            <span className="text-[12px] font-mono text-text-primary">
              {Math.round(weather.metar.temperature.celsius)}°C
            </span>
          )}
          <FlightCategoryBadge category={weather.metar.flight_category} />
        </div>
      )}
    </div>
  );
}

import { FlightCategoryBadge } from './flight-category-badge';
import { DataRow } from './data-row';
import type { AirfieldWeatherData } from '@/lib/tanstack/hooks/useAirfieldWeather';

interface WeatherCellProps {
  weather?: AirfieldWeatherData | null;
  isLoading?: boolean;
}

function WeatherSkeleton() {
  return (
    <div className="p-3 space-y-2 border-l border-border">
      <div className="h-3 w-32 bg-background-secondary animate-pulse" />
      <div className="h-4 w-24 bg-background-secondary animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-background-secondary animate-pulse" />
        <div className="h-3 w-full bg-background-secondary animate-pulse" />
        <div className="h-3 w-full bg-background-secondary animate-pulse" />
        <div className="h-3 w-full bg-background-secondary animate-pulse" />
      </div>
    </div>
  );
}

function formatWind(wind?: { degrees?: number; speed_kts?: number; gust_kts?: number }): string {
  if (!wind || wind.speed_kts === undefined) return '—';
  
  const direction = wind.degrees !== undefined ? `${wind.degrees.toString().padStart(3, '0')}°` : 'VRB';
  const speed = `${wind.speed_kts}kt`;
  const gust = wind.gust_kts ? ` G${wind.gust_kts}kt` : '';
  
  return `${direction} @ ${speed}${gust}`;
}

function formatClouds(clouds?: Array<{ code?: string; feet?: number }>): string {
  if (!clouds || clouds.length === 0) return 'CLR';
  
  const lowest = clouds[0];
  const code = lowest.code || '—';
  const altitude = lowest.feet ? ` ${lowest.feet.toLocaleString()}` : '';
  
  return `${code}${altitude}`;
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Unknown';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes === 1) return '1m ago';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const hours = Math.floor(diffMinutes / 60);
  if (hours === 1) return '1h ago';
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WeatherCell({ weather, isLoading }: WeatherCellProps) {
  if (isLoading) {
    return <WeatherSkeleton />;
  }

  if (!weather?.metar) {
    return (
      <div className="p-3 border-l border-border">
        <div className="text-[10px] text-text-secondary italic">
          Weather unavailable
        </div>
      </div>
    );
  }

  const m = weather.metar;

  return (
    <div className="p-3 space-y-2 border-l border-border">
      {/* Header */}
      <div className="text-[11px] uppercase font-mono text-text-secondary tracking-wider">
        CURRENT WEATHER
      </div>

      {/* Flight Category + Temp */}
      <div className="flex items-center gap-2 flex-wrap">
        <FlightCategoryBadge category={m.flight_category} />
        {m.temperature?.celsius !== undefined && (
          <span className="text-[12px] font-mono text-text-primary">
            {Math.round(m.temperature.celsius)}°C
            {m.temperature.fahrenheit !== undefined && (
              <span className="text-text-secondary">
                {' '}/ {Math.round(m.temperature.fahrenheit)}°F
              </span>
            )}
          </span>
        )}
      </div>

      {/* Data Grid */}
      <div className="space-y-1.5">
        <DataRow label="Wind" value={formatWind(m.wind)} />
        {m.visibility?.miles_float !== undefined && (
          <DataRow label="Vis" value={`${m.visibility.miles_float} SM`} />
        )}
        <DataRow label="Clouds" value={formatClouds(m.clouds)} />
        {m.barometer?.hg !== undefined && (
          <DataRow label="Altim" value={`${m.barometer.hg.toFixed(2)} inHg`} />
        )}
      </div>

      {/* Timestamp */}
      {m.observed && (
        <div className="text-[10px] text-text-secondary pt-1">
          {formatRelativeTime(m.observed)}
        </div>
      )}

      {/* Stale data warning */}
      {weather.isStale && weather.ageMinutes && weather.ageMinutes > 60 && (
        <div className="text-[10px] text-amber pt-1">
          ⚠️ Data may be outdated ({weather.ageMinutes}m old)
        </div>
      )}
    </div>
  );
}

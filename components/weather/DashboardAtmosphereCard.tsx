'use client';

import { useMemo } from 'react';
import { AtmosphereCard } from '@/components/weather/atmospheric/AtmosphereCard';
import { useAirportTemporalProfile } from '@/lib/tanstack/hooks/useTemporalProfile';
import type { WeatherCondition } from '@/components/weather/atmospheric/SkyEngine';
import type { Weather } from '@/lib/types';

interface DashboardAtmosphereCardProps {
  icao: string;
  stationName: string;
  weather: Weather;
  mapCondition: (weather: Weather) => WeatherCondition;
}

export function DashboardAtmosphereCard({ 
  icao, 
  stationName, 
  weather, 
  mapCondition 
}: DashboardAtmosphereCardProps) {
  
  const { data: temporalProfile } = useAirportTemporalProfile(icao, {
    enabled: Boolean(icao && icao.length === 4),
    staleTime: 5 * 60 * 1000,
  });

  // Parse Hour for SkyEngine (0-24)
  const hour = useMemo(() => {
    if (temporalProfile?.clock.localIso) {
      const date = new Date(temporalProfile.clock.localIso);
      if (!isNaN(date.getTime())) {
        return date.getHours() + (date.getMinutes() / 60);
      }
    }
    // Fallback if no profile
    return new Date().getUTCHours();
  }, [temporalProfile]);

  const localTime = temporalProfile?.clock.localTime ?? null;

  return (
    <AtmosphereCard
      icao={icao}
      stationName={stationName}
      flightCategory={weather.condition}
      condition={mapCondition(weather)}
      tempC={weather.tempCelsius}
      windSpeed={weather.wind.speed}
      windDirection={weather.wind.direction.toString()}
      visibilitySm={weather.visibility}
      qnhInHg={weather.qnh}
      hour={hour}
      localTime={localTime}
    />
  );
}

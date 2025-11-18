'use client';

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { AtmosphereCard } from '@/components/weather/atmospheric/AtmosphereCard';
import { useCompleteWeather } from '@/lib/tanstack/hooks/useWeather';
import { useAirportTemporalProfile } from '@/lib/tanstack/hooks/useTemporalProfile';
import { selectAtmosphereCard } from '@/lib/weather/avionAtmosphereMapping';
import { deriveCloudLayerState } from '@/lib/weather/clouds';
import { generateWeatherSummary } from '@/lib/weather/natural-language';
import { calculateSolarVisualHour, type WeatherCondition } from '@/components/weather/atmospheric/SkyEngine';

interface DashboardAtmosphereCardProps {
  icao: string;
  stationName?: string;
}

export function DashboardAtmosphereCard({ 
  icao, 
  stationName: initialStationName, 
}: DashboardAtmosphereCardProps) {
  
  const { metar, taf, station, loading, error } = useCompleteWeather({
    icao,
    metarOptions: { staleTime: 10 * 60 * 1000 },
  });

  const { data: temporalProfile } = useAirportTemporalProfile(icao, {
    enabled: Boolean(icao && icao.length === 4),
    staleTime: 5 * 60 * 1000,
  });

  // Parse Hour for SkyEngine (0-24)
  const hour = useMemo(() => {
    if (temporalProfile?.clock.localIso && temporalProfile?.sun) {
      return calculateSolarVisualHour(
        temporalProfile.clock.localIso,
        temporalProfile.sun.sunriseUtc, // Note: using UTC ISO strings for calculation as they are absolute points in time
        temporalProfile.sun.sunsetUtc
      );
    }

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
  
  // Compute derived values
  const isNightFromAuthority = temporalProfile ? !temporalProfile.sun.isDaylight : undefined;
  const atmosphere = metar ? selectAtmosphereCard({ metar, taf, isNightOverride: isNightFromAuthority }) : null;
  const cloudState = metar ? deriveCloudLayerState(metar) : null;

  const variant = useMemo(() => {
    if (!atmosphere) return 'sunny' as const;
    if (!cloudState) return atmosphere.variant;
    if (
      atmosphere.variant === 'sunny' &&
      cloudState.category !== 'clear' &&
      cloudState.category !== 'high-thin'
    ) {
      return 'cloudy' as const;
    }
    return atmosphere.variant;
  }, [atmosphere, cloudState]);

  // Map to new Engine conditions
  const condition: WeatherCondition = useMemo(() => {
    switch (variant) {
      case 'sunny': return 'clear';
      case 'clear-night': return 'clear';
      case 'cloudy': return 'cloudy';
      case 'heavy-rain': return 'rain';
      case 'thunderstorm': return 'storm';
      case 'low-vis-fog': return 'fog';
      case 'arctic-snow': return 'snow';
      default: return 'clear';
    }
  }, [variant]);

  // Generate natural language summary
  const naturalLanguage = useMemo(() => {
    if (!metar) return undefined;
    return generateWeatherSummary(metar, variant, temporalProfile, taf);
  }, [metar, variant, temporalProfile, taf]);

  if (loading.any && !metar) {
     return (
      <div className="bg-[#111] h-64 rounded-sm border border-zinc-800 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error.any || !metar) {
    // Fallback or error state
    return (
      <div className="bg-[#111] h-64 rounded-sm border border-zinc-800 flex flex-col items-center justify-center p-6 text-zinc-500">
        <div className="font-mono font-bold text-zinc-300">{icao}</div>
        <div className="text-xs mt-2">Weather unavailable</div>
      </div>
    );
  }

  return (
    <AtmosphereCard
      icao={icao}
      stationName={station?.name || initialStationName}
      flightCategory={metar.flight_category}
      condition={condition}
      tempC={metar.temperature?.celsius}
      windSpeed={metar.wind?.speed_kts}
      windDirection={metar.wind?.degrees?.toString()}
      visibilitySm={metar.visibility?.miles_float}
      qnhInHg={metar.barometer?.hg}
      hour={hour}
      localTime={localTime}
      naturalLanguage={naturalLanguage}
      cloudState={cloudState ?? undefined}
    />
  );
}

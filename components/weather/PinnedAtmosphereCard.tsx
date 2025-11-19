'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCompleteWeather } from '@/lib/tanstack/hooks/useWeather';
import { useAppStore } from '@/lib/store';
import { AtmosphereCard } from '@/components/weather/atmospheric/AtmosphereCard';
import { selectAtmosphereCard } from '@/lib/weather/avionAtmosphereMapping';
import { deriveCloudLayerState } from '@/lib/weather/clouds';
import { useAirportTemporalProfile } from '@/lib/tanstack/hooks/useTemporalProfile';
import { generateWeatherSummary } from '@/lib/weather/natural-language';
import { calculateSolarVisualHour, type WeatherCondition } from '@/components/weather/atmospheric/SkyEngine';

interface PinnedAtmosphereCardProps {
  icao: string;
}

export function PinnedAtmosphereCard({ icao }: PinnedAtmosphereCardProps) {
  const router = useRouter();
  const { unpinAirport } = useAppStore();
  
  const handleUnpin = (icao: string) => {
    unpinAirport(icao);
  };

  const { metar, taf, station, loading, error } = useCompleteWeather({
    icao,
    metarOptions: { staleTime: 10 * 60 * 1000 },
  });

  const { data: temporalProfile } = useAirportTemporalProfile(icao, {
    enabled: Boolean(icao && icao.length === 4),
    staleTime: 5 * 60 * 1000,
  });
  
  // Compute derived values before any early returns
  const isNightFromAuthority = temporalProfile ? !temporalProfile.sun.isDaylight : undefined;
  const atmosphere = metar ? selectAtmosphereCard({ metar, taf, isNightOverride: isNightFromAuthority }) : null;
  const cloudState = metar ? deriveCloudLayerState(metar) : null;

  const variant = useMemo(() => {
    if (!atmosphere) return 'sunny' as const;
    if (!cloudState) return atmosphere.variant;
    
    // Override clear/sunny variants if we have actual clouds
    if (
      (atmosphere.variant === 'sunny' || atmosphere.variant === 'clear-night') &&
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

  const localTime = temporalProfile?.clock.localTime ?? null;
  
  // Parse Hour for SkyEngine (0-24)
  const hour = useMemo(() => {
     if (temporalProfile?.clock.localIso && temporalProfile?.sun) {
         return calculateSolarVisualHour(
             temporalProfile.clock.localIso,
             temporalProfile.sun.sunriseUtc,
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

  // Generate natural language summary
  const naturalLanguage = useMemo(() => {
    if (!metar) return undefined;
    return generateWeatherSummary(metar, variant, temporalProfile, taf);
  }, [metar, variant, temporalProfile, taf]);
  
  const handleCardClick = () => {
    router.push(`/weather?icao=${icao}`);
  };
  
  if (loading.any) {
    return (
      <div className="bg-card border-2 border-border rounded-sm p-4 h-64 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)] dark:border-zinc-700">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error.any || !metar) {
    return (
      <div className="bg-card border-2 border-destructive/40 rounded-sm p-6 h-64 flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)]">
        <div className="font-mono text-lg font-bold text-foreground">{icao}</div>
        <p className="text-sm text-muted-foreground text-center mt-2">Unable to load weather data.</p>
        <button 
          onClick={() => unpinAirport(icao)}
          className="mt-4 text-xs bg-destructive/20 text-destructive-foreground px-3 py-1 rounded-sm hover:bg-destructive/30 transition-colors"
        >
          Unpin
        </button>
      </div>
    );
  }

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <AtmosphereCard
        icao={icao}
        stationName={station?.name}
        flightCategory={metar.flight_category}
        condition={condition}
        tempC={metar.temperature?.celsius}
        windSpeed={metar.wind?.speed_kts}
        windDirection={metar.wind?.degrees?.toString()}
        qnhInHg={metar.barometer?.hg}
        visibilitySm={metar.visibility?.miles_float}
        hour={hour}
        localTime={localTime}
        naturalLanguage={naturalLanguage}
        cloudState={cloudState ?? undefined}
        onUnpin={handleUnpin}
      />
    </div>
  );
}

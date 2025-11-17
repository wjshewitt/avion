'use client';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCompleteWeather } from '@/lib/tanstack/hooks/useWeather';
import { useAppStore } from '@/lib/store';
import { AvionAtmosphereCard } from '@/components/weather/AvionAtmosphereCard';
import { selectAtmosphereCard } from '@/lib/weather/avionAtmosphereMapping';
import { deriveCloudLayerState } from '@/lib/weather/clouds';
import { useAirportTemporalProfile } from '@/lib/tanstack/hooks/useTemporalProfile';

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

  const isNightFromAuthority = temporalProfile ? !temporalProfile.sun.isDaylight : undefined;
  const atmosphere = selectAtmosphereCard({ metar, taf, isNightOverride: isNightFromAuthority });
  const cloudState = deriveCloudLayerState(metar);

  const variant = (() => {
    if (!atmosphere) return 'sunny' as const;
    if (
      atmosphere.variant === 'sunny' &&
      cloudState.category !== 'clear' &&
      cloudState.category !== 'high-thin'
    ) {
      return 'cloudy' as const;
    }
    return atmosphere.variant;
  })();

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <AvionAtmosphereCard
        icao={icao}
        stationName={station?.name}
        flightCategory={metar.flight_category}
        variant={variant}
        tempC={metar.temperature?.celsius}
        isNight={atmosphere?.isNight ?? false}
        visibilitySm={metar.visibility?.miles_float}
        qnhInHg={metar.barometer?.hg}
        cloudState={cloudState}
        onUnpin={handleUnpin}
      />
    </div>
  );
}

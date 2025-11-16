'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

type WeatherType = 'clear' | 'rain' | 'snow' | 'fog';

interface WeatherAtmosphereEngineProps {
  type: WeatherType;
  icao: string;
  metar?: string;
  flightCategory?: 'VFR' | 'IFR' | 'MVFR' | 'LIFR';
}

export function WeatherAtmosphereEngine({
  type,
  icao,
  metar,
  flightCategory = 'VFR',
}: WeatherAtmosphereEngineProps) {
  // Generate random particles (fixed array to prevent hydration issues)
  const rainParticles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        height: 25 + Math.random() * 35,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 0.7 + Math.random() * 0.8,
        delay: Math.random() * 2,
      })),
    []
  );

  const snowParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 3,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        drift: -10 + Math.random() * 20,
      })),
    []
  );

  const getCategoryColor = () => {
    switch (flightCategory) {
      case 'VFR':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'MVFR':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'IFR':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'LIFR':
        return 'text-[#F04E30] bg-[#F04E30]/10 border-[#F04E30]/20';
      default:
        return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getWeatherTitle = () => {
    switch (type) {
      case 'rain':
        return 'Heavy Rain';
      case 'snow':
        return 'Snow';
      case 'fog':
        return 'Fog';
      default:
        return 'Clear';
    }
  };

  return (
    <div className="relative bg-[#f4f4f4] dark:bg-[#2a2a2a] border border-zinc-200 dark:border-zinc-700 p-6 rounded-sm h-96 overflow-hidden group" style={{
      boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
    }}>
      {/* Label & Title */}
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
          Live Weather
        </h3>
        <div className="text-3xl font-light text-zinc-900 dark:text-zinc-50">
          {getWeatherTitle()}
        </div>
      </div>

      {/* Weather Particles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Rain */}
        {type === 'rain' &&
          rainParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute bg-blue-500/60 w-[1px]"
              style={{
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                transform: 'rotate(15deg)',
              }}
              animate={{ y: [0, 400], opacity: [0, 1, 0] }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: particle.delay,
              }}
            />
          ))}

        {/* Snow */}
        {type === 'snow' &&
          snowParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute bg-white rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, 400],
                x: [0, particle.drift],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: particle.delay,
              }}
            />
          ))}

        {/* Fog */}
        {type === 'fog' && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-zinc-400/20 via-zinc-400/10 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-zinc-400/20 via-zinc-400/10 to-transparent"
              animate={{ opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </>
        )}
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="flex justify-between items-end border-b border-zinc-300 dark:border-zinc-700 pb-2 mb-2">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{icao}</span>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 border ${getCategoryColor()}`}
          >
            {flightCategory}
          </span>
        </div>
        {metar && (
          <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
            {metar}
          </div>
        )}
      </div>
    </div>
  );
}

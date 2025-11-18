'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SkyEngine, type WeatherCondition } from './SkyEngine';
import { PrecipitationCanvas } from './PrecipitationCanvas';
import { FogLayer } from './FogLayer';
import { CloudLayer } from './CloudLayer';
import type { CloudLayerState } from "@/lib/weather/clouds";
import type { NaturalLanguageSummary } from "@/lib/weather/natural-language";

export interface AtmosphereCardProps {
  icao: string;
  stationName?: string | null;
  flightCategory?: string | null;
  condition: WeatherCondition;
  tempC?: number | null;
  windSpeed?: number | null;
  windDirection?: string | null;
  qnhInHg?: number | null;
  visibilitySm?: number | null;
  hour: number; // 0-24 (float allowed)
  localTime?: string | null; // formatted string
  naturalLanguage?: NaturalLanguageSummary;
  cloudState?: CloudLayerState;
  onUnpin?: (icao: string) => void;
}

const getFlightCategoryClass = (category?: string | null) => {
  switch (category) {
    case 'VFR': return 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300';
    case 'MVFR': return 'bg-blue-500/20 border border-blue-500/50 text-blue-300';
    case 'IFR': return 'bg-amber-500/20 border border-amber-500/50 text-amber-300';
    case 'LIFR': return 'bg-red-500/20 border border-red-500/50 text-red-300';
    default: return 'bg-white/10 border border-white/20 text-white/70';
  }
};

export function AtmosphereCard({
  icao,
  stationName,
  flightCategory,
  condition,
  tempC,
  windSpeed,
  windDirection,
  qnhInHg,
  visibilitySm,
  hour,
  localTime,
  naturalLanguage,
  cloudState,
  onUnpin,
}: AtmosphereCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 1. Calculate Sky Gradient
  const gradient = useMemo(() => {
    return SkyEngine.getGradient(hour, condition);
  }, [hour, condition]);

  // 2. Calculate Sun/Moon Position
  const celestialPos = useMemo(() => {
    return SkyEngine.getSunPosition(hour);
  }, [hour]);

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnpin) onUnpin(icao);
  };

  return (
    <div
      className="group relative h-64 rounded-sm overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl"
      style={{ background: '#111' }} // Fallback
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- LAYER 0: SKY GRADIENT --- */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-linear"
        style={{ background: gradient }}
      />

      {/* --- LAYER 1: CELESTIAL BODIES --- */}
      <div 
        className="absolute rounded-full blur-2xl z-0 transition-all duration-1000 ease-linear"
        style={{
          top: celestialPos.top,
          left: celestialPos.left,
          width: '140px',
          height: '140px',
          background: celestialPos.color,
          opacity: celestialPos.opacity * 0.8,
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Sun Core (Sharper) */}
      {celestialPos.opacity > 0 && (
         <div 
            className="absolute rounded-full z-0 mix-blend-screen pointer-events-none"
            style={{
              top: celestialPos.top,
              left: celestialPos.left,
              width: '40px',
              height: '40px',
              background: celestialPos.color,
              opacity: celestialPos.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 40px 10px ${celestialPos.color}`
            }}
         />
      )}

      {/* --- LAYER 2: ATMOSPHERIC EFFECTS --- */}
      
      {/* Clouds */}
      {(condition === 'cloudy' || condition === 'rain' || condition === 'storm' || condition === 'snow') && (
         <CloudLayer cloud={cloudState} />
      )}
      
      {/* Rain */}
      {condition === 'rain' && <PrecipitationCanvas type="rain" intensity={1} />}
      
      {/* Storm */}
      {condition === 'storm' && (
        <>
            <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none"></div>
            <PrecipitationCanvas type="storm" intensity={1.5} />
        </>
      )}

      {/* Snow */}
      {condition === 'snow' && <PrecipitationCanvas type="snow" intensity={0.8} />}

      {/* Fog */}
      {condition === 'fog' && <FogLayer />}

      {/* --- LAYER 3: GLASS OVERLAY --- */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, transparent 20%, transparent 100%)'
        }}
      />

      {/* --- LAYER 4: UI CONTENT --- */}
      <div className="relative z-30 h-full flex flex-col justify-between p-5 text-white">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight leading-none drop-shadow-md">
                {icao}
              </span>
              {onUnpin && (
                <button
                  onClick={handleUnpin}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-xs font-medium opacity-80 drop-shadow-sm mt-1 max-w-[180px] truncate">
                {stationName || 'Unknown Station'}
            </div>
             {localTime && (
                <div className="font-mono text-[10px] opacity-60 mt-1 uppercase tracking-wider">
                    {localTime}
                </div>
            )}
          </div>
          
          {flightCategory && (
             <div className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] backdrop-blur-md shadow-sm ${getFlightCategoryClass(flightCategory)}`}>
                {flightCategory}
             </div>
          )}
        </div>

        {/* Natural Language Summary Overlay (Hover) */}
        <AnimatePresence>
            {isHovered && naturalLanguage && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md p-5 flex flex-col justify-center"
            >
                <div className="space-y-2">
                <p className="text-sm font-medium leading-relaxed text-white/90">
                    {naturalLanguage.current}
                </p>
                {naturalLanguage.forecast && (
                    <p className="text-xs leading-relaxed text-white/60">
                    {naturalLanguage.forecast}
                    </p>
                )}
                </div>
            </motion.div>
            )}
        </AnimatePresence>

        {/* Footer / Metrics */}
        <div>
            <div className="flex items-end justify-between">
                 <div>
                     {/* Condition Text */}
                    <div className="text-2xl font-medium tracking-tighter drop-shadow-lg mb-3">
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </div>
                    
                    {/* Mini Data Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-mono opacity-80 drop-shadow-md">
                         <div className="flex gap-2">
                            <span className="opacity-60 uppercase tracking-wider">WIND</span>
                            <span>{windDirection ? `${windDirection}/` : ''}{windSpeed ?? '--'}</span>
                         </div>
                         <div className="flex gap-2">
                            <span className="opacity-60 uppercase tracking-wider">VIS</span>
                            <span>{visibilitySm ?? '--'}SM</span>
                         </div>
                         <div className="flex gap-2">
                            <span className="opacity-60 uppercase tracking-wider">QNH</span>
                            <span>{qnhInHg?.toFixed(2) ?? '----'}</span>
                         </div>
                    </div>
                 </div>

                 <div className="text-5xl font-light tracking-tighter drop-shadow-lg">
                    {tempC != null ? Math.round(tempC) : '--'}°
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}

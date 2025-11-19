"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CloudLayerState, CloudMotion, CloudCoverageCategory } from "@/lib/weather/clouds";
import type { NaturalLanguageSummary } from "@/lib/weather/natural-language";

export type AtmosphereVariant =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "heavy-rain"
  | "thunderstorm"
  | "clear-night"
  | "arctic-snow"
  | "low-vis-fog";

interface WeatherContainerProps {
  icao: string;
  stationName?: string | null;
  flightCategory?: string | null;
  children: React.ReactNode;
  label: string;
  temp: number | null | undefined;
  visibilitySm?: number | null;
  qnhInHg?: number | null;
  localTime?: string | null;
  naturalLanguage?: NaturalLanguageSummary;
  onUnpin?: (icao: string) => void;
}

const getFlightCategoryClass = (category?: string | null) => {
  switch (category) {
    case 'VFR': return 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/30';
    case 'MVFR': return 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600/30';
    case 'IFR': return 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/30';
    case 'LIFR': return 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600/30';
    default: return 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-600';
  }
};

const WeatherContainer = ({
  icao,
  stationName,
  flightCategory,
  children,
  label,
  temp,
  visibilitySm,
  qnhInHg,
  localTime,
  naturalLanguage,
  onUnpin,
}: WeatherContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnpin) {
      onUnpin(icao);
    }
  };
  
  return (
    <div
      className={`
        group relative overflow-hidden rounded-sm p-4 h-64 
        flex flex-col justify-between transition-all duration-300
        bg-card border-2 border-border
        shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]
        dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)]
        dark:border-zinc-700
        hover:border-[--accent-primary]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="font-mono text-xl font-bold text-foreground">{icao}</div>
          <div className="text-xs text-muted-foreground">{stationName}</div>
          {localTime && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1 opacity-80">
              {localTime}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {flightCategory && (
            <div className={`font-mono text-xs px-2 py-0.5 rounded ${getFlightCategoryClass(flightCategory)}`}>
              {flightCategory}
            </div>
          )}
          {onUnpin && (
            <button
              onClick={handleUnpin}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Unpin ${icao}`}
            >
              <X size={16} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {children}
      </div>
      
      {/* Hover overlay with natural language summary */}
      <AnimatePresence>
        {isHovered && naturalLanguage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-0 z-20 bg-black/70 backdrop-blur-lg p-6 flex flex-col justify-center pointer-events-none"
          >
            <div className="space-y-3">
              <p className="text-lg font-medium leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {naturalLanguage.current}
              </p>
              {naturalLanguage.forecast && (
                <p className="text-base leading-relaxed text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {naturalLanguage.forecast}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Text contrast overlay for better readability */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent dark:from-black/60 pointer-events-none" />
      
      <div className="relative z-10 flex items-end justify-between">
        <div>
            <div className="text-2xl font-medium tracking-tight text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{label}</div>
            <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground opacity-70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {visibilitySm != null && (
                    <span>Vis: {visibilitySm >= 10 ? "10SM" : `${visibilitySm.toFixed(1)}SM`}</span>
                )}
                {qnhInHg != null && <span>QNH: {qnhInHg.toFixed(2)}</span>}
            </div>
        </div>
        <div className="font-mono text-5xl font-light text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {temp != null ? `${Math.round(temp)}°` : "—"}
        </div>
      </div>
    </div>
  );
};


const RainEffect = ({ intensity = 20, isStorm = false }: { intensity?: number; isStorm?: boolean }) => (
  <>
    {[...Array(intensity)].map((_, i) => (
      <motion.div
         
        key={i}
        className={`absolute w-[1px] ${isStorm ? "bg-zinc-400" : "bg-blue-400/50"}`}
        style={{
          height: (i % 3) * 10 + 10 + "px",
          left: ((i * 5) % 100) + "%",
          top: -50,
        }}
        animate={{ y: 400, opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.05,
          ease: "linear",
        }}
      />
    ))}
    {isStorm && (
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
        animate={{ opacity: [0, 0, 0.4, 0, 0, 0.2, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
      />
    )}
  </>
);

// Blue sky background for sunny days - covers entire card
const SkyBackground = () => (
  <motion.div
    className="absolute inset-0 rounded-sm overflow-hidden dark:[background:linear-gradient(to_bottom,#334155_0%,#475569_40%,#64748b_70%,#94a3b8_100%)]"
    style={{
      background: 'linear-gradient(to bottom, #87CEEB 0%, #B4E4FF 40%, #E0F6FF 70%, #F0F9FF 100%)',
    }}
    animate={{ opacity: [0.85, 1, 0.85] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
);

const SunEffect = ({ isNight }: { isNight: boolean }) => (
  <div className="absolute top-8 right-8 pointer-events-none">
    {isNight ? (
      <motion.div
        className="w-16 h-16 rounded-full border border-zinc-600 bg-zinc-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
      </motion.div>
    ) : (
      <>
        {/* Stronger orange atmospheric glow behind sun */}
        <motion.div
          className="absolute -inset-10 rounded-full dark:[background:radial-gradient(circle,rgba(251,146,60,0.12)_0%,rgba(249,115,22,0.08)_40%,rgba(252,211,77,0.04)_70%,transparent_100%)]"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.15) 40%, rgba(252, 211, 77, 0.08) 70%, transparent 100%)',
          }}
          animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Sun rays - rotating slower for parallax with stronger orange */}
        <motion.div
          className="absolute inset-0 w-24 h-24"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1.5px] origin-bottom left-1/2 bottom-1/2 dark:[background:linear-gradient(to_top,rgba(249,115,22,0.08)_0%,rgba(251,146,60,0.25)_20%,rgba(251,146,60,0.18)_50%,rgba(252,211,77,0.1)_80%,transparent_100%)]"
              style={{
                height: '85px',
                transform: `rotate(${i * 30}deg) translateX(-50%)`,
                background: 'linear-gradient(to top, rgba(249, 115, 22, 0.15) 0%, rgba(251, 146, 60, 0.5) 20%, rgba(251, 146, 60, 0.35) 50%, rgba(252, 211, 77, 0.2) 80%, transparent 100%)',
              }}
              animate={{ opacity: [0.4, 0.6, 0.4], scaleY: [0.9, 1, 0.9] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: "easeInOut" 
              }}
            />
          ))}
        </motion.div>

        {/* Main sun disc - stronger orange */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 rounded-full border-[1px] border-orange-500/50 dark:border-orange-500/25 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-orange-500/20 dark:bg-orange-500/10 backdrop-blur-sm border border-orange-500/40 dark:border-orange-500/20" />
          <div className="absolute w-full h-[1px] bg-orange-500/35 dark:bg-orange-500/18" />
          <div className="absolute h-full w-[1px] bg-orange-500/35 dark:bg-orange-500/18" />
          
          {/* Stronger pulsing orange core */}
          <motion.div
            className="absolute w-12 h-12 rounded-full bg-orange-500/30 dark:bg-orange-500/15"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.85, 1, 0.85] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Light particles/dust motes drifting upward - more orange */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-[2px] h-[2px] rounded-full bg-orange-400/50 dark:bg-orange-400/25"
            style={{
              left: `${20 + (i * 15)}%`,
              top: '100%',
            }}
            animate={{
              y: [-120, -20],
              x: [0, (i % 2 === 0 ? 10 : -10)],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 4 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}
      </>
    )}
  </div>
);

const SnowEffect = () => (
  <>
    {[...Array(30)].map((_, i) => (
      <motion.div
         
        key={i}
        className="absolute w-1 h-1 rounded-full bg-white/60"
        initial={{ y: -10, x: ((i * 3.3) % 100) + "%" }}
        animate={{
          y: 300,
          x: [((i * 3.3) % 100) + "%", ((i * 3.3) % 100) - 5 + "%"],
        }}
        transition={{ duration: (i % 3) + 2, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </>
);

const FogEffect = () => (
  <>
    {/* Base dense fog layer with vertical gradient (denser at bottom) */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-t from-zinc-500/60 via-zinc-400/35 to-zinc-300/15 dark:from-zinc-700/70 dark:via-zinc-600/45 dark:to-zinc-500/20"
      animate={{ opacity: [0.85, 0.95, 0.85] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Secondary fog layer for depth */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-t from-zinc-400/50 via-zinc-300/30 to-transparent dark:from-zinc-600/60 dark:via-zinc-500/35"
      animate={{ opacity: [0.6, 0.75, 0.6] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    
    {/* Volumetric fog particles for texture - subtle movement */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={`fog-particle-${i}`}
        className="absolute rounded-full blur-[3px] dark:blur-[4px]"
        style={{
          width: `${10 + (i % 5) * 6}px`,
          height: `${10 + (i % 5) * 6}px`,
          left: `${(i * 7) % 100}%`,
          top: `${15 + (i * 6) % 70}%`,
          background: i % 3 === 0 
            ? 'rgba(212, 212, 216, 0.3)' 
            : i % 3 === 1
            ? 'rgba(161, 161, 170, 0.25)'
            : 'rgba(228, 228, 231, 0.2)',
        }}
        animate={{
          x: [0, (i % 2 === 0 ? 8 : -8), 0],
          y: [0, (i % 3 === 0 ? -6 : 6), 0],
          opacity: [0.4, 0.65, 0.4],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7 + (i * 0.3),
          repeat: Infinity,
          delay: i * 0.4,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Subtle diffuse fog overlay - very slow pulsing */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at 30% 40%, rgba(212, 212, 216, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(161, 161, 170, 0.12) 0%, transparent 50%)',
      }}
      animate={{ 
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Dense mist overlay */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-zinc-400/20 via-transparent to-zinc-300/15 dark:from-zinc-600/30 dark:to-zinc-500/20"
      animate={{ 
        opacity: [0.5, 0.65, 0.5],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
  </>
);

interface CloudEffectProps {
  cloud?: CloudLayerState;
}

const CloudEffect = ({ cloud }: CloudEffectProps) => {
  const cloudMotion: CloudMotion = cloud?.motion ?? "calm";
  const category: CloudCoverageCategory = cloud?.category ?? "scattered";
  const baseOpacity = cloud?.opacity ?? 0.18;

  const motionConfig = (() => {
    if (cloudMotion === "windy") {
      return { amplitude: 40, durationBase: 14 };
    }
    if (cloudMotion === "breezy") {
      return { amplitude: 28, durationBase: 18 };
    }
    return { amplitude: 18, durationBase: 24 };
  })();

  const densityMultiplier = (() => {
    switch (category) {
      case "overcast":
        return 1.6;
      case "broken":
        return 1.3;
      case "storm":
        return 1.8;
      case "high-thin":
        return 0.7;
      case "clear":
        return 0.4;
      default:
        return 1;
    }
  })();

  const effectiveOpacity = Math.min(baseOpacity * densityMultiplier, 0.7);

  // Define 4 cloud groups with varied sizes, shapes, and properties
  const clouds = [
    // Large elongated cloud - top area, stretched wide
    { 
      size: 140, 
      top: '10%', 
      left: '5%', 
      duration: 25, 
      delay: 0, 
      opacity: 0.18,
      widthRatio: 1.4,
      puffs: [
        { scale: 0.5, left: '0%', top: '35%', aspectRatio: 1.3, roundness: '60% 40% 45% 55%' }, // Horizontal oval
        { scale: 0.75, left: '25%', top: '10%', aspectRatio: 1.0, roundness: '50%' }, // Circle
        { scale: 0.65, left: '50%', top: '0%', aspectRatio: 0.8, roundness: '45% 55% 50% 50%' }, // Vertical oval
        { scale: 0.7, left: '75%', top: '25%', aspectRatio: 1.4, roundness: '55% 45% 60% 40%' }, // Wide oval
      ]
    },
    // Medium puffy cloud - middle right
    { 
      size: 110, 
      top: '40%', 
      left: '55%', 
      duration: 20, 
      delay: 2, 
      opacity: 0.22,
      widthRatio: 1.2,
      puffs: [
        { scale: 0.6, left: '0%', top: '30%', aspectRatio: 1.2, roundness: '50% 50% 40% 60%' }, // Squashed oval
        { scale: 0.8, left: '30%', top: '0%', aspectRatio: 0.9, roundness: '60% 40% 50% 50%' }, // Slightly tall
        { scale: 0.65, left: '60%', top: '20%', aspectRatio: 1.1, roundness: '45% 55% 55% 45%' }, // Irregular round
      ]
    },
    // Large wispy cloud - bottom left area, very wide
    { 
      size: 130, 
      top: '60%', 
      left: '10%', 
      duration: 22, 
      delay: 4, 
      opacity: 0.2,
      widthRatio: 1.5,
      puffs: [
        { scale: 0.55, left: '0%', top: '25%', aspectRatio: 1.5, roundness: '50% 50% 35% 65%' }, // Very wide
        { scale: 0.7, left: '35%', top: '5%', aspectRatio: 1.2, roundness: '55% 45% 40% 60%' }, // Wide oval
        { scale: 0.6, left: '70%', top: '30%', aspectRatio: 1.3, roundness: '40% 60% 50% 50%' }, // Elongated
      ]
    },
    // Small dense cloud - middle area for depth
    { 
      size: 90, 
      top: '30%', 
      left: '30%', 
      duration: 18, 
      delay: 6, 
      opacity: 0.25,
      widthRatio: 1.0,
      puffs: [
        { scale: 0.65, left: '10%', top: '40%', aspectRatio: 0.85, roundness: '50% 50% 60% 40%' }, // Slightly tall
        { scale: 0.85, left: '35%', top: '0%', aspectRatio: 1.0, roundness: '50%' }, // Perfect circle
        { scale: 0.7, left: '65%', top: '25%', aspectRatio: 1.25, roundness: '60% 40% 40% 60%' }, // Horizontal oval
      ]
    },
  ];

  return (
    <>
      {clouds.map((cloud, idx) => (
        <motion.div
          key={idx}
          className="absolute pointer-events-none"
          style={{
            top: cloud.top,
            left: cloud.left,
          }}
          animate={{
            x: [0, motionConfig.amplitude, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: cloud.duration + motionConfig.durationBase,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        >
          {/* Cloud made of varied overlapping shapes (ovals, ellipses, circles) for organic appearance */}
          <div className="relative" style={{ width: cloud.size * cloud.widthRatio, height: cloud.size * 0.5 }}>
            {cloud.puffs.map((puff, puffIdx) => (
              <div 
                key={puffIdx}
                className="absolute bg-gradient-to-br from-zinc-300/45 to-zinc-400/35 dark:from-zinc-500/55 dark:to-zinc-400/45 backdrop-blur-[3px]"
                style={{
                  width: cloud.size * puff.scale * puff.aspectRatio,
                  height: cloud.size * puff.scale,
                  left: puff.left,
                  top: puff.top,
                  opacity: effectiveOpacity,
                  borderRadius: puff.roundness,
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </>
  );
};

export interface AvionAtmosphereCardProps {
  icao: string;
  stationName?: string | null;
  flightCategory?: string | null;
  variant: AtmosphereVariant;
  tempC?: number | null;
  isNight: boolean;
  visibilitySm?: number | null;
  qnhInHg?: number | null;
  localTime?: string | null;
  naturalLanguage?: NaturalLanguageSummary;
  onUnpin?: (icao: string) => void;
  cloudState?: CloudLayerState;
}

export function AvionAtmosphereCard({
  icao,
  stationName,
  flightCategory,
  variant,
  tempC,
  isNight,
  visibilitySm,
  qnhInHg,
  localTime,
  naturalLanguage,
  onUnpin,
  cloudState,
}: AvionAtmosphereCardProps) {
  const commonProps = {
    icao,
    stationName,
    flightCategory,
    temp: tempC ?? null,
    visibilitySm,
    qnhInHg,
    localTime,
    naturalLanguage,
    onUnpin,
  };

  switch (variant) {
    case "heavy-rain":
      return (
        <WeatherContainer label="Heavy Rain" {...commonProps}>
          <RainEffect intensity={40} />
        </WeatherContainer>
      );
    case "thunderstorm":
      return (
        <WeatherContainer label="Thunderstorm" {...commonProps}>
          <RainEffect intensity={50} isStorm />
        </WeatherContainer>
      );
    case "clear-night":
      return (
        <WeatherContainer label="Clear Night" {...commonProps}>
          <SunEffect isNight />
          <div className="absolute w-1 h-1 bg-white rounded-full top-12 left-12 opacity-60 animate-pulse" />
          <div className="absolute w-1 h-1 bg-white rounded-full bottom-12 right-24 opacity-40" />
        </WeatherContainer>
      );
    case "arctic-snow":
      return (
        <WeatherContainer label="Arctic / Snow" {...commonProps}>
          <SnowEffect />
        </WeatherContainer>
      );
    case "low-vis-fog":
      return (
        <WeatherContainer label="Low Vis / Fog" {...commonProps}>
          <FogEffect />
        </WeatherContainer>
      );
    case "partly-cloudy":
      return (
        <WeatherContainer label="Partly Cloudy" {...commonProps}>
          <CloudEffect cloud={cloudState} />
        </WeatherContainer>
      );
    case "cloudy":
        return (
          <WeatherContainer label="Cloudy" {...commonProps}>
            <CloudEffect cloud={cloudState} />
          </WeatherContainer>
        );
    case "sunny":
    default:
      return (
        <WeatherContainer label="Sunny" {...commonProps}>
          <SkyBackground />
          <SunEffect isNight={false} />
        </WeatherContainer>
      );
  }
}

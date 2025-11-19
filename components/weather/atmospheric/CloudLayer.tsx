'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CloudLayerState, CloudMotion, CloudCoverageCategory } from "@/lib/weather/clouds";

interface CloudEffectProps {
  cloud?: CloudLayerState;
}

interface CloudProps {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  seed: number;
  duration: number;
  delay: number;
  amplitude: number;
  type: 'cumulus' | 'cirrus' | 'storm';
}

const SVGCloud = ({ x, y, scale, opacity, seed, duration, delay, amplitude, type }: CloudProps) => {
  // Filter parameters based on cloud type
  const filterId = `cloud-filter-${seed}-${type}`;
  
  let baseFreq = "0.012";
  let octaves = "4";
  let displacementScale = "180";
  
  if (type === 'cirrus') {
    baseFreq = "0.025";
    octaves = "3"; 
    displacementScale = "120";
  } else if (type === 'storm') {
    baseFreq = "0.008";
    octaves = "5";
    displacementScale = "220";
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        width: '400px',
        height: '200px',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: opacity,
        filter: `url(#${filterId})`
      }}
      animate={{
        x: [0, amplitude, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={filterId}>
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency={baseFreq} 
            numOctaves={octaves} 
            seed={seed} 
            result="noise" 
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={displacementScale} 
          />
          <feGaussianBlur stdDeviation="6" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>
      
      {/* Base shape that gets distorted by the filter */}
      <div 
        className={`w-full h-full rounded-[50%] blur-xl ${
            type === 'storm' 
            ? 'bg-slate-800 dark:bg-slate-900' 
            : 'bg-white'
        }`}
        style={{
            background: type === 'storm' 
                ? 'radial-gradient(circle at 30% 30%, #475569 0%, #1e293b 100%)'
                : 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f1f5f9 100%)'
        }}
      />
    </motion.div>
  );
};

export const CloudLayer = ({ cloud }: CloudEffectProps) => {
  const cloudMotion: CloudMotion = cloud?.motion ?? "calm";
  const category: CloudCoverageCategory = cloud?.category ?? "scattered";
  
  // Determine cloud count based on METAR category
  const config = useMemo(() => {
    switch (category) {
      case 'clear': return { count: 0, type: 'cumulus' as const, baseOpacity: 0 };
      case 'few': return { count: 2, type: 'cumulus' as const, baseOpacity: 0.25 };
      case 'high-thin': return { count: 6, type: 'cirrus' as const, baseOpacity: 0.25 };
      case 'scattered': return { count: 4, type: 'cumulus' as const, baseOpacity: 0.3 };
      case 'broken': return { count: 8, type: 'cumulus' as const, baseOpacity: 0.4 };
      case 'overcast': return { count: 12, type: 'cumulus' as const, baseOpacity: 0.45 };
      case 'storm': return { count: 15, type: 'storm' as const, baseOpacity: 0.6 };
      default: return { count: 3, type: 'cumulus' as const, baseOpacity: 0.3 }; // Fallback for few/etc
    }
  }, [category]);

  const motionParams = useMemo(() => {
    if (cloudMotion === "windy") return { amplitude: 50, durationBase: 15 };
    if (cloudMotion === "breezy") return { amplitude: 30, durationBase: 25 };
    return { amplitude: 15, durationBase: 40 };
  }, [cloudMotion]);

  // Generate consistent random clouds based on category to prevent hydration mismatch or jitter
  // In a real app with SSR, we'd use a seedable random or useEffect to set these
  // For now using useMemo with category as dependency to act as "seed"
  const clouds = useMemo(() => {
    return Array.from({ length: config.count }).map((_, i) => {
      // Pseudo-random based on index
      const r1 = (i * 1337 + 42) % 100 / 100;
      const r2 = (i * 91 + 12) % 100 / 100;
      const r3 = (i * 55 + 7) % 100 / 100;
      
      return {
        id: i,
        x: 10 + (r1 * 80), // 10% to 90% width
        y: 5 + (r2 * 60),  // 5% to 65% height (keep them mostly in upper sky)
        scale: 0.6 + (r3 * 0.8), // 0.6 to 1.4 scale
        opacity: config.baseOpacity * (0.7 + r1 * 0.6), // Vary opacity slightly
        seed: i * 100, // Filter seed
        delay: r2 * 5,
        duration: motionParams.durationBase + (r3 * 10),
      };
    });
  }, [config, motionParams]);

  if (config.count === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
       {clouds.map(c => (
         <SVGCloud
            key={`${category}-${c.id}`}
            type={config.type}
            x={c.x}
            y={c.y}
            scale={c.scale}
            opacity={c.opacity}
            seed={c.seed}
            duration={c.duration}
            delay={c.delay}
            amplitude={motionParams.amplitude}
         />
       ))}
    </div>
  );
};

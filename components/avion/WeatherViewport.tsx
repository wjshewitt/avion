"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudRain, CloudSnow, Wind, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherViewportProps {
  icao: string;
  condition: 'clear' | 'rain' | 'heavy-rain' | 'snow' | 'fog' | 'clouds';
  temperature: string;
  wind: string;
  visibility?: string;
  className?: string;
}

const WeatherParticles = ({ condition }: { condition: string }) => {
  if (condition === 'rain' || condition === 'heavy-rain') {
    const count = condition === 'heavy-rain' ? 80 : 40;
    return (
      <>
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-400 rounded-full"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 15 + 10,
              left: `${Math.random() * 100}%`,
              top: -20,
              opacity: Math.random() * 0.3 + 0.2
            }}
            animate={{
              y: [0, 300],
              x: [0, Math.random() * 20 - 10]
            }}
            transition={{
              duration: Math.random() * 1 + 0.5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
        {condition === 'heavy-rain' && (
          <motion.div
            className="absolute inset-0 bg-white opacity-10"
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        )}
      </>
    );
  }

  if (condition === 'snow') {
    return (
      <>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: -20,
            }}
            animate={{
              y: [0, 300],
              x: [0, Math.random() * 60 - 30],
              rotate: [0, 360]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </>
    );
  }

  if (condition === 'fog') {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
            style={{
              left: `${i * 33 - 33}%`
            }}
            animate={{
              x: [0, 50],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </>
    );
  }

  if (condition === 'clouds') {
    return (
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${i * 25}%`,
              top: `${Math.random() * 50}%`,
            }}
            animate={{
              x: [0, 30],
              y: [0, -10],
            }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            <Cloud className="w-16 h-16 text-gray-300/20" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (condition === 'clear') {
    return (
      <div className="absolute top-4 right-4">
        <motion.div
          className="w-12 h-12 bg-yellow-400 rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-sm" />
        </motion.div>
      </div>
    );
  }

  return null;
};

export default function WeatherViewport({
  icao,
  condition,
  temperature,
  wind,
  visibility,
  className
}: WeatherViewportProps) {
  const getConditionText = () => {
    switch (condition) {
      case 'clear': return 'Clear Sky';
      case 'rain': return 'Light Rain';
      case 'heavy-rain': return 'Heavy Rain';
      case 'snow': return 'Snow';
      case 'fog': return 'Fog';
      case 'clouds': return 'Cloudy';
      default: return 'Unknown';
    }
  };

  const getConditionIcon = () => {
    switch (condition) {
      case 'rain':
      case 'heavy-rain':
        return <CloudRain className="w-4 h-4" />;
      case 'snow':
        return <CloudSnow className="w-4 h-4" />;
      case 'fog':
      case 'clouds':
        return <Cloud className="w-4 h-4" />;
      default:
        return <Wind className="w-4 h-4" />;
    }
  };

  const getIFRStatus = () => {
    if (condition === 'fog' || condition === 'heavy-rain' || (visibility && parseInt(visibility) < 1000)) {
      return { status: 'IFR', color: 'text-blue-500' };
    }
    if (condition === 'rain' || condition === 'snow' || (visibility && parseInt(visibility) < 5000)) {
      return { status: 'MVFR', color: 'text-amber-500' };
    }
    return { status: 'VFR', color: 'text-emerald-500' };
  };

  const ifr = getIFRStatus();

  return (
    <div className={cn("relative h-48 bg-[#1A1A1A] rounded-sm overflow-hidden border border-[#333]", className)}>
      {/* Weather effects layer */}
      <div className="absolute inset-0 overflow-hidden">
        <WeatherParticles condition={condition} />
      </div>

      {/* Gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-between">
        {/* Top info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-mono font-bold text-white">{icao}</h3>
            <div className="flex items-center space-x-2">
              {getConditionIcon()}
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-widest">
                {getConditionText()}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Temperature */}
        <div className="text-center py-4">
          <motion.div
            key={temperature}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-mono text-white tabular-nums"
          >
            {temperature}
          </motion.div>
        </div>

        {/* Bottom info bar */}
        <div className="bg-[#2A2A2A] rounded-sm px-3 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3 text-[#71717A]" />
              <span className="text-xs font-mono text-white">{wind}</span>
            </div>
            {visibility && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3 text-[#71717A]" />
                <span className="text-xs font-mono text-white">{visibility}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
              FLIGHT RULES
            </span>
            <span className={cn("text-sm font-mono font-bold uppercase", ifr.color)}>
              {ifr.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
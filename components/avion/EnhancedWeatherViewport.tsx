"use client";

import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Eye,
  Thermometer,
  Gauge,
  Sunrise,
  Sunset,
  Droplets,
  Navigation,
  AlertTriangle,
  Waves,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedWeatherViewportProps {
  icao: string;
  condition: 'clear' | 'rain' | 'heavy-rain' | 'snow' | 'fog' | 'clouds' | 'thunderstorm' | 'turbulence';
  temperature: string;
  wind: string;
  visibility?: string;
  humidity?: number;
  pressure?: number;
  dewpoint?: string;
  ceiling?: string;
  runway?: string[];
  className?: string;
}

const WeatherParticleSystem = ({ condition, isNight }: { condition: string; isNight: boolean }) => {
  const particleCount = {
    'rain': 60,
    'heavy-rain': 120,
    'snow': 40,
    'thunderstorm': 150,
    'fog': 20
  }[condition] || 0;

  if (condition === 'rain' || condition === 'heavy-rain' || condition === 'thunderstorm') {
    return (
      <>
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-b from-blue-400/50 to-blue-600/30 rounded-full"
            style={{
              width: condition === 'heavy-rain' ? Math.random() * 2 + 1 : Math.random() * 1.5 + 0.5,
              height: condition === 'heavy-rain' ? Math.random() * 20 + 15 : Math.random() * 15 + 10,
              left: `${Math.random() * 100}%`,
              top: -30,
              filter: 'blur(0.5px)'
            }}
            animate={{
              y: [0, window.innerHeight + 100],
              x: [0, condition === 'thunderstorm' ? Math.random() * 40 - 20 : Math.random() * 10 - 5],
              opacity: [0, Math.random() * 0.6 + 0.2, Math.random() * 0.6 + 0.2, 0]
            }}
            transition={{
              duration: condition === 'heavy-rain' ? Math.random() * 0.5 + 0.5 : Math.random() * 1 + 0.8,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
        {condition === 'heavy-rain' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        {condition === 'thunderstorm' && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 5 + 3 }}
          />
        )}
      </>
    );
  }

  if (condition === 'snow') {
    return (
      <>
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full shadow-sm"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: -20,
              filter: 'blur(0.3px)'
            }}
            animate={{
              y: [0, 400],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, Math.random() * 360 - 180],
              opacity: [0, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
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
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${Math.random() * 60 + 60}deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
            }}
            animate={{
              x: [-200, 200],
              opacity: [0, 0.3, 0]
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
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${i * 20}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              x: [0, 30],
              y: [0, -15],
              scale: [1, Math.random() * 0.2 + 1]
            }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            <Cloud
              className={cn(
                "w-24 h-24",
                isNight ? "text-gray-400/20" : "text-gray-300/30"
              )}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (condition === 'clear') {
    return (
      <div className="absolute top-8 right-8">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          {isNight ? (
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-2xl">
              <div className="absolute inset-2 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full opacity-50" />
              <div className="absolute bottom-2 left-2 w-4 h-4 bg-gray-400/30 rounded-full" />
              <div className="absolute top-3 right-3 w-3 h-3 bg-gray-400/20 rounded-full" />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full blur-sm" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-xl" />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
};

export default function EnhancedWeatherViewport({
  icao,
  condition,
  temperature,
  wind,
  visibility,
  humidity,
  pressure,
  dewpoint,
  ceiling,
  runway,
  className
}: EnhancedWeatherViewportProps) {
  const [isNight, setIsNight] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const controls = useAnimation();
  const scrollY = useMotionValue(0);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.7]);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour > 18);
    controls.start("visible");
  }, [controls]);

  const getConditionText = () => {
    const conditions = {
      'clear': 'Clear Sky',
      'rain': 'Light Rain',
      'heavy-rain': 'Heavy Rain',
      'snow': 'Snow Showers',
      'fog': 'Dense Fog',
      'clouds': 'Partly Cloudy',
      'thunderstorm': 'Thunderstorm',
      'turbulence': 'Turbulence'
    };
    return conditions[condition] || 'Unknown';
  };

  const getIFRStatus = () => {
    if (condition === 'fog' || condition === 'heavy-rain' || (visibility && parseInt(visibility) < 1000)) {
      return { status: 'IFR', color: 'text-red-500', bg: 'bg-red-500/10' };
    }
    if (condition === 'rain' || condition === 'snow' || condition === 'thunderstorm' || (visibility && parseInt(visibility) < 5000)) {
      return { status: 'MVFR', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }
    if (condition === 'clouds') {
      return { status: 'VFR', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
    return { status: 'VFR', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const getConditionIcon = () => {
    const icons = {
      'thunderstorm': Zap,
      'rain': CloudRain,
      'heavy-rain': CloudRain,
      'snow': CloudSnow,
      'fog': Cloud,
      'clouds': Cloud,
      'turbulence': Wind,
      'clear': isNight ? Moon : Sun
    };
    const Icon = icons[condition as keyof typeof icons] || Cloud;
    return Icon;
  };

  const Icon = getConditionIcon();
  const ifr = getIFRStatus();

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative h-80 rounded-2xl overflow-hidden border transition-all duration-500",
        isNight ? "bg-gradient-to-b from-slate-900 to-slate-800" : "bg-gradient-to-b from-sky-400 to-sky-600",
        condition === 'thunderstorm' && "bg-gradient-to-b from-gray-800 to-gray-900",
        className
      )}
      whileHover={{ scale: 1.02 }}
      onScroll={(e) => scrollY.set(e.currentTarget.scrollTop)}
    >
      {/* Weather Effects Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <WeatherParticleSystem condition={condition} isNight={isNight} />
      </div>

      {/* Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="weatherGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#weatherGrid)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <motion.div
          className="p-6"
          style={{ opacity: headerOpacity }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-3xl font-mono font-bold text-white mb-1 drop-shadow-lg">
                {icao}
              </h3>
              <p className="text-xs font-mono uppercase tracking-widest text-white/70 drop-shadow">
                {getConditionText()}
              </p>
            </div>
            <div className="text-right">
              <motion.div
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full border font-mono text-sm font-bold",
                  ifr.bg,
                  ifr.color,
                  "border-current/30"
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {ifr.status}
              </motion.div>
              <div className="flex items-center space-x-2 mt-2 text-white/70">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Temperature Display */}
          <motion.div
            className="text-center py-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              key={temperature}
              className="text-6xl font-mono font-bold text-white tabular-nums drop-shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {temperature}
            </motion.div>
            <div className="flex items-center justify-center space-x-3 mt-2">
              <div className="flex items-center space-x-1">
                <Thermometer className="w-3 h-3 text-white/70" />
                <span className="text-xs font-mono text-white/70">
                  Feels like {parseInt(temperature) - 3}°C
                </span>
              </div>
              {humidity && (
                <div className="flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-white/70" />
                  <span className="text-xs font-mono text-white/70">
                    {humidity}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Info Bar */}
        <div className="mt-auto p-6">
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-white/70" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                    Wind
                  </p>
                  <p className="text-sm font-mono text-white">
                    {wind}
                  </p>
                </div>
              </div>
              {visibility && (
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                      Visibility
                    </p>
                    <p className="text-sm font-mono text-white">
                      {visibility}
                    </p>
                  </div>
                </div>
              )}
              {pressure && (
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                      Pressure
                    </p>
                    <p className="text-sm font-mono text-white">
                      {pressure} hPa
                    </p>
                  </div>
                </div>
              )}
              {ceiling && (
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                      Ceiling
                    </p>
                    <p className="text-sm font-mono text-white">
                      {ceiling}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {runway && runway.length > 0 && (
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                    Runway Conditions
                  </p>
                  <Navigation className="w-3 h-3 text-white/70" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {runway.map((rwy, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 rounded-lg px-2 py-1.5 text-center border border-white/10"
                    >
                      <p className="text-xs font-mono text-white/70">RWY {rwy}</p>
                      <p className="text-xs font-mono text-emerald-400">DRY</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Expand Toggle */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 flex items-center justify-center space-x-2 text-white/50 hover:text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs font-mono uppercase tracking-wider">
              {expanded ? 'Show Less' : 'Show Details'}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
            >
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Alert Overlay for Severe Weather */}
      {(condition === 'thunderstorm' || condition === 'heavy-rain') && (
        <motion.div
          className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-2 bg-red-500/90 backdrop-blur-sm rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span className="text-xs font-mono text-white uppercase tracking-wider">
            Severe Weather
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Add missing icons
const Moon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Sun = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
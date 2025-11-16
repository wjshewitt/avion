'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface LiveFleetMonitorProps {
  flight: {
    code: string;
    origin: string;
    destination: string;
    etaMinutes: number;
    altitude: number;
    speed: number;
    fuel: number;
  };
}

export function LiveFleetMonitor({ flight }: LiveFleetMonitorProps) {
  const [altitude, setAltitude] = useState(flight.altitude);
  const [speed, setSpeed] = useState(flight.speed);
  const [fuel, setFuel] = useState(flight.fuel);
  const [etaMinutes, setEtaMinutes] = useState(flight.etaMinutes);
  const [autoPilot, setAutoPilot] = useState(true);

  // Animate values with springs
  const animatedAlt = useSpring(altitude, { stiffness: 100, damping: 30 });
  const animatedSpeed = useSpring(speed, { stiffness: 100, damping: 30 });
  const animatedFuel = useSpring(fuel, { stiffness: 50, damping: 30 });
  const animatedEta = useSpring(etaMinutes, { stiffness: 50, damping: 30 });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude((a) => a + (Math.random() > 0.5 ? 10 : -10));
      setSpeed((s) => +(s + (Math.random() - 0.5) * 0.001).toFixed(3));
      setFuel((f) => Math.max(f - 0.005, 0));
      setEtaMinutes((m) => Math.max(m - 0.016667, 0)); // ~1 minute per minute
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const m = Math.floor(totalMinutes % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}`;
  };

  const progress = Math.max(0, Math.min(100, ((flight.etaMinutes - etaMinutes) / flight.etaMinutes) * 100));

  return (
    <div
      className="relative bg-[#2a2a2a] border border-zinc-700 p-8 md:p-12 rounded-sm overflow-hidden"
      style={{
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)',
      }}
    >
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-700 pb-4 mb-8 relative z-10">
        <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-zinc-400">
          <span className="text-zinc-50 font-bold">{flight.code}</span>
          <span>G650ER</span>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-blue-400"
          >
            LIVE LINK ACTIVE
          </motion.span>
        </div>
        <div className="text-xs font-mono text-zinc-400">
          ALT:{' '}
          <motion.span className="text-zinc-50 tabular-nums">
            {animatedAlt.get().toLocaleString('en-US', { maximumFractionDigits: 0 })} FT
          </motion.span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
        {/* Left: ETA Countdown */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
          <div className="text-[10px] font-mono text-zinc-400 mb-2 uppercase tracking-widest">
            Time to Destination
          </div>
          <motion.div className="text-6xl md:text-7xl font-light text-zinc-50 tracking-tighter mb-4 tabular-nums font-mono">
            {formatTime(animatedEta.get())}
          </motion.div>

          {/* Progress Rail */}
          <div className="mt-8 md:mt-12 h-[1px] bg-zinc-700 w-full relative flex items-center">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#F04E30]"
              style={{ width: `${progress}%` }}
            />
            <motion.div
              className="absolute w-4 h-4 bg-[#F04E30] rounded-full border-2 border-white/80 shadow-lg"
              style={{ left: `${progress}%`, marginLeft: '-8px' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute left-[20%] w-2 h-2 bg-zinc-600 rounded-full" />
            <div className="absolute left-[50%] w-2 h-2 bg-zinc-600 rounded-full" />
          </div>

          {/* Route Labels */}
          <div className="flex justify-between mt-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            <span>{flight.origin}</span>
            <motion.span className="text-zinc-50 tabular-nums">
              Mach {animatedSpeed.get().toFixed(2)}
            </motion.span>
            <span>{flight.destination}</span>
          </div>
        </div>

        {/* Right: System Status */}
        <div className="border-l border-zinc-700 pl-6 md:pl-8 flex flex-col justify-between py-4">
          {/* Health Bars */}
          <div>
            <div className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wide">
              System Health
            </div>
            <div className="space-y-3">
              {[98, 100, 94].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="h-full bg-zinc-50"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fuel Gauge */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-zinc-400">Fuel Rem.</span>
              <motion.span className="text-xl font-light text-zinc-50 tabular-nums font-mono">
                {animatedFuel.get().toFixed(1)}
              </motion.span>
            </div>
            <div className="w-full h-1 bg-zinc-800">
              <motion.div
                className="h-full bg-[#F04E30]"
                style={{ width: `${animatedFuel.get()}%` }}
              />
            </div>
          </div>

          {/* Autopilot Toggle */}
          <div className="pt-6 border-t border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wide text-zinc-400">AI Autopilot</span>
              <button
                onClick={() => setAutoPilot(!autoPilot)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                  autoPilot ? 'bg-white border-[#F04E30]' : 'bg-zinc-700 border-zinc-600'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                  className="h-4 w-4 rounded-full bg-zinc-900 shadow-md"
                  style={{ marginLeft: autoPilot ? '22px' : '2px' }}
                />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: autoPilot ? 1 : 0,
                height: autoPilot ? 'auto' : 0,
              }}
              className="text-[10px] text-emerald-500 font-medium overflow-hidden"
            >
              Optimizing for turbulence (-4m)
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

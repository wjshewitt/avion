"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useAirportSearch } from "@/lib/tanstack/hooks/useAirports";
import Link from "next/link";
import { ThemeToggleCompact } from "@/components/theme-toggle";

// Icon component wrapper for Lucide icons
const Icon = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} strokeWidth={1.5} />;
};

const ToggleSwitch = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <motion.div
    onClick={onClick}
    className={`w-12 h-6 rounded-full p-1 cursor-pointer flex items-center ${active ? "bg-zinc-800" : "bg-zinc-300"}`}
    whileTap={{ scale: 0.95 }}
    layout
  >
    <motion.div
      className="w-4 h-4 rounded-full bg-white shadow-md"
      layout
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      style={{ marginLeft: active ? "24px" : "0px" }}
    />
  </motion.div>
);

const LiveFleetCockpit = () => {
  const flights = useMemo(
    () => [
      { id: "AVN881", origin: "London (LHR)", destination: "Teterboro (TEB)", initialEtaMinutes: 255, baseMach: 0.85 },
      { id: "AVN204", origin: "Nice (LFMN)", destination: "Farnborough (EGLF)", initialEtaMinutes: 95, baseMach: 0.79 },
      { id: "AVN511", origin: "Teterboro (TEB)", destination: "Van Nuys (KVNY)", initialEtaMinutes: 310, baseMach: 0.82 },
    ],
    []
  );

  const [activeFlightIndex, setActiveFlightIndex] = useState(0);
  const activeFlight = flights[activeFlightIndex];

  const [altitude, setAltitude] = useState(41000);
  const [speed, setSpeed] = useState(activeFlight.baseMach);
  const [fuel, setFuel] = useState(98.2);
  const [etaMinutes, setEtaMinutes] = useState(activeFlight.initialEtaMinutes);
  const [autoPilot, setAutoPilot] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAltitude((a) => a + (Math.random() > 0.5 ? 10 : -10));
      setSpeed((s) => +(s + (Math.random() - 0.5) * 0.001).toFixed(3));
      setFuel((f) => +(Math.max(f - 0.005, 0)).toFixed(2));
      setEtaMinutes((m) => Math.max(m - 0.01, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const flightCycle = setInterval(() => {
      setActiveFlightIndex((prev) => (prev + 1) % flights.length);
    }, 15000);
    return () => clearInterval(flightCycle);
  }, [flights.length]);

  useEffect(() => {
    setSpeed(activeFlight.baseMach);
    setEtaMinutes(activeFlight.initialEtaMinutes);
    setFuel(98.2);
  }, [activeFlight]);

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor(totalMinutes % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[#e8e8e8] dark:bg-zinc-900 rounded-xl shadow-2xl p-8 md:p-12 border border-blue-500/60 dark:border-blue-400/70 mx-auto max-w-5xl"
    >
      <div className="absolute top-6 right-6 flex gap-2">
        <div className={`w-2 h-2 rounded-full ${autoPilot ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" : "bg-zinc-500"}`}></div>
      </div>

      <div className="bg-[#f4f4f4] dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/60 rounded-sm p-6 h-[480px] relative groove flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-[800px] h-[800px] radar-sweep absolute -top-[160px] -left-[100px]"></div>
        </div>

        <div className="flex justify-between items-center border-b border-zinc-300 pb-4 mb-8 relative z-10">
          <div className="flex gap-6 font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <span className="text-zinc-900 dark:text-zinc-50 font-bold">{activeFlight.id}</span>
            <span>G650ER</span>
            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-blue-400">
              LIVE LINK ACTIVE
            </motion.span>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            ALT: <span className="text-zinc-900 dark:text-zinc-50">{altitude.toLocaleString()} FT</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="col-span-2 flex flex-col justify-center">
            <div className="text-xs font-mono text-zinc-400 mb-2 uppercase tracking-widest">Time to Destination</div>
            <div className="text-7xl font-light text-zinc-800 dark:text-zinc-50 tracking-tighter mb-4 tabular-nums">{formatTime(etaMinutes)}</div>

            <div className="mt-12 h-[1px] bg-zinc-200 dark:bg-zinc-800 w-full relative flex items-center">
              <div className="absolute left-0 top-0 h-full bg-blue-500 w-[72%]"></div>
              <motion.div
                className="absolute left-[72%] w-4 h-4 bg-blue-500 rounded-full border-2 border-white/80 shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute left-[20%] w-2 h-2 bg-zinc-300 rounded-full"></div>
              <div className="absolute left-[50%] w-2 h-2 bg-zinc-300 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
              <span>{activeFlight.origin}</span>
              <span>Mach {speed.toFixed(2)}</span>
              <span>{activeFlight.destination}</span>
            </div>
          </div>

          <div className="border-l border-zinc-200 dark:border-zinc-700 pl-8 flex flex-col justify-between py-4">
            <div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">System Health</div>
              <div className="space-y-3">
                {[98, 100, 94].map((val, i) => (
                  <div key={val + i} className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="h-full bg-zinc-800"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Fuel Rem.</span>
                <span className="text-xl font-light text-zinc-800 dark:text-zinc-50 tabular-nums">{fuel.toFixed(1)}</span>
              </div>
              <div className="w-full h-1 bg-zinc-200">
                <motion.div className="h-full bg-blue-500" style={{ width: `${fuel}%` }} />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">AI Autopilot</span>
                <ToggleSwitch active={autoPilot} onClick={() => setAutoPilot((prev) => !prev)} />
              </div>
              <AnimatePresence>
                {autoPilot && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-[10px] text-emerald-600 font-medium">
                    Optimizing for turbulence (-4m)
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none rounded-xl"></div>
    </motion.div>
  );
};

const LiveFleetView = () => (
  <section className="py-20 md:py-28 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden />
    <div className="relative max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em] mb-3">Live Fleet View</p>
        <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">Monitor every leg in real time.</h2>
      </div>
      <LiveFleetCockpit />
    </div>
  </section>
);

// Bracket SVG component
const Bracket = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path d="M1 19V1H19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Corner Brackets component
const CornerBrackets = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => (
  <div className="relative p-6 md:p-10 h-full w-full">
    <motion.div
      className="absolute top-0 left-0 text-zinc-900 dark:text-zinc-200"
      animate={{
        x: active ? 0 : 10,
        y: active ? 0 : 10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute top-0 right-0 rotate-90 text-zinc-900 dark:text-zinc-200"
      animate={{
        x: active ? 0 : -10,
        y: active ? 0 : 10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute bottom-0 right-0 rotate-180 text-zinc-900 dark:text-zinc-200"
      animate={{
        x: active ? 0 : -10,
        y: active ? 0 : -10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute bottom-0 left-0 -rotate-90 text-zinc-900 dark:text-zinc-200"
      animate={{
        x: active ? 0 : 10,
        y: active ? 0 : -10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    {children}
  </div>
);

// Header component
const Header = () => {
  const { scrollY } = useScroll();
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const width = useTransform(scrollY, [0, 200], ["100%", "90%"]);
  const radius = useTransform(scrollY, [0, 200], ["0px", "16px"]);
  const y = useTransform(scrollY, [0, 200], [0, 20]);
  const brandOpacity = useTransform(scrollY, [0, 120, 220], [0, 0, 1]);
  const infoOpacity = useTransform(scrollY, [0, 120, 220], [1, 1, 0]);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <motion.div
        style={{ width, borderRadius: radius, y }}
        className="relative bg-zinc-900/90 backdrop-blur-md text-zinc-100 h-16 flex items-center justify-between px-6 md:px-12 shadow-2xl pointer-events-auto border border-zinc-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-blue-600 rounded-sm animate-pulse"></div>
        </div>

        {/* Centered brand label that fades in once the hero scrolls away */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            className="font-bold tracking-tighter text-xl pointer-events-none"
            style={{ opacity: brandOpacity }}
          >
            AVION
          </motion.span>
        </div>

        <motion.div
          className="hidden md:flex gap-12 font-mono text-xs text-zinc-400"
          style={{ opacity: infoOpacity }}
        >
          <div className="flex gap-2">
            <span>UTC</span>
            <span className="text-white">
              {mounted && time ? time.toISOString().slice(11, 19) : "--:--:--"}
            </span>
          </div>
          <div className="flex gap-2">
            <span>FLIGHT RULES</span>
            <span className="text-blue-400">IFR / VFR</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <ThemeToggleCompact />
          <Link href="/login">
            <button className="bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2 text-xs uppercase tracking-widest transition-colors border border-zinc-700">
              Sign In
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 text-xs uppercase tracking-widest transition-colors border border-zinc-700">
              Sign Up
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// Hero section
const Hero = () => {
  return (
    <section className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-50"></div>

      <CornerBrackets active={true}>
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[12vw] md:text-[150px] font-medium tracking-tighter leading-none text-zinc-900 dark:text-zinc-50">
              AVION
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col items-center mt-8"
          >
            <div className="h-[1px] w-32 bg-blue-600 mb-6"></div>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-md font-light">
              AI-powered flight operations with real-time weather intelligence
              and comprehensive airport data.
            </p>
          </motion.div>
        </div>
      </CornerBrackets>

      {/* Moving Ticker */}
      <div className="absolute bottom-12 left-0 w-full overflow-hidden border-t border-zinc-300 dark:border-zinc-700 py-3 bg-zinc-100/50 dark:bg-zinc-900/60 backdrop-blur-sm">
        <motion.div
          className="flex whitespace-nowrap gap-12 text-xs font-mono text-zinc-500 uppercase tracking-widest"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex gap-12">
              <span>WIND 240@12KT</span>
              <span>VIS 10SM</span>
              <span>CEILING OVC030</span>
              <span className="text-blue-600">WEATHER ALERT</span>
              <span>QNH 29.92</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Weather Module
const WeatherModule = () => {
  // Fixed array to prevent hydration mismatch
  const rainParticles = useMemo(() => [
    { height: 45, left: 15, top: 25, duration: 1.2 },
    { height: 32, left: 42, top: 60, duration: 0.9 },
    { height: 58, left: 78, top: 10, duration: 1.5 },
    { height: 28, left: 55, top: 80, duration: 0.8 },
    { height: 40, left: 88, top: 35, duration: 1.1 },
    { height: 35, left: 22, top: 50, duration: 1.0 },
    { height: 48, left: 65, top: 15, duration: 1.3 },
    { height: 25, left: 38, top: 70, duration: 0.7 },
    { height: 52, left: 92, top: 45, duration: 1.4 },
    { height: 30, left: 8, top: 55, duration: 0.85 },
    { height: 42, left: 72, top: 28, duration: 1.15 },
    { height: 38, left: 48, top: 65, duration: 1.05 },
    { height: 44, left: 18, top: 40, duration: 1.25 },
    { height: 36, left: 82, top: 75, duration: 0.95 },
    { height: 50, left: 35, top: 20, duration: 1.35 },
    { height: 28, left: 62, top: 85, duration: 0.75 },
    { height: 46, left: 95, top: 30, duration: 1.28 },
    { height: 33, left: 12, top: 58, duration: 0.88 },
    { height: 41, left: 58, top: 48, duration: 1.18 },
    { height: 37, left: 75, top: 22, duration: 1.02 },
  ], []);

  return (
    <div className="col-span-1 glass-panel p-6 rounded-sm relative overflow-hidden h-96 group">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xs font-mono text-zinc-400 uppercase mb-1">
          Live Weather
        </h3>
        <div className="text-3xl font-light text-zinc-800 dark:text-zinc-50">
          Heavy Rain
        </div>
      </div>

      {/* Simulated Radar */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        {rainParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute bg-zinc-900 dark:bg-zinc-100 w-[1px]"
            style={{
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              transform: `rotate(15deg)`,
            }}
            animate={{ y: [0, 200], opacity: [0, 1, 0] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex justify-between items-end border-b border-zinc-300 dark:border-zinc-700 pb-2 mb-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">KJFK</span>
          <span className="text-xs font-mono text-blue-600">IFR</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <div>
            <div className="opacity-50">WIND</div>
            <div className="text-zinc-900 dark:text-zinc-50">040 @ 22G30</div>
          </div>
          <div>
            <div className="opacity-50">VIS</div>
            <div className="text-zinc-900 dark:text-zinc-50">1/2 SM</div>
          </div>
          <div>
            <div className="opacity-50">RVR</div>
            <div className="text-zinc-900 dark:text-zinc-50">2400VP6000</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Gauge
const RiskGauge = () => {
  return (
    <div className="col-span-1 glass-panel p-6 rounded-sm relative h-96 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-mono text-zinc-400 uppercase mb-1">
            Risk Analysis
          </h3>
          <div className="text-3xl font-light text-zinc-800 dark:text-zinc-50">
            Moderate
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
      </div>

      <div className="relative flex items-center justify-center py-8">
        <svg
          viewBox="0 0 100 50"
          className="w-full h-32 overflow-visible"
        >
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset="126"
            animate={{ strokeDashoffset: 60 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          {/* Needle */}
          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#1a1a1a"
            strokeWidth="2"
            style={{ originX: 50, originY: 50 }}
            animate={{ rotate: -20 }}
            transition={{ duration: 2, ease: "circOut" }}
          />
        </svg>
        <div className="absolute bottom-0 text-center">
          <div className="text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">
            42<span className="text-sm align-top text-zinc-400 dark:text-zinc-500">%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-1">
          <span>Geopolitical</span>
          <span className="text-zinc-900 dark:text-zinc-50">Low</span>
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-1">
          <span>Weather</span>
          <span className="text-blue-600">High</span>
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 pb-1">
          <span>Fatigue</span>
          <span className="text-zinc-900 dark:text-zinc-50">Normal</span>
        </div>
      </div>
    </div>
  );
};

// Airport Database
const AirportDatabase = () => {
  const [query, setQuery] = useState("");

  // Use real airport search
  const { data: searchResults, isLoading } = useAirportSearch(
    { query, limit: 10, popularFirst: true },
    { enabled: query.length >= 2 }
  );

  // Default results when no search
  const defaultResults = [
    { code: "KTEB", name: "Teterboro", rwy: "06/24", length: "7000ft" },
    { code: "EGLF", name: "Farnborough", rwy: "06/24", length: "8000ft" },
    {
      code: "LFMN",
      name: "Nice Côte d'Azur",
      rwy: "04/22",
      length: "9700ft",
    },
  ];

  // Map search results to display format
  const displayResults = query.length >= 2 && searchResults 
    ? searchResults.map(result => {
        const airport = result.airport;
        // Get first runway if available
        const firstRunway = airport.runways?.[0];
        const runwayIdent = firstRunway?.le_ident && firstRunway?.he_ident 
          ? `${firstRunway.le_ident}/${firstRunway.he_ident}`
          : "N/A";
        const runwayLength = airport.longest_runway_ft 
          ? `${Math.round(airport.longest_runway_ft)}ft`
          : "N/A";
        
        return {
          code: airport.icao,
          name: airport.name,
          rwy: runwayIdent,
          length: runwayLength,
        };
      })
    : defaultResults;

  return (
    <div className="glass-panel p-0 rounded-sm h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <h3 className="text-xs font-mono text-zinc-400 uppercase mb-4">
          Global Database
        </h3>
        <div className="relative">
          <Icon
            name="Search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="SEARCH ICAO / IATA..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-sm text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && query.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-zinc-300 border-t-blue-600 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-zinc-950">
        <div className="space-y-4">
          {displayResults.length > 0 ? (
            displayResults.map((apt, i) => (
              <motion.div
                key={apt.code + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                    {apt.code}
                  </span>
                  <span className="text-[10px] font-mono bg-zinc-100 px-1 rounded text-zinc-500">
                    {apt.length}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{apt.name}</span>
                  <span className="font-mono">RWY {apt.rwy}</span>
                </div>
                <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 mt-3 w-full group-hover:bg-zinc-200 dark:group-hover:bg-zinc-600 transition-colors"></div>
              </motion.div>
            ))
          ) : query.length >= 2 ? (
            <div className="text-center py-8 text-zinc-400 text-sm">
              No airports found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Dashboard section
const Dashboard = () => {
  return (
    <section className="py-24 px-4 md:px-12 max-w-8xl mx-auto relative z-20">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="text-4xl font-light tracking-tight">
          Operations Dashboard
        </h2>
        <div className="hidden md:block text-right">
          <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
            SYSTEM STATUS
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium">LIVE DATA FEED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        {/* Left Col: Weather & Risk */}
        <div className="space-y-6">
          <WeatherModule />
          <div className="h-48 glass-panel p-6 flex flex-col justify-center items-center text-center border-l-4 border-blue-600">
            <Icon name="AlertTriangle" className="text-blue-600 mb-2" />
            <div className="text-lg font-medium">NOTAM Alert</div>
            <div className="text-xs text-zinc-500 max-w-[200px]">
              Runway 04R Closed for Maintenance until 1400Z
            </div>
          </div>
        </div>

        {/* Center: The Map (Abstract) */}
        <div className="lg:col-span-1 glass-panel relative overflow-hidden rounded-sm flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full bg-zinc-900">
            {/* Abstract Map Grid */}
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Flight Path Animation */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <motion.path
                d="M 50 400 Q 150 200 350 100"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <motion.path
                d="M 50 400 Q 150 200 350 100"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.circle
                cx="350"
                cy="100"
                r={4}
                fill="white"
                initial={{ r: 4, opacity: 1 }}
                animate={{ r: [4, 8, 4], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </svg>

            {/* Plane Label */}
            <motion.div
              className="absolute top-20 right-10 bg-white/10 backdrop-blur-md p-2 border border-white/20 text-[10px] text-white font-mono"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div>AVN-881</div>
              <div className="text-blue-400">FL410</div>
              <div>480 KTS</div>
            </motion.div>
          </div>

          {/* Overlay Info */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs font-mono opacity-60">
                  DESTINATION
                </div>
                <div className="text-2xl font-medium">
                  London Heathrow
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono opacity-60">ETA</div>
                <div className="text-2xl font-mono">
                  08:45 <span className="text-sm">z</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Database & Stats */}
        <div className="space-y-6 h-full flex flex-col">
          <RiskGauge />
          <div className="flex-1">
            <AirportDatabase />
          </div>
        </div>
      </div>
    </section>
  );
};

// Capabilities section
const Capabilities = () => {
  const capabilities = [
    {
      label: "AI FLIGHT ASSISTANT",
      title: "Operator-grade answers in natural language.",
      description: "Deep briefings with tools that talk to real flight data.",
      chip: "Streaming",
      meta: "Chat Console",
      code: "AVN-01",
    },
    {
      label: "WEATHER INTEL",
      title: "Professional briefings from METAR, TAF, and radar.",
      description: "Readable summaries tuned for operators, not hobbyists.",
      chip: "METAR / TAF",
      meta: "Weather Briefing",
      code: "AVN-02",
    },
    {
      label: "GLOBAL AIRPORTS",
      title: "Clean runway data, FBO intel, and NOTAM context.",
      description: "10k+ fields with operational details at a glance.",
      chip: "10k+ fields",
      meta: "Airport Search",
      code: "AVN-03",
    },
    {
      label: "COMPLIANCE TOOLS",
      title: "Crew duty and regulatory checks built in.",
      description: "Part 117-aware calculators that keep limits in the loop.",
      chip: "Part 117",
      meta: "Compliance",
      code: "AVN-04",
    },
    {
      label: "FLIGHT WIZARD",
      title: "Create, review, and monitor every leg in one place.",
      description: "Adaptive wizard for single mission control surface.",
      chip: "Multi-leg",
      meta: "Flight Mission",
      code: "AVN-05",
    },
    {
      label: "INTEL & BRIEFINGS",
      title: "Structured briefings on routes, operators, and risks.",
      description: "Research endpoints for operator-grade briefing blocks.",
      chip: "Research",
      meta: "Intel Research",
      code: "AVN-06",
    },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-[#f4f4f4] dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-6">
        <CornerBrackets active={true}>
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em] mb-3">
                  System Capabilities
                </p>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">
                  One console for the whole flight.
                </h2>
              </div>
              <div className="max-w-sm text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-light">
                From first weather look to post-flight intel, Avion keeps chat, airports, compliance,
                and missions inside a single, operator-grade surface.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.label}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-20%" }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ duration: 0.7, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Accent line that grows on scroll */}
                  <div className="h-px w-12 bg-zinc-300 dark:bg-zinc-700/60 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 + index * 0.03 }}
                    />
                  </div>

                  {/* Label + Chip */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">
                      {capability.label}
                    </span>
                    {capability.chip && (
                      <span className="text-[9px] font-mono px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-zinc-100/60 dark:bg-zinc-800/40 whitespace-nowrap">
                        {capability.chip}
                      </span>
                    )}
                  </div>

                  {/* Title - Large and prominent */}
                  <h3 className="text-xl md:text-2xl font-light leading-tight text-zinc-900 dark:text-zinc-50">
                    {capability.title}
                  </h3>

                  {/* Supporting text */}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                    {capability.description}
                  </p>

                  {/* Bottom meta row */}
                  <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    <span className="uppercase tracking-[0.2em]">{capability.meta}</span>
                    <span>{capability.code}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-12 mt-8 border-t border-zinc-200/80 dark:border-zinc-800/90 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em]">
                Ready to fly
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <button className="px-4 py-2 text-[11px] uppercase tracking-[0.22em] border border-zinc-900 dark:border-zinc-100 bg-transparent text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors tactile-btn">
                    Create operator account
                  </button>
                </Link>
                <Link href="/login" className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-[0.22em]">
                  Already flying? Sign in
                </Link>
              </div>
            </div>
          </div>
        </CornerBrackets>
      </div>
    </section>
  );
};

// Manifesto section
const Manifesto = () => (
  <section className="bg-zinc-900 text-zinc-300 py-32 px-6 md:px-12 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-zinc-800/20 to-transparent pointer-events-none"></div>

    <div className="max-w-4xl mx-auto relative z-10">
      <CornerBrackets active={true}>
        <div className="space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-light leading-tight text-white"
          >
            Intelligent flight operations.
            <br />
            <span className="text-zinc-500">Simplified.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed font-light">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="space-y-4 origin-left"
            >
              <div className="h-px w-10 bg-zinc-700/60 overflow-hidden">
                <motion.div
                  className="h-px bg-blue-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                />
              </div>
              <p className="text-sm leading-relaxed text-zinc-300/90">
                Avion brings together comprehensive airport data, real-time weather intelligence,
                and AI-powered risk analysis into a single, intuitive platform. Built for charter
                operators who demand precision and efficiency in their operations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="space-y-4 origin-right"
            >
              <div className="h-px w-10 bg-zinc-700/60 overflow-hidden md:ml-auto">
                <motion.div
                  className="h-px bg-blue-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                />
              </div>
              <p className="text-sm leading-relaxed text-zinc-300/90">
                With natural language chat, instant airport search, and automated weather briefings,
                we help you make informed decisions faster. Focus on what matters—safe, efficient
                flights—while we handle the complexity of data aggregation and analysis.
              </p>
            </motion.div>
          </div>

          <div className="pt-12 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "10,000+ Airports",
              "Real-time Weather",
              "AI Risk Analysis",
              "Chat Assistant",
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Icon
                  name="CheckCircle2"
                  size={16}
                  className="text-blue-500"
                />
                <span className="text-xs uppercase tracking-widest font-mono">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CornerBrackets>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-[#e8e8e8] dark:bg-zinc-900 py-12 border-t border-zinc-300 dark:border-zinc-800">
    <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 text-[8px] font-mono">
          A
        </div>
        <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AVION
        </span>
      </div>

      <div className="flex gap-8 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
        <a href="#" className="hover:text-blue-600 transition-colors">
          Documentation
        </a>
        <a href="#" className="hover:text-blue-600 transition-colors">
          About
        </a>
        <a href="#" className="hover:text-blue-600 transition-colors">
          Contact
        </a>
      </div>

      <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
        BUILD 2025.11.13-BETA
      </div>
    </div>
  </footer>
);

// Main App component
export default function Landing() {
  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap");

        .mono {
          font-family: "JetBrains Mono", monospace;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2563eb;
        }

        /* Technical Grid */
        .tech-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
        }

        /* Dark theme grid override so it doesn't disappear into black */
        [data-theme="dark"] .tech-grid {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        }

        /* Inset "Screen" look */
        .glass-panel {
          background: rgba(245, 245, 245, 0.9);
          backdrop-filter: blur(12px);
          box-shadow:
            inset 0 0 20px rgba(255, 255, 255, 0.8),
            0 10px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }

        /* Dark variant for glass panels to improve contrast */
        [data-theme="dark"] .glass-panel {
          background: rgba(24, 24, 27, 0.94);
          box-shadow:
            inset 0 0 18px rgba(0, 0, 0, 0.7),
            0 12px 30px rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(63, 63, 70, 0.9);
        }

        .tactile-btn:active {
          transform: translateY(2px);
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
        }

        .scan-line {
          width: 100%;
          height: 2px;
          background: rgba(37, 99, 235, 0.5);
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(400px);
            opacity: 0;
          }
        }

        .knurled {
          background-image: radial-gradient(circle, #d1d1d1 1px, transparent 1px);
          background-size: 3px 3px;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#e8e8e8] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-x-hidden cursor-crosshair">
        <Header />
        <Hero />
        <div className="relative">
          {/* Vertical Line running through content */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-300 -translate-x-1/2 hidden md:block z-0"></div>
          <Dashboard />
        </div>
        <Capabilities />
        <LiveFleetView />
        <Manifesto />
        <Footer />
      </div>
    </>
  );
}

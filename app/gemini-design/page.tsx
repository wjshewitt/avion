"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { FileText, Database, Cpu, Link } from "lucide-react";

// Icon helper
const Icon = ({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} strokeWidth={1.5} />;
};

// --- ATMOSPHERE ENGINE (Weather Components) ---

const WeatherContainer = ({ 
  isNight, 
  children, 
  label, 
  temp 
}: { 
  isNight: boolean; 
  children: React.ReactNode; 
  label: string; 
  temp: number;
}) => (
  <div
    className={`relative overflow-hidden rounded-sm p-6 h-64 flex flex-col justify-between transition-colors duration-500 ${
      isNight ? "tungsten" : "ceramic"
    }`}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <div
          className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${
            isNight ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          Conditions
        </div>
        <div className="text-xl font-medium tracking-tight">{label}</div>
      </div>
      <div
        className={`font-mono text-2xl font-light ${
          isNight ? "text-zinc-300" : "text-zinc-800"
        }`}
      >
        {temp}°
      </div>
    </div>

    {/* Weather Animation Layer */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {children}
    </div>

    <div className="relative z-10 flex gap-4 text-[10px] font-mono opacity-60 uppercase">
      <span>Vis: 10SM</span>
      <span>QNH: 29.92</span>
    </div>
  </div>
);

const RainEffect = ({ intensity = 20, isStorm = false }: { intensity?: number; isStorm?: boolean }) => {
  const drops = useMemo(
    () =>
      [...Array(intensity)].map(() => ({
        height: Math.random() * 30 + 10,
        left: Math.random() * 100,
        delay: Math.random(),
      })),
    [intensity]
  );

  const stormDelay = useMemo(() => (isStorm ? Math.random() * 5 : 0), [isStorm]);

  return (
    <>
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          className={`absolute w-[1px] ${isStorm ? "bg-zinc-400" : "bg-blue-400/50"}`}
          style={{
            height: `${drop.height}px`,
            left: `${drop.left}%`,
            top: -50,
          }}
          animate={{ y: 400, opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        />
      ))}
      {isStorm && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
          animate={{ opacity: [0, 0, 0.4, 0, 0, 0.2, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: stormDelay,
          }}
        />
      )}
    </>
  );
};

const SunEffect = ({ isNight }: { isNight: boolean }) => (
  <div className="absolute top-8 right-8 pointer-events-none">
    {isNight ? (
      <motion.div
        className="w-16 h-16 rounded-full border border-zinc-600 bg-zinc-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
      </motion.div>
    ) : (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-full border-[1px] border-orange-400/30 flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full bg-orange-500/10 backdrop-blur-sm border border-orange-500/20"></div>
        <div className="absolute w-full h-[1px] bg-orange-400/20"></div>
        <div className="absolute h-full w-[1px] bg-orange-400/20"></div>
      </motion.div>
    )}
  </div>
);

const SnowEffect = () => (
  <>
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-white/60"
        initial={{ y: -10, x: (i * 3.3) % 100 + "%" }}
        animate={{
          y: 300,
          x: [(i * 3.3) % 100 + "%", ((i * 3.3) % 100) - 5 + "%"],
        }}
        transition={{
          duration: (i % 3) + 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </>
);

const FogEffect = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    animate={{ x: ["-100%", "100%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    style={{ opacity: 0.5 }}
  />
);

// --- FEATURE COMPONENTS ---

// Risk Prism
const RiskPrism = ({ score = 24 }: { score?: number }) => {
  const getColor = (s: number) =>
    s < 30 ? "bg-emerald-500" : s < 70 ? "bg-amber-500" : "bg-[#F04E30]";

  return (
    <div className="ceramic p-6 rounded-sm h-64 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Mission Risk
        </h3>
        <div
          className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-sm ${getColor(score)}`}
        >
          {score < 30 ? "LOW" : score < 70 ? "MODERATE" : "HIGH"}
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 mb-4 h-32 border-b border-zinc-200 pb-4 relative">
        {/* Risk Bars */}
        {[
          { l: "WX", v: 60 },
          { l: "FAT", v: 20 },
          { l: "RWY", v: 10 },
          { l: "GEO", v: 5 },
        ].map((factor, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end h-full group relative"
          >
            <motion.div
              className={`w-full rounded-sm opacity-80 ${getColor(factor.v)}`}
              initial={{ height: 0 }}
              animate={{ height: `${factor.v}%` }}
              transition={{ delay: i * 0.1, duration: 1 }}
            />
            <span className="text-[10px] font-mono text-zinc-400 text-center mt-2">
              {factor.l}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-zinc-800 text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap">
              {factor.v}%
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-zinc-500 leading-tight">
        Risk factors nominal. Weather vector elevated due to convection
        enroute.
      </div>
    </div>
  );
};

// Airport Profile
const AirportProfile = ({ 
  code, 
  name, 
  rwyHeading, 
  windHeading 
}: { 
  code: string; 
  name: string; 
  rwyHeading: number; 
  windHeading: number;
}) => {
  return (
    <div className="ceramic p-6 rounded-sm h-64 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-bold text-zinc-800">{code}</h2>
          <Icon name="Plane" size={16} className="text-zinc-400" />
        </div>
        <div className="text-xs text-zinc-500 truncate mb-4">{name}</div>

        <div className="space-y-2 font-mono text-[10px] text-zinc-600">
          <div className="flex justify-between border-b border-zinc-200 pb-1">
            <span>RWY</span>
            <span className="font-bold">04L / 22R</span>
          </div>
          <div className="flex justify-between border-b border-zinc-200 pb-1">
            <span>LEN</span>
            <span>11,000 FT</span>
          </div>
          <div className="flex justify-between border-b border-zinc-200 pb-1">
            <span>ELEV</span>
            <span>142 FT</span>
          </div>
        </div>
      </div>

      {/* Compass / Runway Graphic */}
      <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-20">
        <div className="w-full h-full border-2 border-zinc-900 rounded-full relative flex items-center justify-center">
          {/* Runway */}
          <div
            className="absolute w-2 h-32 bg-zinc-900"
            style={{ transform: `rotate(${rwyHeading}deg)` }}
          ></div>
          {/* Wind Arrow */}
          <div
            className="absolute w-0.5 h-16 bg-[#F04E30] origin-bottom"
            style={{
              transform: `rotate(${windHeading}deg) translateY(-50%)`,
            }}
          >
            <div className="w-2 h-2 bg-[#F04E30] rounded-full absolute top-0 -left-[3px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Crew Status
const CrewStatus = () => {
  const crew = [
    { role: "PIC", name: "J. Reynolds", status: "active" },
    { role: "SIC", name: "A. Wong", status: "active" },
    { role: "FA", name: "S. Miller", status: "rest" },
  ];

  return (
    <div className="ceramic p-6 rounded-sm h-64 flex flex-col">
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6">
        Crew Manifest
      </h3>
      <div className="flex-1 flex flex-col gap-4">
        {crew.map((member, i) => (
          <div
            key={i}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  member.status === "active" ? "bg-zinc-800" : "bg-zinc-300"
                }`}
              >
                {member.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-800">
                  {member.name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {member.role}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`w-2 h-2 rounded-full inline-block mb-1 ${
                  member.status === "active"
                    ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]"
                    : "bg-amber-400"
                }`}
              ></div>
              <div className="text-[8px] uppercase text-zinc-400">
                {member.status === "active" ? "On Duty" : "Resting"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fuel Monitor
const FuelMonitor = () => {
  return (
    <div className="ceramic p-6 rounded-sm h-64 flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Fuel On Board
        </h3>
        <span className="text-xl font-light text-zinc-800 tabular-nums">
          24,500 <span className="text-xs text-zinc-400">LBS</span>
        </span>
      </div>

      <div className="flex-1 flex gap-4">
        {/* Left Tank */}
        <div className="flex-1 bg-zinc-100 rounded-sm relative overflow-hidden groove">
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-zinc-700 opacity-80"
            initial={{ height: 0 }}
            animate={{ height: "64%" }}
            transition={{ duration: 2 }}
          />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 z-10">
            L
          </div>
        </div>
        {/* Center Tank */}
        <div className="flex-1 bg-zinc-100 rounded-sm relative overflow-hidden groove">
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-zinc-700 opacity-80"
            initial={{ height: 0 }}
            animate={{ height: "82%" }}
            transition={{ duration: 2, delay: 0.2 }}
          />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 z-10">
            C
          </div>
        </div>
        {/* Right Tank */}
        <div className="flex-1 bg-zinc-100 rounded-sm relative overflow-hidden groove">
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-zinc-700 opacity-80"
            initial={{ height: 0 }}
            animate={{ height: "64%" }}
            transition={{ duration: 2, delay: 0.4 }}
          />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 z-10">
            R
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-mono text-zinc-500">
        <span>Endurance: 05+30</span>
        <span className="text-emerald-600">Balanced</span>
      </div>
    </div>
  );
};

// Pilot Scratchpad
const Scratchpad = () => {
  return (
    <div className="ceramic p-0 rounded-sm h-64 flex flex-col overflow-hidden">
      <div className="bg-[#e0e0e0] p-2 border-b border-zinc-300 flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase text-zinc-500 ml-2">
          Scratchpad
        </span>
        <Icon
          name="Eraser"
          size={14}
          className="text-zinc-500 hover:text-[#F04E30] cursor-pointer mr-2"
        />
      </div>
      <textarea
        className="flex-1 w-full bg-[#f4f4f4] p-4 text-sm font-mono text-zinc-800 focus:outline-none resize-none"
        placeholder="CLR DELIVERY 121.85..."
        style={{
          backgroundImage: "linear-gradient(#e5e5e5 1px, transparent 1px)",
          backgroundSize: "100% 24px",
          lineHeight: "24px",
        }}
      ></textarea>
    </div>
  );
};

// Pre-Flight Checklist
const Checklist = () => {
  const [items, setItems] = useState([
    { id: 1, label: "Gear Pins", checked: true },
    { id: 2, label: "Pitot Covers", checked: true },
    { id: 3, label: "Fuel Sample", checked: false },
    { id: 4, label: "Tire Pressure", checked: false },
  ]);

  const toggle = (id: number) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  return (
    <div className="ceramic p-6 rounded-sm h-64 overflow-y-auto">
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
        Walkaround
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group"
          >
            <span
              className={`text-sm font-medium transition-all ${
                item.checked ? "text-zinc-400 line-through" : "text-zinc-800"
              }`}
            >
              {item.label}
            </span>
            <div
              onClick={() => toggle(item.id)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                item.checked ? "bg-[#F04E30]" : "bg-zinc-300"
              }`}
            >
              <motion.div
                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                animate={{ left: item.checked ? "24px" : "4px" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Gemini Chat Interface Patterns ---

const ThinkingIndicator = () => {
  const steps = ["Parsing...", "Querying...", "Synthesizing..."];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tungsten p-6 rounded-sm h-64 flex flex-col items-center justify-center">
      <div className="flex items-end h-8 gap-1.5 mb-4">
        <motion.div
          className="w-2 bg-zinc-400"
          animate={{ height: ["20%", "80%", "20%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="w-2 bg-zinc-400"
          animate={{ height: ["20%", "80%", "20%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="w-2 bg-zinc-400"
          animate={{ height: ["20%", "80%", "20%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
      <div className="text-xs font-mono text-zinc-400 tracking-widest">
        {steps[currentStep]}
      </div>
    </div>
  );
};

const AIMessage = () => {
  return (
    <div className="tungsten p-6 rounded-sm h-64 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-[10px] font-mono uppercase text-zinc-400">
          Avion AI
        </div>
        <span className="px-1.5 py-0.5 text-[8px] font-bold text-zinc-800 bg-zinc-400 rounded-sm">
          v1.2
        </span>
      </div>
      <div className="text-sm text-zinc-300 leading-relaxed flex-1">
        <p>
          Certainly. I've analyzed the flight plan for{" "}
          <span className="text-[#F04E30] font-mono">AVN-881</span>. The route
          is clear of significant weather events, but there is a new NOTAM for
          runway 22L at KTEB indicating a temporary closure. I recommend
          revising the approach to use runway 04R.
        </p>
        <motion.div
          className="w-0.5 h-4 bg-[#F04E30] inline-block"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

const VerifiedSources = () => {
  const sources = [
    { title: "FAA NOTAM Database", domain: "faa.gov" },
    { title: "Global Weather Model GFS-0.25", domain: "noaa.gov" },
  ];
  return (
    <div className="tungsten p-6 rounded-sm h-64 flex flex-col">
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
        Verified Sources
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <div
            key={i}
            className="ceramic rounded-sm p-4 flex flex-col justify-between h-28 cursor-pointer hover:border-[#F04E30] border-transparent border transition-colors group"
          >
            <div>
              <div className="font-semibold text-sm text-zinc-800 mb-1 group-hover:text-[#F04E30]">
                {source.title}
              </div>
              <div className="text-[10px] font-mono text-zinc-500">
                {source.domain}
              </div>
            </div>
            <Icon
              name="ArrowUpRight"
              size={14}
              className="text-zinc-400 self-end group-hover:text-[#F04E30]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- AVION CHAT COMPONENTS FROM LIBRARY ---

const AvionThinkingIndicatorDemo = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "Parsing Request",
    "Querying Knowledge Base",
    "Synthesizing Response",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ceramic rounded-sm h-64 flex items-center justify-center">
      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-100 shadow-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-4 bg-zinc-800 rounded-full"
              animate={{
                height: ["4px", "16px", "4px"],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <div className="h-4 w-[1px] bg-zinc-200 mx-1" />
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="text-xs font-mono text-zinc-500 uppercase tracking-wide"
          >
            {steps[step]}...
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

type AvionSourceType = "database" | "file";

interface AvionSourceProps {
  title: string;
  type: AvionSourceType;
  metadata: string;
  url?: string;
}

const AvionSourceCard = ({ title, type, metadata, url }: AvionSourceProps) => {
  return (
    <a
      href={url || "#"}
      className="group flex items-start gap-3 p-3 bg-white border border-zinc-200 rounded-md hover:border-[#F04E30] hover:shadow-sm transition-all cursor-pointer min-w-[200px] max-w-[240px] text-left no-underline"
    >
      <div className="mt-0.5 p-1.5 bg-zinc-50 rounded-sm border border-zinc-100 text-zinc-500 group-hover:text-[#F04E30] transition-colors shrink-0">
        {type === "database" ? <Database size={14} /> : <FileText size={14} />}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs font-semibold text-zinc-800 truncate pr-2 group-hover:text-zinc-900 transition-colors">
          {title}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono mt-1 truncate">
          {metadata}
        </span>
      </div>
    </a>
  );
};

const AvionSourceCardDemo = () => {
  const sources: AvionSourceProps[] = [
    {
      title: "FAA NOTAM Database",
      type: "database",
      metadata: "NOTAM • Updated 3 min ago",
      url: "https://notams.aim.faa.gov",
    },
    {
      title: "Global Weather Model GFS-0.25",
      type: "database",
      metadata: "NOAA • 06Z Run",
      url: "https://www.noaa.gov",
    },
  ];

  return (
    <div className="tungsten p-4 rounded-sm h-64 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Link size={12} className="text-zinc-400" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          Avion Sources
        </span>
      </div>
      <div className="flex flex-wrap gap-2 overflow-y-auto">
        {sources.map((src) => (
          <AvionSourceCard key={src.title} {...src} />
        ))}
      </div>
    </div>
  );
};

type AvionAIMessageSource = AvionSourceProps;

interface AvionAIMessageProps {
  content: string;
  sources?: AvionAIMessageSource[];
  isTyping?: boolean;
}

const AvionAIMessage = ({ content, sources, isTyping }: AvionAIMessageProps) => {
  return (
    <div className="flex gap-4 mb-2 w-full">
      <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white shadow-sm mt-1">
        <Cpu size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-zinc-900">Avion Intelligence</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-mono border border-zinc-200">
            v2.4
          </span>
        </div>
        <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
          {content}
          {isTyping && (
            <span className="inline-block w-1.5 h-4 bg-[#F04E30] ml-1 align-middle animate-pulse" />
          )}
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Link size={12} className="text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Verified Sources
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, idx) => (
                <AvionSourceCard key={idx} {...src} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AvionAIMessageDemo = () => {
  const content =
    "I've analyzed the route for AVN-881. Conditions are VFR with scattered clouds and light crosswinds at KTEB. Runway 04R remains the optimal arrival with current NOTAMs.";

  const sources: AvionAIMessageSource[] = [
    {
      title: "METAR KTEB 151651Z",
      type: "file",
      metadata: "Ceilings • Winds 040/08",
    },
    {
      title: "FAA NOTAM Feed",
      type: "database",
      metadata: "RWY 22L • Closure Active",
    },
  ];

  return (
    <div className="ceramic p-4 rounded-sm h-64 flex flex-col">
      <AvionAIMessage content={content} sources={sources} isTyping />
    </div>
  );
};

// --- Component Patterns ---

const FlightStatusSelector = () => {
  const [selected, setSelected] = useState("On Time");
  const statuses = ["On Time", "Delayed", "Cancelled"];
  const colors = {
    "On Time": "border-emerald-500 text-emerald-500",
    Delayed: "border-amber-500 text-amber-500",
    Cancelled: "border-[#F04E30] text-[#F04E30]",
  };

  return (
    <div className="ceramic p-6 rounded-sm h-64 flex flex-col">
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
        Flight Status
      </h3>
      <div className="flex flex-col gap-3">
        {statuses.map((status) => (
          <div
            key={status}
            onClick={() => setSelected(status)}
            className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
              selected === status
                ? colors[status as keyof typeof colors] + " bg-white/50"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
            }`}
          >
            <span className="font-medium text-sm">{status}</span>
            {selected === status && (
              <motion.div
                layoutId="status-selector-check"
                className="w-4 h-4 bg-current rounded-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressIndicator = () => {
  const steps = ["Route", "Aircraft", "Crew", "Review"];
  const [current, setCurrent] = useState(1);

  return (
    <div className="ceramic p-6 rounded-sm h-64 flex flex-col justify-center">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Flight Setup
        </div>
        <div className="text-xs font-mono text-zinc-500">
          STEP {current + 1} / {steps.length}
        </div>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-1.5 groove relative mb-4">
        <motion.div
          className="bg-[#F04E30] h-1.5 rounded-full"
          animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`text-xs font-mono uppercase transition-colors ${
              i <= current ? "text-zinc-700" : "text-zinc-400"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <button
        onClick={() => setCurrent((p) => (p + 1) % steps.length)}
        className="mt-8 w-full ceramic font-semibold text-sm text-zinc-800 py-2.5 rounded-sm border-zinc-300 border hover:bg-white active:shadow-inner"
      >
        Next Step
      </button>
    </div>
  );
};

// --- DIETER RAMS INSPIRED DYNAMIC CHAT COMPONENTS ---

const DataCassette = ({ title, domain, state }: { title: string; domain: string; state: 'idle' | 'loading' | 'loaded' }) => {
  const variants = {
    idle: { borderColor: "#a1a1aa" },
    loading: { borderColor: "#F04E30" },
    loaded: { borderColor: "#10b981" },
  };

  return (
    <motion.div 
      className="tungsten rounded-sm p-3 border-l-4 flex items-center gap-4"
      variants={variants}
      animate={state}
      transition={{ duration: 0.5 }}
    >
      <div className="w-8 h-12 bg-zinc-900/50 rounded-sm flex flex-col items-center justify-center gap-1 p-1">
        <div className="w-full h-1 bg-zinc-700 rounded-full"/>
        <div className="w-full h-1 bg-zinc-700 rounded-full"/>
        <div className="w-4 h-1 bg-zinc-700 rounded-full self-start ml-1"/>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-zinc-200">{title}</div>
        <div className="text-[10px] font-mono text-zinc-400 uppercase">{domain}</div>
      </div>
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-4 h-4 border-2 border-dashed border-[#F04E30] rounded-full animate-spin"
            style={{ animationDuration: '1s' }}
          />
        )}
        {state === 'loaded' && (
          <motion.div key="loaded" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Icon name="Check" size={16} className="text-emerald-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StreamingAIMessage = () => {
  const fullText = "The flight plan for AVN-881 is optimized. I've cross-referenced METAR data with the TAF for KTEB. Winds are calm, favoring runway 04R for arrival. All systems nominal.";
  const [text, setText] = useState("");

  useEffect(() => {
    setText("");
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tungsten p-4 rounded-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
        <div className="text-[10px] font-mono uppercase text-zinc-400">Avion AI</div>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed min-h-[60px]">
        {text}
        <motion.span 
          className="w-0.5 h-4 bg-[#F04E30] inline-block ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </p>
      <div className="space-y-2">
        <DataCassette title="FAA NOTAM Database" domain="faa.gov" state="loaded" />
        <DataCassette title="Global Weather Model" domain="noaa.gov" state="loaded" />
      </div>
    </div>
  );
};

const UserPrompt = ({ text }: { text: string }) => (
  <div className="ceramic p-4 rounded-sm ml-auto max-w-md">
    <p className="text-sm text-zinc-800 leading-relaxed">{text}</p>
  </div>
);

const CommandInput = () => (
  <div className="tungsten p-2 rounded-sm flex items-center gap-2">
    <input 
      type="text"
      placeholder="Send message..."
      className="flex-1 bg-transparent text-zinc-300 text-sm focus:outline-none px-2"
    />
    <button className="w-8 h-8 rounded-sm bg-[#F04E30] flex items-center justify-center hover:bg-orange-600 transition-colors">
      <Icon name="Send" size={16} className="text-white" />
    </button>
  </div>
);

const ChatContainer = () => (
  <div className="bg-zinc-800/50 p-4 rounded-sm space-y-4 h-[40rem] flex flex-col">
    <div className="flex-1 space-y-4 overflow-y-auto p-2">
      <UserPrompt text="Verify flight plan for AVN-881 and check weather at KTEB." />
      <StreamingAIMessage />
    </div>
    <CommandInput />
  </div>
);

const ThinkingProcess = () => {
  const processSteps = [
    "Deconstructing Query",
    "Accessing Flight Data",
    "Cross-referencing NOTAMs",
    "Analyzing Weather Models",
    "Evaluating Risk Factors",
    "Synthesizing Recommendation",
  ];
  const [currentProcessStep, setCurrentProcessStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProcessStep((prev) => (prev + 1) % processSteps.length);
    }, 2000); // Cycle every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tungsten p-6 rounded-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4">
          Model Thinking
        </h3>
        <div className="space-y-3">
          {processSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  index === currentProcessStep
                    ? "bg-[#F04E30] shadow-[0_0_5px_rgba(240,78,48,0.6)]"
                    : index < currentProcessStep
                    ? "bg-emerald-500"
                    : "bg-zinc-600"
                }`}
              ></div>
              <span
                className={`text-sm font-mono ${
                  index === currentProcessStep
                    ? "text-zinc-100"
                    : index < currentProcessStep
                    ? "text-zinc-400"
                    : "text-zinc-500"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase text-zinc-500">
          Status:{" "}
          <span className="text-[#F04E30]">
            {processSteps[currentProcessStep]}
          </span>
        </div>
        <motion.div
          className="w-6 h-6 rounded-full border-2 border-dashed border-blue-500 animate-spin"
          style={{ animationDuration: '1.5s' }}
        ></motion.div>
      </div>
    </div>
  );
};


// --- NEW MODEL THINKING COMPONENTS ---

/**
 * ModelThinkingStream: An in-chat component that displays a stream of text
 * representing the model's internal monologue.
 */
const ModelThinkingStream = ({ thoughts, onFinished }: { thoughts: string[]; onFinished: () => void }) => {
  const [visibleThought, setVisibleThought] = useState("");
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (thoughtIndex >= thoughts.length) {
      onFinished();
      return;
    }

    const thought = thoughts[thoughtIndex];
    let charIndex = 0;
    const interval = setInterval(() => {
      setVisibleThought(thought.substring(0, charIndex + 1));
      charIndex++;
      if (charIndex >= thought.length) {
        clearInterval(interval);
        setTimeout(() => setThoughtIndex(thoughtIndex + 1), 700); // Pause before next thought
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [thoughtIndex, thoughts, onFinished]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
        className="bg-zinc-800/50 p-3 rounded-sm border border-zinc-700 mb-4"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="animate-spin" style={{ animationDuration: '3s' }}>
            <Icon name="Cog" size={14} className="text-zinc-400" />
          </div>
          <p className="text-xs font-mono tracking-wide">{visibleThought}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * AIMessageWithThinking: A component that wraps the thinking process and the final
 * AI-generated message, creating a seamless, dynamic reveal.
 */
const AIMessageWithThinking = () => {
  const [isThinking, setIsThinking] = useState(true);

  const thoughts = [
    "User is asking for flight options.",
    "Required parameters: origin, destination, date.",
    "Accessing `flight_search` tool...",
    "Querying database for flights: LAX -> JFK on 2025-11-18.",
    "Found 3 matching flights.",
    "Formatting results into a readable summary.",
  ];

  const finalAnswer = "I found three flights from LAX to JFK on November 18. The earliest is AVN-202 at 08:00, followed by AVN-331 at 11:30, and the last is AVN-109 at 17:00. Would you like to book one?";

  return (
    <div className="tungsten p-4 rounded-sm space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
        <div className="text-[10px] font-mono uppercase text-zinc-400">Avion AI</div>
      </div>

      {isThinking && (
        <ModelThinkingStream
          thoughts={thoughts}
          onFinished={() => setIsThinking(false)}
        />
      )}

      <AnimatePresence>
        {!isThinking && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-zinc-300 leading-relaxed"
          >
            {finalAnswer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function GeminiDesign() {
  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap");

        body {
          background-color: #e8e8e8;
          color: #1a1a1a;
          font-family: "Inter", sans-serif;
        }

        .mono {
          font-family: "JetBrains Mono", monospace;
        }

        /* TEXTURES & DEPTH */
        .ceramic {
          background: #f4f4f4;
          box-shadow:
            -2px -2px 5px rgba(255, 255, 255, 0.8),
            2px 2px 5px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .tungsten {
          background: #2a2a2a;
          color: #e5e5e5;
          box-shadow:
            inset 0 0 20px rgba(0, 0, 0, 0.5),
            0 10px 20px rgba(0, 0, 0, 0.2);
          border: 1px solid #333;
        }

        .groove {
          box-shadow:
            inset 1px 1px 3px rgba(0, 0, 0, 0.1),
            inset -1px -1px 3px rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="min-h-screen p-12 max-w-[1600px] mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            Avion Component System{" "}
            <span className="text-[#F04E30] text-base align-top">v1.7</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl">
            A modular UI kit for the Avion Flight OS. Designed for high-contrast legibility and tactile interaction, inspired by Dieter Rams' principles.
          </p>
        </div>

        {/* SECTION 1: ATMOSPHERE */}
        <div className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            01. Atmosphere Engines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WeatherContainer label="Sunny" temp={72} isNight={false}>
              <SunEffect isNight={false} />
            </WeatherContainer>
            <WeatherContainer label="Heavy Rain" temp={64} isNight={false}>
              <RainEffect intensity={40} />
            </WeatherContainer>
            <WeatherContainer label="Thunderstorm" temp={61} isNight={true}>
              <RainEffect intensity={50} isStorm={true} />
            </WeatherContainer>
            <WeatherContainer label="Clear Night" temp={45} isNight={true}>
              <SunEffect isNight={true} />
              <div className="absolute w-1 h-1 bg-white rounded-full top-12 left-12 opacity-60 animate-pulse"></div>
              <div className="absolute w-1 h-1 bg-white rounded-full bottom-12 right-24 opacity-40"></div>
            </WeatherContainer>
          </div>
        </div>

        {/* SECTION 2: MISSION CRITICAL */}
        <div className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            02. Flight Deck Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RiskPrism score={45} />
            <AirportProfile
              code="KTEB"
              name="Teterboro Airport"
              rwyHeading={40}
              windHeading={220}
            />
            <FuelMonitor />
            <CrewStatus />
            <Checklist />
            <Scratchpad />
          </div>
        </div>

        {/* SECTION 3: GEMINI CHAT INTERFACE */}
        <div className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            03. Gemini Chat Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ThinkingIndicator />
            <AIMessage />
            <VerifiedSources />
          </div>
        </div>

        {/* SECTION 4: COMPONENT PATTERNS */}
        <div className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            04. Core Component Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FlightStatusSelector />
            <ProgressIndicator />
          </div>
        </div>

        {/* SECTION 5: DYNAMIC CHAT SYSTEM */}
        <section className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            05. Dynamic Chat System (Dieter Rams Edition)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="tungsten p-4 rounded-sm">
              <ChatContainer />
            </div>
            <div className="space-y-6">
              <ThinkingProcess />
              <AIMessageWithThinking />
            </div>
            <div className="space-y-6">
              <RiskPrism score={21} />
              <RiskPrism score={85} />
            </div>
          </div>
        </section>

        {/* SECTION 6: AVION CHAT COMPONENTS */}
        <div className="mb-16">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-300 pb-2">
            06. Avion Chat Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AvionThinkingIndicatorDemo />
            <AvionSourceCardDemo />
            <AvionAIMessageDemo />
          </div>
        </div>

        <footer className="mt-24 text-center text-[10px] font-mono text-zinc-400 uppercase">
          Avion Systems Design Dept. &mdash; As little design as possible.
        </footer>
      </div>
    </>
  );
}

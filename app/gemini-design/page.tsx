"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

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

const RainEffect = ({ intensity = 20, isStorm = false }: { intensity?: number; isStorm?: boolean }) => (
  <>
    {[...Array(intensity)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-[1px] ${isStorm ? "bg-zinc-400" : "bg-blue-400/50"}`}
        style={{
          height: (i % 3) * 10 + 10 + "px",
          left: (i * 5) % 100 + "%",
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
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    )}
  </>
);

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

      <div className="min-h-screen p-12 max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            Avion Component System{" "}
            <span className="text-[#F04E30] text-base align-top">v1.2</span>
          </h1>
          <p className="text-zinc-500 max-w-xl">
            A modular UI kit for the Avion Flight OS. Designed for
            high-contrast legibility and tactile interaction.
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

            <WeatherContainer label="Arctic / Snow" temp={-4} isNight={false}>
              <SnowEffect />
            </WeatherContainer>

            <WeatherContainer label="Low Vis / Fog" temp={52} isNight={true}>
              <FogEffect />
            </WeatherContainer>
          </div>
        </div>

        {/* SECTION 2: MISSION CRITICAL */}
        <div>
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

        <footer className="mt-24 text-center text-[10px] font-mono text-zinc-400 uppercase">
          Avion Systems Design Dept.
        </footer>
      </div>
    </>
  );
}

"use client";

import { motion } from "framer-motion";

export type AtmosphereVariant =
  | "sunny"
  | "heavy-rain"
  | "thunderstorm"
  | "clear-night"
  | "arctic-snow"
  | "low-vis-fog";

interface WeatherContainerProps {
  isNight: boolean;
  children: React.ReactNode;
  label: string;
  temp: number | null | undefined;
  visibilitySm?: number | null;
  qnhInHg?: number | null;
}

const WeatherContainer = ({
  isNight,
  children,
  label,
  temp,
  visibilitySm,
  qnhInHg,
}: WeatherContainerProps) => (
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
        {temp != null ? `${Math.round(temp)}°` : "—"}
      </div>
    </div>

    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {children}
    </div>

    <div className="relative z-10 flex gap-4 text-[10px] font-mono opacity-60 uppercase">
      {visibilitySm != null && (
        <span>Vis: {visibilitySm >= 10 ? "10SM" : `${visibilitySm.toFixed(1)}SM`}</span>
      )}
      {qnhInHg != null && <span>QNH: {qnhInHg.toFixed(2)}</span>}
    </div>
  </div>
);

const RainEffect = ({ intensity = 20, isStorm = false }: { intensity?: number; isStorm?: boolean }) => (
  <>
    {[...Array(intensity)].map((_, i) => (
      <motion.div
        // eslint-disable-next-line react/no-array-index-key
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
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-full border-[1px] border-orange-400/30 flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full bg-orange-500/10 backdrop-blur-sm border border-orange-500/20" />
        <div className="absolute w-full h-[1px] bg-orange-400/20" />
        <div className="absolute h-full w-[1px] bg-orange-400/20" />
      </motion.div>
    )}
  </div>
);

const SnowEffect = () => (
  <>
    {[...Array(30)].map((_, i) => (
      <motion.div
        // eslint-disable-next-line react/no-array-index-key
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
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    animate={{ x: ["-100%", "100%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    style={{ opacity: 0.5 }}
  />
);

export interface AvionAtmosphereCardProps {
  variant: AtmosphereVariant;
  tempC?: number | null;
  isNight: boolean;
  visibilitySm?: number | null;
  qnhInHg?: number | null;
}

export function AvionAtmosphereCard({
  variant,
  tempC,
  isNight,
  visibilitySm,
  qnhInHg,
}: AvionAtmosphereCardProps) {
  const commonProps = {
    isNight,
    temp: tempC ?? null,
    visibilitySm,
    qnhInHg,
  };

  switch (variant) {
    case "heavy-rain":
      return (
        <WeatherContainer label="Heavy Rain" {...commonProps} isNight={false}>
          <RainEffect intensity={40} />
        </WeatherContainer>
      );
    case "thunderstorm":
      return (
        <WeatherContainer label="Thunderstorm" {...commonProps} isNight>
          <RainEffect intensity={50} isStorm />
        </WeatherContainer>
      );
    case "clear-night":
      return (
        <WeatherContainer label="Clear Night" {...commonProps} isNight>
          <SunEffect isNight />
          <div className="absolute w-1 h-1 bg-white rounded-full top-12 left-12 opacity-60 animate-pulse" />
          <div className="absolute w-1 h-1 bg-white rounded-full bottom-12 right-24 opacity-40" />
        </WeatherContainer>
      );
    case "arctic-snow":
      return (
        <WeatherContainer label="Arctic / Snow" {...commonProps} isNight={false}>
          <SnowEffect />
        </WeatherContainer>
      );
    case "low-vis-fog":
      return (
        <WeatherContainer label="Low Vis / Fog" {...commonProps} isNight>
          <FogEffect />
        </WeatherContainer>
      );
    case "sunny":
    default:
      return (
        <WeatherContainer label="Sunny" {...commonProps} isNight={false}>
          <SunEffect isNight={false} />
        </WeatherContainer>
      );
  }
}

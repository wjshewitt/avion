"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { ThemeToggleCompact } from "@/components/theme-toggle";

// Shared secure access shell used by login and signup

interface SecureAccessLayoutProps {
  children: ReactNode;
}

export function SecureAccessLayout({ children }: SecureAccessLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#e8e8e8] dark:bg-zinc-950">
      {/* Left: Ceramic auth panel */}
      <div className="relative flex w-full items-center justify-center bg-[#F4F4F4] text-zinc-900 shadow-[10px_0_30px_rgba(0,0,0,0.25)] dark:bg-zinc-900 dark:text-zinc-50 lg:w-[45%] lg:p-10 p-6">
        <div className="pointer-events-auto absolute right-6 top-6 lg:right-10 lg:top-8">
          <ThemeToggleCompact />
        </div>
        <div className="z-10 w-full max-w-sm">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
        <LegalLine />
      </div>

      {/* Right: Tungsten visualizer */}
      <div className="relative hidden h-full w-[55%] overflow-hidden bg-[#050712] text-white lg:block">
        <FlightVisualizer />
        <RightOverlayCopy />
      </div>
    </div>
  );
}

function LegalLine() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 font-mono text-[10px] text-zinc-400 dark:text-zinc-500 lg:bottom-8 lg:left-10">
      Secure connection · 256-bit encryption
    </div>
  );
}

function RightOverlayCopy() {
  return (
    <div className="pointer-events-none absolute bottom-10 left-10 z-20 max-w-md lg:bottom-16 lg:left-14">
      <div className="mb-4 h-[1px] w-12 bg-[#F04E30]" />
      <h2 className="mb-3 text-2xl font-light tracking-tight text-white lg:text-3xl">
        Monitor flights with confidence.
      </h2>
      <p className="font-mono text-xs leading-relaxed text-zinc-400 lg:text-sm">
        Avion brings flight, weather, and risk data into a single workspace so your
        team can make clear decisions quickly.
      </p>
    </div>
  );
}

function FlightVisualizer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatedGridPattern
        className="text-blue-500/25 dark:text-blue-400/25"
        width={40}
        height={40}
        strokeDasharray={1}
      />

      {/* Aircraft at varying altitudes */}
      {[
        8,
        18,
        30,
        42,
        56,
        70,
        84,
      ].map((top, index) => (
        <motion.div
          key={top}
          className="pointer-events-none absolute flex items-center gap-3"
          style={{ top: `${top}%` }}
          initial={{ x: "-20%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 16 + index * 2,
            repeat: Infinity,
            ease: "linear",
            delay: index * 1.2,
          }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-sky-500/70 via-sky-400/80 to-transparent" />
          <Plane className="h-4 w-4 text-sky-100 drop-shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
        </motion.div>
      ))}

      {/* Rotating globe hint */}
      <div className="pointer-events-none absolute right-[-15%] top-[18%] h-[520px] w-[520px] rounded-full border border-white/5 opacity-25">
        <motion.div
          className="h-full w-full rounded-full border border-dashed border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Scanline */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,65,85,0.35),transparent_60%),linear-gradient(to_bottom,rgba(15,23,42,0.75),transparent_45%,rgba(15,23,42,1))] [animation:avion-scanline_7s_linear_infinite]" />

      {/* Coordinate tag */}
      <div className="pointer-events-none absolute right-10 top-8 text-right text-[10px] font-mono tracking-[0.18em] text-zinc-500">
        <div>N 40° 44' 54"</div>
        <div>W 73° 59' 08"</div>
      </div>
    </div>
  );
}

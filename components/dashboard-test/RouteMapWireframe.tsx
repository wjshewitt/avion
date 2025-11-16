'use client';

import { motion } from 'framer-motion';

interface RouteMapWireframeProps {
  flightCode: string;
  origin: string;
  destination: string;
  altitude: number;
  speed: number;
  eta: string;
}

export function RouteMapWireframe({
  flightCode,
  origin,
  destination,
  altitude,
  speed,
  eta,
}: RouteMapWireframeProps) {
  return (
    <div
      className="relative bg-[#2a2a2a] border border-zinc-700 rounded-sm overflow-hidden h-full min-h-[400px]"
      style={{
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)',
      }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Flight Path */}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        {/* Path trace */}
        <motion.path
          d="M 50 350 Q 150 180 350 100"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {/* Active path */}
        <motion.path
          d="M 50 350 Q 150 180 350 100"
          fill="none"
          stroke="#F04E30"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Origin marker */}
        <motion.circle
          cx="50"
          cy="350"
          r={6}
          fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
        {/* Destination marker with pulse */}
        <motion.circle
          cx="350"
          cy="100"
          r={4}
          fill="#F04E30"
          animate={{ r: [4, 8, 4], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>

      {/* Flight Info Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-20 right-10 bg-zinc-900/80 backdrop-blur-md p-3 border border-zinc-700 text-[10px] text-white font-mono"
      >
        <div className="text-zinc-400 uppercase tracking-widest mb-1">Active</div>
        <div className="text-sm mb-2">{flightCode}</div>
        <div className="text-[#F04E30] tabular-nums">FL{Math.floor(altitude / 100)}</div>
        <div className="tabular-nums">{speed} KTS</div>
      </motion.div>

      {/* Bottom Overlay Info */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-zinc-900/90 to-transparent p-6 text-white">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">
              Origin
            </div>
            <div className="text-sm font-medium">{origin}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">
              ETA
            </div>
            <div className="text-lg font-mono tabular-nums">
              {eta} <span className="text-xs">z</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">
              Destination
            </div>
            <div className="text-sm font-medium">{destination}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

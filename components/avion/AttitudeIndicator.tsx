"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AttitudeIndicatorProps {
  pitch: number; // -30 to 30 degrees
  roll: number; // -45 to 45 degrees
  className?: string;
}

export default function AttitudeIndicator({ pitch, roll, className }: AttitudeIndicatorProps) {
  return (
    <div className={cn("relative w-full max-w-[200px] mx-auto", className)}>
      <svg viewBox="0 0 200 200" className="w-full h-auto">
        {/* Outer ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#333" strokeWidth="2" />

        {/* Sky (blue) */}
        <motion.clipPath id="skyClip">
          <rect x="0" y="0" width="200" height="100" />
        </motion.clipPath>

        <motion.g
          animate={{ rotate: roll }}
          style={{ transformOrigin: "100px 100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        >
          {/* Sky background */}
          <motion.rect
            x="10"
            y="10"
            width="180"
            height="90"
            fill="#1e3a8a"
            clipPath="url(#skyClip)"
            animate={{ y: 100 - pitch * 3 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          />

          {/* Ground (brown) */}
          <motion.rect
            x="10"
            y="100"
            width="180"
            height="90"
            fill="#92400e"
            animate={{ y: 100 - pitch * 3 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          />

          {/* Horizon line */}
          <motion.line
            x1="10"
            y1="100"
            x2="190"
            y2="100"
            stroke="#E5E5E5"
            strokeWidth="2"
            animate={{ y: 100 - pitch * 3 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          />

          {/* Pitch reference lines */}
          {[...Array(5)].map((_, i) => {
            const y = 100 + (i - 2) * 20;
            const isAbove = y < 100;
            return (
              <g key={i}>
                <motion.line
                  x1="50"
                  y1={y}
                  x2="80"
                  y2={y}
                  stroke="#E5E5E5"
                  strokeWidth="1"
                  animate={{ y: y - pitch * 3 }}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                />
                <motion.line
                  x1="120"
                  y1={y}
                  x2="150"
                  y2={y}
                  stroke="#E5E5E5"
                  strokeWidth="1"
                  animate={{ y: y - pitch * 3 }}
                  transition={{ type: "spring", stiffness: 100, damping: 10 }}
                />
                {i === 2 && (
                  <>
                    <motion.line
                      x1="30"
                      y1={y}
                      x2="40"
                      y2={y}
                      stroke="#E5E5E5"
                      strokeWidth="2"
                      animate={{ y: y - pitch * 3 }}
                      transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    />
                    <motion.line
                      x1="160"
                      y1={y}
                      x2="170"
                      y2={y}
                      stroke="#E5E5E5"
                      strokeWidth="2"
                      animate={{ y: y - pitch * 3 }}
                      transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    />
                  </>
                )}
              </g>
            );
          })}
        </motion.g>

        {/* Aircraft symbol (fixed) */}
        <g>
          {/* Wings */}
          <line x1="40" y1="100" x2="160" y2="100" stroke="#F04E30" strokeWidth="3" />
          {/* Center dot */}
          <circle cx="100" cy="100" r="3" fill="#F04E30" />
          {/* Vertical reference */}
          <line x1="100" y1="70" x2="100" y2="85" stroke="#F04E30" strokeWidth="2" />
        </g>

        {/* Roll scale marks */}
        {[...Array(9)].map((_, i) => {
          const angle = (i - 4) * 10;
          const radian = (angle * Math.PI) / 180;
          const x1 = 100 + 85 * Math.sin(radian);
          const y1 = 100 - 85 * Math.cos(radian);
          const x2 = 100 + 75 * Math.sin(radian);
          const y2 = 100 - 75 * Math.cos(radian);

          if (i === 4) return null; // Skip 0 mark

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#A1A1AA"
                strokeWidth="1"
              />
              {Math.abs(angle) % 30 === 0 && (
                <text
                  x={100 + 65 * Math.sin(radian)}
                  y={100 - 65 * Math.cos(radian) + 3}
                  textAnchor="middle"
                  className="fill-[#A1A1AA] text-[8px] font-mono"
                >
                  {Math.abs(angle)}
                </text>
              )}
            </g>
          );
        })}

        {/* Top triangle reference */}
        <polygon
          points="100,10 95,20 105,20"
          fill="#F04E30"
        />
      </svg>

      {/* Readouts */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="text-center">
          <p className="text-[#A1A1AA] uppercase tracking-widest">Pitch</p>
          <p className="text-white text-lg tabular-nums">{pitch > 0 ? '+' : ''}{pitch}°</p>
        </div>
        <div className="text-center">
          <p className="text-[#A1A1AA] uppercase tracking-widest">Roll</p>
          <p className="text-white text-lg tabular-nums">{roll > 0 ? '+' : ''}{roll}°</p>
        </div>
      </div>
    </div>
  );
}
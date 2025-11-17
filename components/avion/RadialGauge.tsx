"use client";

import { motion } from 'framer-motion';

/**
 * @param {number} value - The value to display (0-100).
 * @param {string} label - A small label for the bottom.
 * @param {string} unit - A unit for the value (e.g., '%', 'PSI').
 */
export const RadialGauge = ({ value = 75, label = 'Risk', unit = '%', color = '#F04E30' }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#222224"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Value Track */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-mono font-bold text-white">
          {Math.round(value)}
          <span className="text-base text-[#999]">{unit}</span>
        </span>
        <span className="text-xs font-mono uppercase text-[#999]">{label}</span>
      </div>
    </div>
  );
};

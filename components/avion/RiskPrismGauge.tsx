"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskPrismGaugeProps {
  value: number; // 0-90 degrees
  className?: string;
}

export default function RiskPrismGauge({ value, className }: RiskPrismGaugeProps) {
  const getRiskLevel = (val: number) => {
    if (val < 30) return { level: 'LOW', color: 'text-emerald-500', arcColor: '#10b981' };
    if (val < 60) return { level: 'MODERATE', color: 'text-blue-500', arcColor: '#2563EB' };
    return { level: 'HIGH', color: 'text-[#F04E30]', arcColor: '#F04E30' };
  };

  const risk = getRiskLevel(value);
  const angle = (value / 90) * 180 - 90; // Convert to -90 to 90 degrees
  const radius = 80;
  const strokeWidth = 12;

  // Calculate arc path
  const startAngle = -90;
  const endAngle = angle;
  const x1 = 100 + radius * Math.cos((startAngle * Math.PI) / 180);
  const y1 = 100 + radius * Math.sin((startAngle * Math.PI) / 180);
  const x2 = 100 + radius * Math.cos((endAngle * Math.PI) / 180);
  const y2 = 100 + radius * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

  return (
    <div className={cn("relative w-full max-w-[200px] mx-auto", className)}>
      <svg viewBox="0 0 200 160" className="w-full h-auto">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={risk.arcColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Center circle */}
        <circle cx="100" cy="100" r="6" fill="#E5E5E5" />

        {/* Pointer */}
        <motion.g
          animate={{ rotate: value * 2 - 90 }}
          style={{ transformOrigin: "100px 100px" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#E5E5E5"
            strokeWidth="2"
          />
          <polygon
            points="100,25 95,35 105,35"
            fill="#E5E5E5"
          />
        </motion.g>

        {/* Value text */}
        <text
          x="100"
          y="140"
          textAnchor="middle"
          className="fill-white text-2xl font-mono tabular-nums"
        >
          {value}°
        </text>
      </svg>

      {/* Risk factors */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">GEOPOLITICAL</span>
          <span className="text-sm font-mono text-emerald-500">LOW</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">WEATHER</span>
          <span className={cn("text-sm font-mono", risk.color)}>{risk.level}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">FATIGUE</span>
          <span className="text-sm font-mono text-amber-500">MODERATE</span>
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute top-2 right-2 flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className={cn("w-2 h-2 rounded-full", risk.level === 'HIGH' ? 'bg-[#F04E30]' : risk.level === 'MODERATE' ? 'bg-blue-500' : 'bg-emerald-500')} />
        <span className={cn("text-[10px] font-mono uppercase tracking-widest", risk.color)}>
          {risk.level}
        </span>
      </motion.div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface RiskFactor {
  name: string;
  value: number;
  level: 'low' | 'moderate' | 'high';
}

interface RiskPrismWidgetProps {
  overallScore: number;
  factors: RiskFactor[];
}

export function RiskPrismWidget({ overallScore, factors }: RiskPrismWidgetProps) {
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);

  const getOverallLevel = () => {
    if (overallScore < 30) return { label: 'Low', color: 'text-emerald-600' };
    if (overallScore < 70) return { label: 'Moderate', color: 'text-amber-600' };
    return { label: 'High', color: 'text-[#F04E30]' };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-500';
      case 'moderate':
        return 'bg-amber-500';
      case 'high':
        return 'bg-[#F04E30]';
      default:
        return 'bg-zinc-400';
    }
  };

  const overall = getOverallLevel();

  return (
    <div className="bg-[#f4f4f4] dark:bg-[#2a2a2a] border border-zinc-200 dark:border-zinc-700 p-6 rounded-sm h-full flex flex-col" style={{
      boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
            Risk Analysis
          </h3>
          <div className={`text-3xl font-light ${overall.color}`}>{overall.label}</div>
        </div>
        <motion.div
          className={`w-2 h-2 rounded-full ${
            overall.label === 'High'
              ? 'bg-[#F04E30]'
              : overall.label === 'Moderate'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Gauge */}
      <div className="relative flex items-center justify-center py-8 mb-6">
        <svg viewBox="0 0 100 50" className="w-full h-32 overflow-visible">
          {/* Background Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="126"
            initial={{ strokeDashoffset: 126 }}
            animate={{ strokeDashoffset: 126 - (126 * overallScore) / 100 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          {/* Needle */}
          <motion.line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#1a1a1a"
            strokeWidth="2"
            style={{ originX: '50px', originY: '50px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 + (180 * overallScore) / 100 }}
            transition={{ duration: 2, ease: 'circOut' }}
          />
        </svg>
        <div className="absolute bottom-0 text-center">
          <div className="text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter tabular-nums">
            {overallScore}
            <span className="text-sm align-top text-zinc-400">%</span>
          </div>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="space-y-3 flex-1">
        {factors.map((factor, index) => (
          <div
            key={factor.name}
            className="relative"
            onMouseEnter={() => setHoveredFactor(factor.name)}
            onMouseLeave={() => setHoveredFactor(null)}
          >
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
              <span>{factor.name}</span>
              <span className={getLevelColor(factor.level).replace('bg-', 'text-')}>
                {factor.level}
              </span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={getLevelColor(factor.level)}
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                style={{ height: '100%' }}
              />
            </div>
            {/* Tooltip */}
            {hoveredFactor === factor.name && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 top-full mt-1 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow-lg z-10"
              >
                {factor.name}: {factor.value}% ({factor.level})
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

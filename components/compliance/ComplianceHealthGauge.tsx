'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ComplianceHealthScore } from '@/types/compliance';

interface ComplianceHealthGaugeProps {
  score: ComplianceHealthScore;
}

export function ComplianceHealthGauge({ score }: ComplianceHealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score.overall), 100);
    return () => clearTimeout(timer);
  }, [score.overall]);

  const getScoreColor = (value: number) => {
    if (value >= 90) return '#10b981'; // emerald-500
    if (value >= 70) return '#f59e0b'; // amber-500
    return '#F04E30'; // Safety Orange
  };

  const getScoreStatus = (value: number) => {
    if (value >= 90) return 'COMPLIANT';
    if (value >= 70) return 'ATTENTION REQUIRED';
    return 'ACTION NEEDED';
  };

  const color = getScoreColor(score.overall);
  const status = getScoreStatus(score.overall);
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const factors = [
    { label: 'CREW', value: score.crew, max: 25 },
    { label: 'AIRCRAFT', value: score.aircraft, max: 25 },
    { label: 'DOCS', value: score.documentation, max: 25 },
    { label: 'AUTH', value: score.authorization, max: 25 },
  ];

  const getFactorColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return 'text-emerald-500';
    if (percentage >= 70) return 'text-amber-500';
    return 'text-[#F04E30]';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-zinc-200 dark:text-zinc-800"
          />
          {/* Progress arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="font-mono text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(animatedScore)}
          </motion.div>
          <div className="text-xs font-mono text-muted-foreground mt-1">SCORE</div>
        </div>
      </div>

      {/* Status Label */}
      <div
        className="text-sm font-mono font-bold uppercase tracking-wider mb-6"
        style={{ color }}
      >
        {status}
      </div>

      {/* Factor Breakdown */}
      <div className="w-full space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">
          Compliance Factors
        </div>
        {factors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              {factor.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(factor.value / factor.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full"
                  style={{ backgroundColor: getScoreColor((factor.value / factor.max) * 100) }}
                />
              </div>
              <span
                className={`text-xs font-mono font-semibold tabular-nums w-8 text-right ${getFactorColor(
                  factor.value,
                  factor.max
                )}`}
              >
                {factor.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

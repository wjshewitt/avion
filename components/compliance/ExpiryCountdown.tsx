'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ExpiryCountdownProps {
  expiryDate: string | null;
  showCTA?: boolean;
  onRenew?: () => void;
}

export function ExpiryCountdown({ expiryDate, showCTA = false, onRenew }: ExpiryCountdownProps) {
  const countdown = useMemo(() => {
    if (!expiryDate) return null;

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // If less than 7 days, show hours
    if (diffDays < 7) {
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      return {
        value: totalHours,
        unit: 'HRS',
        color: totalHours < 24 ? 'text-[#F04E30]' : 'text-amber-500',
        bgColor: totalHours < 24 ? 'bg-[#F04E30]/10' : 'bg-amber-500/10',
        shouldPulse: totalHours < 24,
      };
    }

    // Otherwise show days
    let color = 'text-zinc-400';
    let bgColor = 'bg-zinc-100 dark:bg-zinc-800';
    let shouldPulse = false;

    if (diffDays < 30) {
      color = 'text-[#F04E30]';
      bgColor = 'bg-[#F04E30]/10';
      shouldPulse = diffDays < 7;
    } else if (diffDays < 90) {
      color = 'text-amber-500';
      bgColor = 'bg-amber-500/10';
    }

    return {
      value: diffDays,
      unit: 'DAYS',
      color,
      bgColor,
      shouldPulse,
    };
  }, [expiryDate]);

  if (!expiryDate || !countdown) {
    return (
      <span className="text-sm font-mono text-muted-foreground">
        No expiry
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={countdown.shouldPulse ? { opacity: [1, 0.5, 1] } : {}}
        transition={countdown.shouldPulse ? { duration: 2, repeat: Infinity } : {}}
        className={`inline-flex items-baseline gap-1 px-3 py-1.5 rounded-sm ${countdown.bgColor}`}
      >
        <span className={`text-xl font-mono font-bold tabular-nums ${countdown.color}`}>
          {countdown.value}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-wider ${countdown.color}`}>
          {countdown.unit}
        </span>
      </motion.div>
      
      {showCTA && countdown.value < 90 && onRenew && (
        <button
          onClick={onRenew}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F04E30] text-white rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors"
        >
          Renew
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

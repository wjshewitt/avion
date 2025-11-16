'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, ChevronRight } from 'lucide-react';

export function FlightOpsHeader() {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-[#f4f4f4] dark:bg-[#2a2a2a] border-b border-zinc-200 dark:border-zinc-700 px-8 py-4" style={{
      boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
    }}>
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Home size={14} className="text-zinc-400" />
          <ChevronRight size={14} className="text-zinc-400" />
          <span className="text-zinc-500 dark:text-zinc-400">Dashboard</span>
          <ChevronRight size={14} className="text-zinc-400" />
          <span className="text-[#F04E30] font-medium">Flight Operations Test</span>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">
            Avion Flight OS
          </p>
        </div>

        {/* Right: Status & Time */}
        <div className="flex items-center gap-6">
          {/* LED Status */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              style={{
                boxShadow: '0 0 6px #10b981'
              }}
              animate={{
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Operational
            </span>
          </div>

          {/* UTC Clock */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              UTC
            </span>
            <span className="text-sm font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
              {mounted && time ? time.toISOString().slice(11, 19) : '--:--:--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

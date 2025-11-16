'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActiveFlightCardProps {
  flight: {
    id: string;
    code: string;
    origin: string;
    destination: string;
    scheduled_at: string;
    status: string;
    weather_alert_level?: string | null;
  };
  index: number;
}

export function ActiveFlightCard({ flight, index }: ActiveFlightCardProps) {
  const router = useRouter();

  const getBadgeColors = (level?: string) => {
    switch (level) {
      case 'red':
        return 'bg-[#F04E30]/10 text-[#F04E30] border-[#F04E30]/20';
      case 'yellow':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'green':
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'On Time') return 'text-emerald-600';
    if (status === 'Delayed') return 'text-amber-600';
    return 'text-[#F04E30]';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
      onClick={() => router.push(`/flights/${flight.id}`)}
      className="group w-full bg-[#f4f4f4] dark:bg-[#2a2a2a] border border-zinc-200 dark:border-zinc-700 p-6 rounded-sm text-left transition-all duration-200 hover:border-[#F04E30] hover:shadow-lg"
      style={{
        boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
      }}
    >
      {/* Label */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3">
        Active Flight
      </div>

      {/* Flight Code */}
      <div className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
        {flight.code}
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {flight.origin}
        </span>
        <ArrowRight size={14} className="text-zinc-400" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {flight.destination}
        </span>
      </div>

      {/* Footer: Time + Status */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
        <div className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
          {new Date(flight.scheduled_at).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        <div className="flex items-center gap-2">
          {flight.weather_alert_level && (
            <span
              className={`text-[10px] px-2 py-1 border font-mono uppercase tracking-widest ${getBadgeColors(
                flight.weather_alert_level
              )}`}
            >
              {flight.weather_alert_level}
            </span>
          )}
          <span className={`text-sm font-semibold ${getStatusColor(flight.status)}`}>
            {flight.status}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

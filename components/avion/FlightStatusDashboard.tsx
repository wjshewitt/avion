"use client";

import { motion } from 'framer-motion';
import { Plane, Clock, Users, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlightStatus {
  id: string;
  flightNumber: string;
  route: string;
  status: 'on-time' | 'delayed' | 'boarding' | 'departed' | 'landed';
  gate?: string;
  departure?: string;
  arrival?: string;
  aircraft?: string;
  passengers?: number;
  delay?: number;
}

interface FlightStatusDashboardProps {
  flights: FlightStatus[];
  className?: string;
}

export default function FlightStatusDashboard({ flights, className }: FlightStatusDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
      case 'delayed': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      case 'boarding': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'departed': return { bg: 'bg-[#F04E30]/10', text: 'text-[#F04E30]', border: 'border-[#F04E30]/20' };
      case 'landed': return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time': return <Clock className="w-3 h-3" />;
      case 'delayed': return <AlertTriangle className="w-3 h-3" />;
      case 'boarding': return <Users className="w-3 h-3" />;
      case 'departed': return <Plane className="w-3 h-3" />;
      case 'landed': return <TrendingUp className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const stats = {
    total: flights.length,
    onTime: flights.filter(f => f.status === 'on-time').length,
    delayed: flights.filter(f => f.status === 'delayed').length,
    departed: flights.filter(f => f.status === 'departed').length,
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <motion.div
          className="bg-[#1A1A1A] rounded-sm p-4 border border-[#333]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, backgroundColor: '#222' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
              Total
            </span>
            <Plane className="w-4 h-4 text-[#71717A]" />
          </div>
          <motion.div
            className="text-2xl font-mono text-white tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.total}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-emerald-500/5 rounded-sm p-4 border border-emerald-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">
              On Time
            </span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <motion.div
            className="text-2xl font-mono text-emerald-500 tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.onTime}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-amber-500/5 rounded-sm p-4 border border-amber-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
              Delayed
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <motion.div
            className="text-2xl font-mono text-amber-500 tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.delayed}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-[#F04E30]/5 rounded-sm p-4 border border-[#F04E30]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(240, 78, 48, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F04E30]">
              Departed
            </span>
            <TrendingUp className="w-4 h-4 text-[#F04E30]" />
          </div>
          <motion.div
            className="text-2xl font-mono text-[#F04E30] tabular-nums"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.departed}
          </motion.div>
        </motion.div>
      </div>

      {/* Flight List */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-4">
          FLIGHT OPERATIONS
        </h3>
        <div className="space-y-2">
          {flights.map((flight, index) => {
            const statusStyle = getStatusColor(flight.status);

            return (
              <motion.div
                key={flight.id}
                className={cn(
                  "bg-[#1A1A1A] rounded-sm border transition-all duration-200 overflow-hidden",
                  statusStyle.border,
                  statusStyle.bg
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
                layout
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-1.5 rounded-xs border",
                        statusStyle.border
                      )}>
                        {getStatusIcon(flight.status)}
                      </div>
                      <div>
                        <h4 className="text-white font-mono text-lg">
                          {flight.flightNumber}
                        </h4>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                          {flight.route}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-xs font-mono uppercase tracking-wider px-2 py-1 rounded-xs",
                        statusStyle.text,
                        statusStyle.bg
                      )}>
                        {flight.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-xs">
                    {flight.gate && (
                      <div>
                        <span className="text-[#71717A] font-mono uppercase tracking-wider">Gate</span>
                        <p className="text-white font-mono mt-1">{flight.gate}</p>
                      </div>
                    )}
                    {flight.departure && (
                      <div>
                        <span className="text-[#71717A] font-mono uppercase tracking-wider">Departs</span>
                        <p className="text-white font-mono mt-1">{flight.departure}</p>
                      </div>
                    )}
                    {flight.arrival && (
                      <div>
                        <span className="text-[#71717A] font-mono uppercase tracking-wider">Arrives</span>
                        <p className="text-white font-mono mt-1">{flight.arrival}</p>
                      </div>
                    )}
                    {flight.aircraft && (
                      <div>
                        <span className="text-[#71717A] font-mono uppercase tracking-wider">Aircraft</span>
                        <p className="text-white font-mono mt-1">{flight.aircraft}</p>
                      </div>
                    )}
                  </div>

                  {flight.delay && (
                    <motion.div
                      className="mt-3 pt-3 border-t border-[#333]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-amber-500 font-mono text-xs">
                        Delay: {flight.delay} minutes
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Animated progress bar for active flights */}
                {(flight.status === 'boarding' || flight.status === 'departed') && (
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-transparent via-[#F04E30] to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ originX: 0 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FuelMonitorProps {
  tanks: {
    left: number;
    center: number;
    right: number;
  };
  total: number;
  endurance: string;
  className?: string;
}

const maxTankCapacity = 10000; // Maximum per tank

export default function FuelMonitor({ tanks, total, endurance, className }: FuelMonitorProps) {
  const getFuelLevel = (amount: number) => {
    const percentage = amount / maxTankCapacity;
    if (percentage < 0.2) return { color: 'bg-[#F04E30]', status: 'CRITICAL' };
    if (percentage < 0.4) return { color: 'bg-amber-500', status: 'RESERVE' };
    return { color: 'bg-blue-500', status: 'NOMINAL' };
  };

  const leftLevel = getFuelLevel(tanks.left);
  const centerLevel = getFuelLevel(tanks.center);
  const rightLevel = getFuelLevel(tanks.right);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Left Tank */}
        <div className="relative">
          <div className="bg-[#1A1A1A] rounded-sm border border-[#333] p-3 h-40 relative overflow-hidden">
            {/* Groove effect */}
            <div className="absolute inset-0 box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3)" />

            {/* Tank fill */}
            <motion.div
              className={cn("absolute bottom-0 left-0 right-0", leftLevel.color)}
              style={{ originY: 'bottom' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: tanks.left / maxTankCapacity }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Level markings */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-[#444]"
                style={{ bottom: `${i * 25}%` }}
              >
                <span className="absolute -left-6 -top-2 text-[8px] font-mono text-[#71717A]">
                  {i * 25}
                </span>
              </div>
            ))}

            {/* Label and value */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
                LEFT
              </p>
              <p className="text-white font-mono text-sm tabular-nums">
                {tanks.left.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Center Tank */}
        <div className="relative">
          <div className="bg-[#1A1A1A] rounded-sm border border-[#333] p-3 h-40 relative overflow-hidden">
            {/* Groove effect */}
            <div className="absolute inset-0 box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3)" />

            {/* Tank fill */}
            <motion.div
              className={cn("absolute bottom-0 left-0 right-0", centerLevel.color)}
              style={{ originY: 'bottom' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: tanks.center / maxTankCapacity }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Level markings */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-[#444]"
                style={{ bottom: `${i * 25}%` }}
              >
                <span className="absolute -left-6 -top-2 text-[8px] font-mono text-[#71717A]">
                  {i * 25}
                </span>
              </div>
            ))}

            {/* Label and value */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
                CENTER
              </p>
              <p className="text-white font-mono text-sm tabular-nums">
                {tanks.center.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Tank */}
        <div className="relative">
          <div className="bg-[#1A1A1A] rounded-sm border border-[#333] p-3 h-40 relative overflow-hidden">
            {/* Groove effect */}
            <div className="absolute inset-0 box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3)" />

            {/* Tank fill */}
            <motion.div
              className={cn("absolute bottom-0 left-0 right-0", rightLevel.color)}
              style={{ originY: 'bottom' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: tanks.right / maxTankCapacity }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Level markings */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-[#444]"
                style={{ bottom: `${i * 25}%` }}
              >
                <span className="absolute -right-6 -top-2 text-[8px] font-mono text-[#71717A]">
                  {i * 25}
                </span>
              </div>
            ))}

            {/* Label and value */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
                RIGHT
              </p>
              <p className="text-white font-mono text-sm tabular-nums">
                {tanks.right.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#333]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
            Total Fuel
          </p>
          <p className="text-2xl font-mono text-white tabular-nums">
            {total.toLocaleString()} <span className="text-sm text-[#A1A1AA]">LBS</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
            Endurance
          </p>
          <p className="text-2xl font-mono text-white tabular-nums">
            {endurance}
          </p>
        </div>
      </div>

      {/* Balance indicator */}
      <div className="mt-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-2">
          Fuel Balance
        </p>
        <div className="relative h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-500"
            animate={{
              left: `${50 + ((tanks.left - tanks.right) / maxTankCapacity) * 50}%`
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#444]" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-mono text-[#71717A]">L</span>
          <span className="text-[8px] font-mono text-[#71717A]">BALANCED</span>
          <span className="text-[8px] font-mono text-[#71717A]">R</span>
        </div>
      </div>
    </div>
  );
}
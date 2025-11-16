"use client";

import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MechanicalSwitchProps {
  label: string;
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  className?: string;
}

export default function MechanicalSwitch({ label, isOn = false, onToggle, className }: MechanicalSwitchProps) {
  const [active, setActive] = useState(isOn);
  const controls = useAnimation();

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);

    // Spring animation
    controls.start({
      rotate: newState ? 25 : -25,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    }).then(() => {
      controls.start({
        rotate: 0,
        transition: { type: "spring", stiffness: 1000, damping: 30 }
      });
    });

    onToggle?.(newState);
  };

  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <label className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] cursor-pointer select-none">
        {label}
      </label>

      <button
        onClick={handleToggle}
        className="relative w-14 h-7 bg-[#1A1A1A] rounded-full border border-[#333] cursor-pointer transition-all duration-200 hover:border-[#444] focus:outline-none focus:ring-2 focus:ring-[#F04E30] focus:ring-offset-2 focus:ring-offset-[#2A2A2A]"
        type="button"
        role="switch"
        aria-checked={active}
      >
        {/* Groove effect for track */}
        <div className="absolute inset-0 rounded-full shadow-inner" />

        {/* Thumb */}
        <motion.div
          className={cn(
            "absolute top-0.5 w-6 h-6 rounded-full transition-colors duration-200",
            active
              ? "bg-[#F04E30] left-[calc(100%-1.75rem-0.25rem)]"
              : "bg-[#444] left-0.5"
          )}
          animate={controls}
          style={{
            boxShadow: active
              ? "0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.2)"
              : "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)"
          }}
        >
          {/* Thumb detail */}
          <div className={cn(
            "absolute inset-0.5 rounded-full",
            active ? "bg-[#F04E30]" : "bg-[#555]"
          )} />
        </motion.div>

        {/* Active glow effect */}
        {active && (
          <motion.div
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle at center, transparent 60%, rgba(240, 78, 48, 0.2) 100%)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </button>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";

interface CornerBracketsProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

const Bracket = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path d="M1 19V1H19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export function CornerBrackets({ children, active = true, className = "" }: CornerBracketsProps) {
  return (
    <div className={`relative p-6 md:p-10 h-full w-full ${className}`}>
      {/* Top-left bracket */}
      <motion.div
        className="absolute top-0 left-0 text-foreground"
        animate={{
          x: active ? 0 : 10,
          y: active ? 0 : 10,
          opacity: active ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      >
        <Bracket />
      </motion.div>

      {/* Top-right bracket */}
      <motion.div
        className="absolute top-0 right-0 rotate-90 text-foreground"
        animate={{
          x: active ? 0 : -10,
          y: active ? 0 : 10,
          opacity: active ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      >
        <Bracket />
      </motion.div>

      {/* Bottom-right bracket */}
      <motion.div
        className="absolute bottom-0 right-0 rotate-180 text-foreground"
        animate={{
          x: active ? 0 : -10,
          y: active ? 0 : -10,
          opacity: active ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      >
        <Bracket />
      </motion.div>

      {/* Bottom-left bracket */}
      <motion.div
        className="absolute bottom-0 left-0 -rotate-90 text-foreground"
        animate={{
          x: active ? 0 : 10,
          y: active ? 0 : -10,
          opacity: active ? 1 : 0.5,
        }}
        transition={{ duration: 0.3 }}
      >
        <Bracket />
      </motion.div>

      {children}
    </div>
  );
}

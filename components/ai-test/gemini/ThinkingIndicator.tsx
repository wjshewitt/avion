"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThinkingIndicator() {
  const [step, setStep] = useState(0);
  const steps = [
    "Parsing Request",
    "Querying Knowledge Base",
    "Synthesizing Response",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-100 w-fit shadow-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-4 bg-zinc-800 rounded-full"
            animate={{ height: ["4px", "16px", "4px"], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>
      <div className="h-4 w-[1px] bg-zinc-200 mx-1" />
      <AnimatePresence mode="wait">
        <motion.span
          key={step}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          className="text-xs font-mono text-zinc-500 uppercase tracking-wide"
        >
          {steps[step]}...
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

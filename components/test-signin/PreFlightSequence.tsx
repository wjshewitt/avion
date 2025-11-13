"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreFlightSequenceProps {
  onComplete: () => void;
}

export const PreFlightSequence = ({ onComplete }: PreFlightSequenceProps) => {
  const steps = [
    "Initializing Secure Handshake...",
    "Verifying Biometrics...",
    "Syncing Fleet Telemetry...",
    "Risk Analysis Engine: ACTIVE",
    "Uplink Established.",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 500);
    }
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-12">
      <div className="w-full max-w-xs space-y-4">
        <div className="flex justify-between items-end mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#2563eb]">
            Sequence
          </span>
          <span className="text-xs font-mono text-zinc-400">
            {currentStep}/{steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2563eb]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Terminal Text */}
        <div className="h-32 flex flex-col justify-end font-mono text-xs text-zinc-600 space-y-1">
          <AnimatePresence>
            {steps.slice(0, currentStep + 1).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  i === steps.length - 1
                    ? "text-zinc-900 font-bold"
                    : "text-zinc-400"
                }
              >
                {i === steps.length - 1 && (
                  <span className="text-[#2563eb] mr-2">&gt;&gt;&gt;</span>
                )}
                {step}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

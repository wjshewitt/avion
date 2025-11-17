"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface InitializationStepProps {
  onComplete: () => void;
}

const INITIALIZATION_PHASES = [
  { label: "Profile", duration: 1000 },
  { label: "Workspace", duration: 900 },
  { label: "Preferences", duration: 800 },
  { label: "Ready", duration: 1200 },
];

export function InitializationStep({ onComplete }: InitializationStepProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = INITIALIZATION_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
    const startTime = Date.now();
    let phaseIndex = 0;
    let phaseStartTime = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update phase based on elapsed time
      let accumulatedTime = 0;
      for (let i = 0; i < INITIALIZATION_PHASES.length; i++) {
        accumulatedTime += INITIALIZATION_PHASES[i].duration;
        if (elapsed < accumulatedTime) {
          if (phaseIndex !== i) {
            phaseIndex = i;
            setCurrentPhase(i);
          }
          break;
        }
      }

      if (elapsed < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setTimeout(onComplete, 300);
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-10">
      {/* Main circular progress */}
      <div className="relative w-32 h-32">
        {/* Background ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-200 dark:text-zinc-700"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={339.292}
            strokeDashoffset={339.292 - (339.292 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-light text-zinc-900 dark:text-zinc-50 tabular-nums"
          >
            {Math.round(progress)}
            <span className="text-sm text-zinc-400 dark:text-zinc-500">%</span>
          </motion.div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex flex-col items-center gap-3 min-h-[60px]">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
        >
          {INITIALIZATION_PHASES[currentPhase]?.label}
        </motion.div>

        {/* LED-style indicators */}
        <div className="flex gap-2">
          {INITIALIZATION_PHASES.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentPhase
                  ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === currentPhase ? [0.8, 1.1, 1] : 0.8,
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

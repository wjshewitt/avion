'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ThinkingIndicatorProps {
  material?: 'ceramic' | 'tungsten';
}

const steps = ['Parsing...', 'Querying...', 'Synthesizing...'];

export function ThinkingIndicator({ material = 'tungsten' }: ThinkingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const textColor = 'text-text-secondary';
  const barColor = 'bg-blue';

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
        Thinking
      </div>
      
      {/* Animated Bars */}
      <div className="flex items-end gap-2 h-8">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 ${barColor} rounded-sm`}
            animate={{
              height: ['8px', '24px', '8px'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Step Label */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className={`text-xs ${textColor}`}
      >
        {steps[currentStep]}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const steps = ['Parsing...', 'Querying...', 'Synthesizing...'];

export default function ThinkingIndicator() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4 py-8">
      {/* Animated bars */}
      <div className="flex items-end space-x-1 h-12">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 bg-[#71717A] rounded-t-sm"
            style={{
              originY: 'bottom'
            }}
            animate={{
              scaleY: [0.3, 1, 0.3],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Cycling text */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]"
      >
        {steps[currentStep]}
      </motion.div>

      {/* Scanline effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F04E30]/50 to-transparent"
        style={{ top: '50%' }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 1
        }}
      />
    </div>
  );
}
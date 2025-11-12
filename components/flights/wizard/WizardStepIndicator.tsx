'use client';

import { motion } from 'framer-motion';

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function WizardStepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: WizardStepIndicatorProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8">
      {/* Progress text */}
      <div className="text-center mb-4">
        <p className="text-sm text-text-secondary">
          Step {currentStep} of {totalSteps}
        </p>
        <h2 className="text-lg font-semibold text-text-primary mt-1">
          {stepLabels[currentStep - 1]}
        </h2>
      </div>

      {/* Progress dots and lines */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Dot */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? '#2563eb' : '#e2e8f0',
                }}
                transition={{ duration: 0.3 }}
                className="w-3 h-3 rounded-full"
              />

              {/* Line (not after last step) */}
              {stepNumber < totalSteps && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? '#2563eb' : '#e2e8f0',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-0.5 mx-1"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels (desktop only) */}
      <div className="hidden md:flex items-start justify-between mt-3 px-4">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={label}
              className="text-xs text-center"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <span
                className={
                  isActive || isCompleted
                    ? 'text-blue font-semibold'
                    : 'text-text-secondary'
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

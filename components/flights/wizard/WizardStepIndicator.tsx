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
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            FLIGHT SETUP
          </p>
          <h2 className="text-xl font-light tracking-tight text-foreground">
            {stepLabels[currentStep - 1]}
          </h2>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Step {currentStep.toString().padStart(2, '0')} / {totalSteps
            .toString()
            .padStart(2, '0')}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-0.5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex-1 flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                  backgroundColor: isActive
                    ? 'var(--color-orange)'
                    : 'var(--color-border-subtle)',
                }}
                transition={{ duration: 0.3 }}
                className="h-1 rounded-sm flex-1"
              />
            </div>
          );
        })}
      </div>

      <div className="hidden md:flex items-start justify-between mt-1">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={label} className="flex-1 text-left">
              <span
                className={
                  isActive || isCompleted
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
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

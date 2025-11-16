'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between">
      {!isFirstStep ? (
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`inline-flex items-center justify-center px-6 py-2.5 rounded-sm text-[11px] font-mono uppercase tracking-[0.18em] bg-[#F04E30] text-white hover:bg-[#F04E30]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors ${
            isSubmitting ? 'opacity-60 cursor-wait' : ''
          }`}
        >
          {isSubmitting ? 'Creating Flight…' : 'Create Flight'}
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-sm text-[11px] font-mono uppercase tracking-[0.18em] bg-[#F04E30] text-white hover:bg-[#F04E30]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors ${
            isNextDisabled || isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

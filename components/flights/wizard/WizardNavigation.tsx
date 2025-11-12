'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import GradientButton from '@/components/kokonutui/gradient-button';

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
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      {/* Back button */}
      {!isFirstStep ? (
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-text-primary border border-border hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      ) : (
        <div />
      )}

      {/* Next/Submit button */}
      {isLastStep ? (
        <GradientButton
          onClick={onSubmit}
          disabled={isSubmitting}
          size="md"
        >
          {isSubmitting ? 'Creating Flight...' : 'Create Flight'}
        </GradientButton>
      ) : (
        <button
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

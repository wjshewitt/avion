'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { flightCreationSchema, flightStepFieldMap, type FlightFormValues } from '@/lib/validation/flight';
import { useCreateFlight } from '@/lib/tanstack/hooks/useFlightMutations';
import WizardStepIndicator from './WizardStepIndicator';
import WizardNavigation from './WizardNavigation';
import StepFlightCode from './StepFlightCode';
import StepRoute from './StepRoute';
import StepSchedule from './StepSchedule';
import StepAircraft from './StepAircraft';
import StepCrew from './StepCrew';
import StepReview from './StepReview';

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Flight Info', 'Route', 'Schedule', 'Aircraft', 'Crew', 'Review'];

const defaultValues: FlightFormValues = {
  flightCode: '',
  status: 'On Time',
  origin: null,
  destination: null,
  scheduledAt: '',
  arrivalAt: '',
  operator: '',
  tailNumber: '',
  aircraft: '',
  passengerCount: null,
  crewCount: null,
  notes: '',
  passengers: [],
};

export default function FlightCreationWizard() {
  const router = useRouter();
  const createFlightMutation = useCreateFlight();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<FlightFormValues>({
    resolver: zodResolver(flightCreationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { trigger, handleSubmit, control } = methods;

  const flightCode = useWatch({ control, name: 'flightCode' }) || '';
  const origin = useWatch({ control, name: 'origin' });
  const destination = useWatch({ control, name: 'destination' });
  const scheduledAt = useWatch({ control, name: 'scheduledAt' });

  const handleNext = async () => {
    if (currentStep >= TOTAL_STEPS) return;

    const fields = flightStepFieldMap[currentStep] ?? [];
    const isValid = fields.length ? await trigger(fields, { shouldFocus: true }) : true;

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('code', values.flightCode);
      submitData.append('status', values.status);
      submitData.append('origin', values.origin?.icao || values.origin?.iata || '');
      submitData.append('destination', values.destination?.icao || values.destination?.iata || '');
      submitData.append('scheduled_at', values.scheduledAt);

      if (values.arrivalAt) {
        submitData.append('arrival_at', values.arrivalAt);
      }
      if (values.operator) {
        submitData.append('operator', values.operator);
      }
      if (values.tailNumber) {
        submitData.append('tail_number', values.tailNumber);
      }
      if (values.aircraft) {
        submitData.append('aircraft', values.aircraft);
      }
      if (values.passengerCount !== null) {
        submitData.append('passenger_count', values.passengerCount.toString());
      }
      if (values.crewCount !== null) {
        submitData.append('crew_count', values.crewCount.toString());
      }
      if (values.notes) {
        submitData.append('notes', values.notes);
      }

      const result = await createFlightMutation.mutateAsync(submitData);

      if (result.success && result.data) {
        toast.success('Flight created successfully!');
        router.push(`/flights/${result.data.id}`);
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to create flight';
        toast.error(errorMsg);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Flight creation error:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  });

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return flightCode.trim().length >= 3;
      case 2:
        return Boolean(origin) && Boolean(destination);
      case 3:
        return Boolean(scheduledAt);
      default:
        return true;
    }
  }, [currentStep, destination, flightCode, origin, scheduledAt]);

  return (
    <FormProvider {...methods}>
      <div className="w-full h-full">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <WizardStepIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={STEP_LABELS}
            />
          </div>

          <div className="bg-card border border-border rounded-sm p-6 md:p-8 h-full flex flex-col gap-6">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {currentStep === 1 && <StepFlightCode key="step1" />}

                {currentStep === 2 && <StepRoute key="step2" />}

                {currentStep === 3 && <StepSchedule key="step3" />}

                {currentStep === 4 && <StepAircraft key="step4" />}

                {currentStep === 5 && <StepCrew key="step5" />}

                {currentStep === 6 && <StepReview key="step6" onEdit={handleEdit} />}
              </AnimatePresence>
            </div>

            <div className="pt-6 border-t border-border mt-2">
              <WizardNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={onSubmit}
                isNextDisabled={!isCurrentStepValid}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

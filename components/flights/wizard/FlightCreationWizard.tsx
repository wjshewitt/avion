'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateFlight } from '@/lib/tanstack/hooks/useFlightMutations';
import WizardStepIndicator from './WizardStepIndicator';
import WizardNavigation from './WizardNavigation';
import StepFlightCode from './StepFlightCode';
import StepRoute from './StepRoute';
import StepSchedule from './StepSchedule';
import StepAircraftCrew from './StepAircraftCrew';
import StepReview from './StepReview';

interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
}

interface FlightFormData {
  flightCode: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  origin: Airport | null;
  destination: Airport | null;
  scheduledAt: string;
  arrivalAt: string;
  operator: string;
  aircraft: string;
  passengerCount: number | null;
  crewCount: number | null;
  notes: string;
}

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Flight Info', 'Route', 'Schedule', 'Aircraft & Crew', 'Review'];

export default function FlightCreationWizard() {
  const router = useRouter();
  const createFlightMutation = useCreateFlight();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FlightFormData>({
    flightCode: '',
    status: 'On Time',
    origin: null,
    destination: null,
    scheduledAt: '',
    arrivalAt: '',
    operator: '',
    aircraft: '',
    passengerCount: null,
    crewCount: null,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.flightCode.trim()) {
      newErrors.flightCode = 'Flight code is required';
    } else if (formData.flightCode.length < 3) {
      newErrors.flightCode = 'Flight code must be at least 3 characters';
    } else if (formData.flightCode.length > 10) {
      newErrors.flightCode = 'Flight code must be at most 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin) {
      newErrors.origin = 'Origin airport is required';
    }
    if (!formData.destination) {
      newErrors.destination = 'Destination airport is required';
    }
    if (formData.origin && formData.destination && formData.origin.icao === formData.destination.icao) {
      newErrors.destination = 'Origin and destination must be different';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Departure time is required';
    }

    if (formData.scheduledAt && formData.arrivalAt) {
      const departure = new Date(formData.scheduledAt);
      const arrival = new Date(formData.arrivalAt);
      if (arrival <= departure) {
        newErrors.arrivalAt = 'Arrival must be after departure';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    // Step 4 is optional, always valid
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create FormData object for the mutation
      const submitData = new FormData();
      submitData.append('code', formData.flightCode);
      submitData.append('status', formData.status);
      submitData.append('origin', formData.origin?.icao || formData.origin?.iata || '');
      submitData.append('destination', formData.destination?.icao || formData.destination?.iata || '');
      submitData.append('scheduled_at', formData.scheduledAt);
      
      if (formData.arrivalAt) {
        submitData.append('arrival_at', formData.arrivalAt);
      }
      if (formData.operator) {
        submitData.append('operator', formData.operator);
      }
      if (formData.aircraft) {
        submitData.append('aircraft', formData.aircraft);
      }
      if (formData.passengerCount !== null) {
        submitData.append('passenger_count', formData.passengerCount.toString());
      }
      if (formData.crewCount !== null) {
        submitData.append('crew_count', formData.crewCount.toString());
      }
      if (formData.notes) {
        submitData.append('notes', formData.notes);
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
  };

  // Check if current step is valid for navigation button state
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.flightCode.trim().length >= 3;
      case 2:
        return !!formData.origin && !!formData.destination;
      case 3:
        // Check that scheduledAt is a valid ISO string
        if (!formData.scheduledAt) {
          console.log('No scheduledAt:', formData.scheduledAt);
          return false;
        }
        try {
          const date = new Date(formData.scheduledAt);
          const isValid = !isNaN(date.getTime());
          console.log('Step 3 validation:', { scheduledAt: formData.scheduledAt, isValid });
          return isValid;
        } catch (e) {
          console.log('Date parse error:', e);
          return false;
        }
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Step Indicator */}
        <WizardStepIndicator
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepLabels={STEP_LABELS}
        />

        {/* Step Content */}
        <div className="bg-white border border-border p-6 min-h-[450px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepFlightCode
                key="step1"
                flightCode={formData.flightCode}
                status={formData.status}
                onFlightCodeChange={(code) =>
                  setFormData({ ...formData, flightCode: code })
                }
                onStatusChange={(status) =>
                  setFormData({ ...formData, status })
                }
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <StepRoute
                key="step2"
                origin={formData.origin}
                destination={formData.destination}
                onOriginChange={(origin) =>
                  setFormData({ ...formData, origin })
                }
                onDestinationChange={(destination) =>
                  setFormData({ ...formData, destination })
                }
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <StepSchedule
                key="step3"
                scheduledAt={formData.scheduledAt}
                arrivalAt={formData.arrivalAt}
                onScheduledAtChange={(scheduledAt) => {
                  console.log('Wizard setting scheduledAt:', scheduledAt);
                  setFormData({ ...formData, scheduledAt });
                }}
                onArrivalAtChange={(arrivalAt) => {
                  console.log('Wizard setting arrivalAt:', arrivalAt);
                  setFormData({ ...formData, arrivalAt });
                }}
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <StepAircraftCrew
                key="step4"
                operator={formData.operator}
                aircraft={formData.aircraft}
                passengerCount={formData.passengerCount}
                crewCount={formData.crewCount}
                notes={formData.notes}
                onOperatorChange={(operator) =>
                  setFormData({ ...formData, operator })
                }
                onAircraftChange={(aircraft) =>
                  setFormData({ ...formData, aircraft })
                }
                onPassengerCountChange={(passengerCount) =>
                  setFormData({ ...formData, passengerCount })
                }
                onCrewCountChange={(crewCount) =>
                  setFormData({ ...formData, crewCount })
                }
                onNotesChange={(notes) =>
                  setFormData({ ...formData, notes })
                }
              />
            )}

            {currentStep === 5 && (
              <StepReview
                key="step5"
                data={formData}
                onEdit={handleEdit}
              />
            )}
          </AnimatePresence>

          {/* Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isNextDisabled={!isCurrentStepValid()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

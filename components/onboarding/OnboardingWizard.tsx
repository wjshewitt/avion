"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { IdentityStep } from "./IdentityStep";
import { VisualStep } from "./VisualStep";
import { RoleStep } from "./RoleStep";
import { CalibrationStep } from "./CalibrationStep";
import { RiskPreferenceStep } from "./RiskPreferenceStep";
import { InterfaceStep } from "./InterfaceStep";
import { InitializationStep } from "./InitializationStep";
import { MIN_USERNAME_LENGTH, USERNAME_REGEX } from "@/lib/utils/username";
import type { RiskProfile } from "@/lib/weather/risk/types";

interface OnboardingData {
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  riskProfile: RiskProfile;
  timezone: string;
  theme: string;
  hqLocation: string;
  hqTimezoneSameAsMain: boolean;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

const LOCAL_STORAGE_KEY = "avion:onboarding:v1";

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const totalSteps = 7; // Increased for Risk Step

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    username: "",
    avatar: null,
    role: "",
    riskProfile: "standard", // Default
    timezone: "",
    theme: "ceramic",
    hqLocation: "",
    hqTimezoneSameAsMain: true,
  });

  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const persistState = (nextStep: number, nextData: OnboardingData) => {
    if (typeof window === "undefined") return;
    try {
      const payload = JSON.stringify({ step: nextStep, data: nextData });
      window.localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch {
      // Ignore quota / storage errors
    }
  };

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => {
      const merged = { ...prev, ...newData };
      persistState(step, merged);
      return merged;
    });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      const next = step + 1;
      setStep(next);
      persistState(next, data);
    }
  };

  // Load cached wizard progress on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          step?: number;
          data?: Partial<OnboardingData>;
        };

        if (parsed.data) {
          setData((prev) => ({ ...prev, ...parsed.data }));
        }
        if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= totalSteps) {
          setStep(parsed.step);
        }
      }
    } catch {
      // Ignore malformed cache
    }
    setIsHydrated(true);
  }, [totalSteps]);

  const prevStep = () => {
    if (step > 1) {
      const next = step - 1;
      setStep(next);
      persistState(next, data);
    }
  };

  const getStepErrors = (): string[] => {
    const errors: string[] = [];

    if (step === 1) {
      const trimmedName = data.name.trim();
      const hasSurname = trimmedName.split(/\s+/).length >= 2;
      const usernameTrimmed = data.username.trim();

      if (!hasSurname) {
        errors.push("Include at least a first and last name.");
      }
      if (usernameTrimmed.length < MIN_USERNAME_LENGTH) {
        errors.push(`Username must be at least ${MIN_USERNAME_LENGTH} characters.`);
      }
      if (usernameTrimmed !== "" && !USERNAME_REGEX.test(usernameTrimmed)) {
        errors.push("Username can only contain letters, numbers, and underscores.");
      }
    }
    if (step === 2) {
      // Optional step; no blocking errors.
    }
    if (step === 3 && data.role === "") {
      errors.push("Select a primary role.");
    }
    if (step === 4 && data.riskProfile === undefined) {
        // Should have default, but safety check
        errors.push("Select a risk profile.");
    }
    if (step === 5 && data.timezone === "") {
      errors.push("Choose a main operations timezone.");
    }
    if (step === 6 && data.theme === "") {
      errors.push("Choose an interface theme.");
    }
    return errors;
  };

  const isStepValid = () => {
    return getStepErrors().length === 0;
  };

  const handleNext = () => {
    const errors = getStepErrors();
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors([]);
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <IdentityStep
            name={data.name}
            username={data.username}
            updateData={updateData}
          />
        );
      case 2:
        return (
          <VisualStep
            avatar={data.avatar}
            username={data.username}
            name={data.name}
            updateData={updateData}
          />
        );
      case 3:
        return <RoleStep role={data.role} updateData={updateData} />;
      case 4:
        return <RiskPreferenceStep profile={data.riskProfile} updateData={updateData} />;
      case 5:
        return (
          <CalibrationStep
            timezone={data.timezone}
            hqLocation={data.hqLocation}
            hqTimezoneSameAsMain={data.hqTimezoneSameAsMain}
            updateData={updateData}
          />
        );
      case 6:
        return <InterfaceStep theme={data.theme} updateData={updateData} />;
      case 7:
        return (
          <InitializationStep
            onComplete={() => {
              onComplete(data);
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(LOCAL_STORAGE_KEY);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const isCalibrationStep = step === 5;

  return (
    <div 
      className={`w-full px-4 ${isCalibrationStep ? "max-w-4xl" : "max-w-md"} transition-opacity duration-200 ${!isHydrated ? "opacity-0" : "opacity-100"}`}
    >
      {/* Logo Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 flex items-center justify-center font-bold tracking-tighter shadow-md mb-3 transition-colors border border-[var(--accent-primary)]">
          Av
        </div>
        {step < 7 && (
          <div className="text-xs font-mono tracking-widest flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">ONBOARDING</span>
            <span className="h-px w-6 bg-[var(--accent-primary)]" />
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="ceramic-card overflow-hidden relative min-h-[480px] flex flex-col">
        {/* Progress Rail (Top) */}
        {step < 7 && (
          <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 flex">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 relative">
                <motion.div
                  className="absolute inset-0 bg-[var(--accent-primary)]"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: step > i + 1 ? 1 : step === i + 1 ? 1 : 0,
                  }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.4 }}
                />
                {/* Separators */}
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white dark:bg-zinc-700 z-10"></div>
              </div>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          {step < 7 && (
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`text-xs font-medium px-4 py-2 rounded-sm transition-colors ${
                  step === 1
                    ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Back
              </button>

              <div className="flex flex-col items-end">
                <button
                  onClick={handleNext}
                  className={`btn-primary px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                    !isStepValid() ? "opacity-80" : ""
                  }`}
                >
                  <span>{step === 6 ? "Initialize" : "Confirm"}</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>


                <AnimatePresence>
                  {stepErrors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                      className="mt-3 w-full max-w-xs rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/90 px-3 py-2 shadow-sm"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-1">
                        Cannot continue
                      </div>
                      <ul className="space-y-0.5">
                        {stepErrors.map((msg, idx) => (
                          <li
                            key={idx}
                            className="text-[10px] font-mono text-zinc-700 dark:text-zinc-200"
                          >
                            • {msg}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="mt-6 flex justify-between text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        <span>Avion OS v2.4</span>
        <span>Secure Connection</span>
      </div>
    </div>
  );
}

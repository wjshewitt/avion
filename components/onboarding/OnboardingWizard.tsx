"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UsernameStep } from "./UsernameStep";
import { ProfilePictureStep } from "./ProfilePictureStep";
import { PreferencesStep } from "./PreferencesStep";
import { SetupAnimation } from "./SetupAnimation";
import { completeOnboarding } from "@/app/actions/onboarding";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Username", required: true },
  { id: 2, title: "Profile Picture", required: false },
  { id: 3, title: "Preferences", required: false },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup animation state
  const [showSetupAnimation, setShowSetupAnimation] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Form data
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<'pilot' | 'crew' | 'admin' | 'dispatcher'>('pilot');
  const [timezone, setTimezone] = useState('UTC');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const canProceed = () => {
    if (currentStep === 1) return isUsernameValid;
    return true; // Other steps are optional
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSkip = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    setShowSetupAnimation(true);
    setSetupStep(0);
    setIsSetupComplete(false);

    // Artificial delay with step progression for nice animation
    const progressSteps = async () => {
      // Step 1: Creating profile
      await new Promise(resolve => setTimeout(resolve, 800));
      setSetupStep(1);

      // Step 2: Configuring preferences
      await new Promise(resolve => setTimeout(resolve, 800));
      setSetupStep(2);

      // Step 3: Preparing workspace (call API during this step)
      const apiPromise = completeOnboarding({
        username,
        avatar_url: avatarUrl,
        role,
        timezone,
        theme,
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      setSetupStep(3);

      // Wait for API to complete
      const result = await apiPromise;

      // Step 4: Almost done
      await new Promise(resolve => setTimeout(resolve, 600));

      if (result.success) {
        setIsSetupComplete(true);
        
        // Show success state briefly before redirect
        await new Promise(resolve => setTimeout(resolve, 800));
        
        router.push("/flights");
        router.refresh();
      } else {
        setShowSetupAnimation(false);
        setError(result.error);
        setLoading(false);
      }
    };

    try {
      await progressSteps();
    } catch (err) {
      console.error("Onboarding completion error:", err);
      setShowSetupAnimation(false);
      setError("Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <>
      <SetupAnimation 
        isVisible={showSetupAnimation}
        currentStep={setupStep}
        isComplete={isSetupComplete}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-background-main p-4" data-onboarding>
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-all border ${
                      currentStep > step.id
                        ? "bg-primary text-white border-primary"
                        : currentStep === step.id
                        ? "bg-primary text-white border-primary"
                        : "bg-transparent text-text-muted border-border-subtle"
                    }`}
                  >
                    {currentStep > step.id ? (
                      "✓"
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium tracking-wide uppercase ${
                    currentStep === step.id ? "text-text-primary" : "text-text-muted"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-16 h-px mx-4 bg-border-subtle relative top-[-12px]">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: currentStep > step.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-border-subtle p-12 space-y-8">
          {error && (
            <div className="bg-critical/5 p-4 border-l-4 border-critical">
              <p className="text-sm text-critical font-medium">{error}</p>
            </div>
          )}

          {/* Step Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <UsernameStep
                  value={username}
                  onChange={setUsername}
                  onValidChange={setIsUsernameValid}
                />
              )}
              {currentStep === 2 && (
                <ProfilePictureStep value={avatarUrl} onChange={setAvatarUrl} />
              )}
              {currentStep === 3 && (
                <PreferencesStep
                  role={role}
                  timezone={timezone}
                  theme={theme}
                  onRoleChange={setRole}
                  onTimezoneChange={setTimezone}
                  onThemeChange={setTheme}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-border-subtle">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="font-medium tracking-wide uppercase text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!STEPS[currentStep - 1].required && currentStep < STEPS.length && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={loading}
                  className="font-medium tracking-wide uppercase text-xs"
                >
                  Skip
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="font-medium tracking-wide uppercase text-xs px-8"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-green hover:bg-green/90 font-medium tracking-wide uppercase text-xs px-8"
                >
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-text-muted">
            Step {currentStep} of {STEPS.length}
            {!STEPS[currentStep - 1].required && " • Optional"}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

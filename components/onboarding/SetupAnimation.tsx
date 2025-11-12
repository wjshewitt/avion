"use client";

import { motion, AnimatePresence } from "framer-motion";
import LoadingProgress from "@/components/kokonutui/loading-progress";
import { CheckCircle2 } from "lucide-react";

const SETUP_STEPS = [
  { label: "Creating your profile", description: "Setting up your account details" },
  { label: "Configuring preferences", description: "Applying your settings" },
  { label: "Preparing your workspace", description: "Getting everything ready" },
  { label: "Almost done!", description: "Finishing up" },
];

interface SetupAnimationProps {
  isVisible: boolean;
  currentStep: number;
  isComplete: boolean;
}

export function SetupAnimation({ isVisible, currentStep, isComplete }: SetupAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="bg-card border border-border-subtle p-12 max-w-lg w-full mx-4 shadow-2xl"
          >
            {!isComplete ? (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2 text-center">
                  Setting up your account
                </h2>
                <p className="text-sm text-text-muted text-center mb-8">
                  This will only take a moment...
                </p>
                
                <LoadingProgress steps={SETUP_STEPS} currentStep={currentStep} />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green/10 rounded-full mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  All set!
                </h2>
                <p className="text-sm text-text-muted">
                  Redirecting you to your dashboard...
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

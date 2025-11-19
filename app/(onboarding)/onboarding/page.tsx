"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ThemeToggleCompact } from "@/components/theme-toggle";

interface OnboardingData {
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  timezone: string;
  theme: string;
  hqLocation: string;
  hqTimezoneSameAsMain: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (data: OnboardingData) => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save onboarding data");
      }

      // Apply theme preference
      if (data.theme === "tungsten") {
        setTheme("dark");
      } else {
        setTheme("light");
      }

      // Redirect to main app
      router.push("/flights");
      router.refresh();
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4] dark:bg-[#1A1A1A] overflow-hidden transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggleCompact />
      </div>

      {/* Radial dot grid background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Light mode dots */}
        <div
          className="absolute inset-0 opacity-50 dark:opacity-0 transition-opacity duration-300"
          style={{
            backgroundImage: "radial-gradient(#737373 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Dark mode dots */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-20 transition-opacity duration-300"
          style={{
            backgroundImage: "radial-gradient(#525252 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10">
        {error && (
          <div className="mb-4 mx-auto max-w-md px-4">
            <div className="border-l-4 border-red-600 bg-red-50 dark:bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}
        <OnboardingWizard onComplete={handleComplete} />
      </div>
    </div>
  );
}

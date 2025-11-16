"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { SecureAccessLayout } from "@/components/auth/SecureAccessLayout";
import { login, type AuthResult } from "@/app/actions/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";

type AuthPhase = "input" | "loading" | "success";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const redirectTo = searchParams.get("redirect") || "/flights";

  const [phase, setPhase] = useState<AuthPhase>("input");
  const [error, setError] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<AuthResult | null>(null);
  const [sequenceDone, setSequenceDone] = useState(false);

  const isLoading = phase === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!pendingResult || !sequenceDone) return;

    if (pendingResult.success) {
      setPhase("success");

      const timeout = setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
        setPendingResult(null);
        setSequenceDone(false);
      }, 700);

      return () => clearTimeout(timeout);
    } else {
      setPhase("input");
      setError(pendingResult.error);
      setPendingResult(null);
      setSequenceDone(false);
    }
  }, [pendingResult, sequenceDone, redirectTo, router]);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    setPhase("loading");
    setPendingResult(null);
    setSequenceDone(false);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await login(formData);
      setPendingResult(result);
    } catch (err) {
      console.error("Login error:", err);
      setPendingResult({ success: false, error: "An unexpected error occurred" });
    }
  });

  return (
    <SecureAccessLayout>
      {phase === "input" && (
        <motion.div
          key="login-input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-[#050712] text-sm font-semibold tracking-tight text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900">
              Av
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Avion
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-100">Sign in</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign in to Avion
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Access your flights, weather tools, and briefing workspace.
            </p>
          </div>
          {/* Glass panel with form (matches landing-style morphism) */}
          <div className="glass-panel rounded-sm px-5 py-4 space-y-4">
            {/* Message from redirect / errors */}
            {(message || error) && (
              <div className="space-y-2">
                {message && !error && (
                  <div className="border-l-4 border-blue-600 bg-blue-600/10 p-3 text-xs text-zinc-900 dark:text-zinc-50">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="border-l-4 border-red-600 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/80 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:bg-zinc-800 dark:shadow-[inset_0_0_0_rgba(0,0,0,0.4)]">
                  <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    placeholder="ops@avion.ai"
                    className="w-full border-none bg-transparent text-sm font-mono text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center">
                  <label className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                  >
                    Reset?
                  </Link>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:bg-zinc-800 dark:shadow-[inset_0_0_0_rgba(0,0,0,0.4)]">
                  <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    {...register("password")}
                    placeholder="••••••••"
                    className="w-full border-none bg-transparent text-sm font-mono text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#F04E30] px-4 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#d33f24] disabled:cursor-not-allowed disabled:opacity-80"
              >
                <span>{isLoading ? "Signing in" : "Sign in"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>New to Avion?</span>
              <Link href="/signup" className="font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
                Create account
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <PreFlightSequence
          key="login-loading"
          onComplete={() => setSequenceDone(true)}
        />
      )}

      {phase === "success" && (
        <motion.div
          key="login-success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.45)]">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Signed in</h2>
          <p className="text-sm text-zinc-500">
            Redirecting to your flights…
          </p>
        </motion.div>
      )}
    </SecureAccessLayout>
  );
}

function PreFlightSequence({ onComplete }: { onComplete: () => void }) {
  const steps = [
    "Checking credentials",
    "Securing connection",
    "Preparing your workspace",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timeout = setTimeout(() => {
        setCurrentStep((value) => value + 1);
      }, 600);
      return () => clearTimeout(timeout);
    }

    const doneTimeout = setTimeout(onComplete, 400);
    return () => clearTimeout(doneTimeout);
  }, [currentStep, steps.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xs"
    >
      <div className="mb-6 flex items-end justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F04E30]">
          Signing in
        </span>
        <span className="font-mono text-[10px] text-zinc-500">
          {currentStep}/{steps.length}
        </span>
      </div>

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className="h-full bg-[#F04E30]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex h-24 flex-col justify-end font-mono text-xs text-zinc-600">
        {steps.slice(0, currentStep + 1).map((step, index) => (
          <div
            key={step}
            className={
              index === currentStep
                ? "text-zinc-900"
                : "text-zinc-400"
            }
          >
            {step}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050712] text-zinc-200">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

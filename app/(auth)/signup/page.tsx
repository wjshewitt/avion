"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { SecureAccessLayout } from "@/components/auth/SecureAccessLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validation/auth";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await signup(formData);

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setShowConfirmation(true);
        } else {
          // Redirect to onboarding for new users
          router.push("/onboarding");
          router.refresh();
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <SecureAccessLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-8"
      >
        {/* Logo / heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-[#050712] text-sm font-semibold tracking-tight text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900">
            Av
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Avion
            </span>
            <span className="text-sm text-zinc-700 dark:text-zinc-100">Create account</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create your Avion account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign up to manage flights, weather briefings, and tools.
          </p>
        </div>
        <div className="glass-panel rounded-sm px-5 py-4 space-y-4">
          {/* Email confirmation message */}
          {showConfirmation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.9)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Email confirmation
                </span>
              </div>
              <div className="border-l-4 border-blue-600 bg-blue-600/10 p-3 text-sm text-zinc-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-zinc-100">
                <p className="font-medium mb-1">Check your inbox</p>
                <p>
                  We sent a confirmation link to <span className="font-semibold">{email}</span>. Click the link to activate your
                  account, then sign in.
                </p>
              </div>
              <Link href="/login" className="block pt-1">
                <button className="mt-1 flex w-full items-center justify-center rounded-sm bg-[#050712] px-4 py-2.5 text-xs font-medium tracking-[0.18em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:bg-black dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Go to sign in
                </button>
              </Link>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/80 dark:bg-red-500/10 dark:text-red-300">
              <p>{error}</p>
              {error.includes("already exists") && (
                <Link
                  href="/login"
                  className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Go to sign in →
                </Link>
              )}
            </div>
          )}

          {!showConfirmation && (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:bg-zinc-800 dark:shadow-[inset_0_0_0_rgba(0,0,0,0.4)]">
                  <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="ops@avion.ai"
                    {...register("email")}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="w-full border-none bg-transparent text-sm font-mono text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:bg-zinc-800 dark:shadow-[inset_0_0_0_rgba(0,0,0,0.4)]">
                  <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full border-none bg-transparent text-sm font-mono text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Confirm password
                </label>
                <div className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:bg-zinc-800 dark:shadow-[inset_0_0_0_rgba(0,0,0,0.4)]">
                  <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full border-none bg-transparent text-sm font-mono text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#F04E30] px-4 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_6px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#d33f24] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? "Creating account…" : "Sign up"}
              </button>
            </form>
          )}

          {!showConfirmation && (
            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Already have an account?</span>
              <Link href="/login" className="font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </SecureAccessLayout>
  );
}

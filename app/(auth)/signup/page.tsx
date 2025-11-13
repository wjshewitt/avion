"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// Bracket SVG component
const Bracket = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path d="M1 19V1H19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Corner Brackets component
const CornerBrackets = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => (
  <div className="relative p-6 md:p-10 h-full w-full">
    <motion.div
      className="absolute top-0 left-0 text-zinc-900"
      animate={{
        x: active ? 0 : 10,
        y: active ? 0 : 10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute top-0 right-0 rotate-90 text-zinc-900"
      animate={{
        x: active ? 0 : -10,
        y: active ? 0 : 10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute bottom-0 right-0 rotate-180 text-zinc-900"
      animate={{
        x: active ? 0 : -10,
        y: active ? 0 : -10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    <motion.div
      className="absolute bottom-0 left-0 -rotate-90 text-zinc-900"
      animate={{
        x: active ? 0 : 10,
        y: active ? 0 : -10,
        opacity: active ? 1 : 0.5,
      }}
    >
      <Bracket />
    </motion.div>

    {children}
  </div>
);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
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
          router.push("/flights");
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
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap");

        body {
          font-family: "Inter", sans-serif;
        }

        /* Technical Grid */
        .tech-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
        }

        /* Inset "Screen" look */
        .glass-panel {
          background: rgba(245, 245, 245, 0.8);
          backdrop-filter: blur(12px);
          box-shadow:
            inset 0 0 20px rgba(255, 255, 255, 0.8),
            0 10px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-[#e8e8e8] p-4 relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-50"></div>

        <div className="w-full max-w-md relative z-10">
          <CornerBrackets active={true}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Logo/Brand */}
              <Link href="/" className="flex items-center gap-4 self-center group">
                <div className="w-3 h-3 bg-blue-600 animate-pulse"></div>
                <span className="font-bold tracking-tighter text-2xl text-zinc-900 group-hover:text-blue-600 transition-colors">
                  AVION
                </span>
              </Link>

              {/* Tagline */}
              <div className="text-center">
                <div className="h-[1px] w-32 bg-blue-600 mb-4 mx-auto"></div>
                <p className="text-sm text-zinc-500 font-light uppercase tracking-widest">
                  Create Account
                </p>
              </div>

              <div className="glass-panel p-8 space-y-6">
                {/* Email Confirmation Message */}
                {showConfirmation && (
                  <div className="p-4 border-l-4 border-blue-600 bg-blue-600/10">
                    <p className="text-sm text-zinc-900 font-semibold mb-2">Check your email</p>
                    <p className="text-sm text-zinc-600">
                      We sent a confirmation link to <span className="font-medium text-zinc-900">{email}</span>. 
                      Click the link in the email to activate your account, then return here to sign in.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 border-l-4 border-red-600 bg-red-600/10">
                    <p className="text-sm text-red-600">{error}</p>
                    {error.includes("already exists") && (
                      <Link 
                        href="/login" 
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block font-medium"
                      >
                        Go to Sign In →
                      </Link>
                    )}
                  </div>
                )}

                {/* Signup Form */}
                {!showConfirmation && <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-900 text-xs uppercase tracking-widest font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ops@avion.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                      className="bg-white/50 border-zinc-300 focus:border-blue-600 text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-900 text-xs uppercase tracking-widest font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white/50 border-zinc-300 focus:border-blue-600 text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-zinc-900 text-xs uppercase tracking-widest font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      className="bg-white/50 border-zinc-300 focus:border-blue-600 text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-widest text-xs transition-colors border border-zinc-700"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>}

                {/* Sign in link for confirmed users */}
                {showConfirmation && (
                  <Link href="/login">
                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-widest text-xs transition-colors border border-zinc-700" size="lg">
                      Go to Sign In
                    </Button>
                  </Link>
                )}

                {/* Footer */}
                {!showConfirmation && <div className="text-center text-xs text-zinc-500 font-mono">
                  <p>
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-zinc-900 hover:text-blue-600 transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>}
              </div>
            </motion.div>
          </CornerBrackets>
        </div>
      </div>
    </>
  );
}

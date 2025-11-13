"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { CornerBracketsLoader } from "@/components/kokonutui/minimal-loaders";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const redirectTo = searchParams.get("redirect") || "/flights";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await login(formData);

      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Info Message (from redirect) */}
      {message && !error && (
        <div className="p-4 border-l-4 border-blue-600 bg-blue-600/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-zinc-900">{message}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border-l-4 border-red-600 bg-red-600/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
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

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-zinc-900 text-xs uppercase tracking-widest font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="ml-auto text-xs text-zinc-500 hover:text-blue-600 transition-colors font-mono"
              >
                Reset?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="bg-white/50 border-zinc-300 focus:border-blue-600 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium uppercase tracking-widest text-xs transition-colors border border-zinc-700"
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <CornerBracketsLoader size="sm" color="text-white" />
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-zinc-500 font-mono">
        No account?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
        >
          Sign Up
        </Link>
      </div>

      {/* Terms and Privacy */}
      <div className="text-balance text-center text-[10px] text-zinc-400 font-mono [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-zinc-600 transition-colors">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="hover:text-zinc-600">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-zinc-600">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plane } from "lucide-react";
import Link from "next/link";

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
        <div className="glass-level-1 p-4 border-l-4 border-primary bg-primary/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-primary">{message}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="glass-level-1 p-4 border-l-4 border-critical bg-critical/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-critical mt-0.5 flex-shrink-0" />
            <p className="text-sm text-critical">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form Card */}
      <div className="glass-level-2 p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-text-primary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ops@flightops.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="bg-background-secondary border-border-subtle focus:border-primary text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-text-primary">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline transition-colors"
                >
                  Forgot your password?
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
                className="bg-background-secondary border-border-subtle focus:border-primary text-text-primary placeholder:text-text-muted"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={loading}
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-text-primary hover:underline transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="text-balance text-center text-xs text-text-muted [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-text-primary transition-colors">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="hover:text-text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
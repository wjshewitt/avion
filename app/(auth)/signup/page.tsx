"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen flex items-center justify-center bg-background-main p-4">
      <div className="w-full max-w-md">
        <div className="glass-level-2 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">
              FlightOps AI
            </h1>
            <p className="text-text-muted">Create an Account</p>
          </div>

          {/* Email Confirmation Message */}
          {showConfirmation && (
            <div className="glass-level-1 p-4 border-l-4 border-blue">
              <p className="text-sm text-text-primary font-semibold mb-2">Check your email</p>
              <p className="text-sm text-text-muted">
                We sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>. 
                Click the link in the email to activate your account, then return here to sign in.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="glass-level-1 p-4 border-l-4 border-critical">
              <p className="text-sm text-critical">{error}</p>
              {error.includes("already exists") && (
                <Link 
                  href="/login" 
                  className="text-sm text-blue hover:underline mt-2 inline-block font-medium"
                >
                  Go to Sign In →
                </Link>
              )}
            </div>
          )}

          {/* Signup Form */}
          {!showConfirmation && <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-text-primary">
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
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>}

          {/* Sign in link for confirmed users */}
          {showConfirmation && (
            <Link href="/login">
              <Button className="w-full" size="lg">
                Go to Sign In
              </Button>
            </Link>
          )}

          {/* Footer */}
          {!showConfirmation && <div className="text-center text-sm text-text-muted">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>}
        </div>
      </div>
    </div>
  );
}

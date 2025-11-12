"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Verify the reset token from URL hash on mount
  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        // Check if we have a recovery token in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (type !== "recovery") {
          // Check if user already has an active session from clicking the link
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            setError("Invalid or expired password reset link. Please request a new one.");
            setVerifying(false);
            return;
          }
        }

        // Token is valid or session exists
        setVerifying(false);
      } catch (err) {
        console.error("Token verification error:", err);
        setError("An error occurred verifying your reset link.");
        setVerifying(false);
      }
    };

    verifyResetToken();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase client directly
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Sign out after password reset to force fresh login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/login?message=Password updated successfully. Please sign in with your new password.");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Password update error:", err);
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
              Set New Password
            </h1>
            <p className="text-text-muted">
              {verifying
                ? "Verifying your reset link..."
                : success
                ? "Your password has been updated"
                : "Enter your new password below"}
            </p>
          </div>

          {/* Verifying State */}
          {verifying && (
            <div className="glass-level-1 p-4 border-l-4 border-blue">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-text-muted">
                  Verifying your password reset link...
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="glass-level-1 p-4 border-l-4 border-green">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-text-primary font-semibold mb-1">
                    Password updated successfully!
                  </p>
                  <p className="text-sm text-text-muted">
                    Redirecting you to sign in...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="glass-level-1 p-4 border-l-4 border-critical">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-critical mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-critical">{error}</p>
                  {error.includes("Invalid or expired") && (
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-blue hover:underline mt-2 inline-block font-medium"
                    >
                      Request a new reset link →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Password Form */}
          {!success && !verifying && !error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-primary">
                  New Password
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
                  autoFocus
                  minLength={6}
                />
                <p className="text-xs text-text-muted">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-text-primary">
                  Confirm New Password
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
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          )}

          {/* Sign in Link */}
          {success && (
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue hover:underline font-medium"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

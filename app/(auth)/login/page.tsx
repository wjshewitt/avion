"use client";

import { Suspense } from "react";
import { Plane } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

function LoginContent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background-main p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 self-center font-medium group">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Plane className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-text-primary">FlightOps AI</span>
        </Link>

        {/* Tagline */}
        <p className="text-center text-text-muted">
          Command Console Access
        </p>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-svh flex items-center justify-center bg-background-main">
        <div className="animate-pulse text-text-primary">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

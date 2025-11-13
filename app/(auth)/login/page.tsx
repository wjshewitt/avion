"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
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

function LoginContent() {
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

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#e8e8e8] p-6 md:p-10 relative overflow-hidden">
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
                  System Authentication
                </p>
              </div>

              {/* Login Form */}
              <div className="glass-panel p-8">
                <LoginForm />
              </div>
            </motion.div>
          </CornerBrackets>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e8e8e8]">
        <div className="animate-pulse text-zinc-900">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

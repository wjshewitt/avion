"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { FlightVisualizer } from "@/components/test-signin/FlightVisualizer";
import { PreFlightSequence } from "@/components/test-signin/PreFlightSequence";
import { TestSignInForm } from "@/components/test-signin/TestSignInForm";

export default function TestSignInPage() {
  const [authState, setAuthState] = useState<"input" | "loading" | "success">(
    "input"
  );

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap");

        body {
          font-family: "Inter", sans-serif;
          margin: 0;
          overflow: hidden;
        }

        .mono {
          font-family: "JetBrains Mono", monospace;
        }

        /* MATERIALS */
        .ceramic-surface {
          background-color: #ffffff;
          color: #0f172a;
        }

        .tungsten-surface {
          background-color: #0f172a;
          color: #e5e5e5;
        }

        /* TACTILE INPUTS */
        .input-groove {
          background: #e8e8e8;
          box-shadow:
            inset 1px 1px 3px rgba(0, 0, 0, 0.1),
            inset -1px -1px 3px rgba(255, 255, 255, 0.7);
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .input-groove:focus-within {
          background: #f0f0f0;
          box-shadow:
            inset 1px 1px 2px rgba(0, 0, 0, 0.05),
            inset -1px -1px 2px rgba(255, 255, 255, 0.5);
          border-color: rgba(0, 0, 0, 0.1);
        }

        /* PHYSICAL BUTTON */
        .eng-btn {
          box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
          transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .eng-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="relative h-screen w-screen overflow-hidden tungsten-surface">
        {/* FULL BACKGROUND: TUNGSTEN VISION */}
        <div className="absolute inset-0 z-0">
          <FlightVisualizer />
        </div>

        {/* CENTER: FULL HEIGHT WHITE STRIP */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl ceramic-surface shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <div className="relative flex flex-col items-center justify-center h-full p-8">
            {/* System Status Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                System Online
              </span>
            </div>

            <AnimatePresence mode="wait">
              {authState === "input" && (
                <TestSignInForm key="login" setAuthState={setAuthState} />
              )}
              {authState === "loading" && (
                <PreFlightSequence
                  key="loading"
                  onComplete={() => setAuthState("success")}
                />
              )}
              {authState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
                    <Check size={32} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    Welcome Back, Commander.
                  </h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    Redirecting to Mission Control...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legal */}
            <div className="absolute bottom-6 text-[10px] text-zinc-400 font-mono">
              SECURE CONNECTION // 256-BIT ENCRYPTION
            </div>
          </div>
        </div>

        {/* RIGHT: OVERLAY TEXT */}
        <div className="absolute bottom-12 right-12 z-20 max-w-md hidden lg:block">
          <div className="w-12 h-1 bg-[#2563eb] mb-6"></div>
          <h2 className="text-3xl font-light text-white mb-4 tracking-tight leading-tight">
            Risk is inevitable.
            <br />
            <span className="text-zinc-500">Uncertainty is not.</span>
          </h2>
          <p className="text-sm text-zinc-400 font-mono leading-relaxed">
            Avion Intelligence™ analyzes 400+ variables per second to ensure
            your fleet operates within optimal parameters.
          </p>
        </div>

        {/* TOP RIGHT: DECORATIVE COORDINATES */}
        <div className="absolute top-8 right-8 text-right z-20 hidden lg:block">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">
            N 40° 44&apos; 54&quot;
          </div>
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            W 73° 59&apos; 08&quot;
          </div>
        </div>
      </div>
    </>
  );
}

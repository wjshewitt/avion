"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";

interface TestSignInFormProps {
  setAuthState: (state: "input" | "loading" | "success") => void;
}

export const TestSignInForm = ({ setAuthState }: TestSignInFormProps) => {
  const [role, setRole] = useState<"ops" | "pilot">("ops");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState("loading");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-sm"
    >
      {/* Header */}
      <div className="mb-12">
        <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center font-bold tracking-tighter mb-6 shadow-lg">
          Av
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">
          Flight Deck Access
        </h1>
        <p className="text-sm text-zinc-500">
          Enter credentials to initialize session.
        </p>
      </div>

      {/* Role Toggle (Mechanical Switch) */}
      <div className="bg-zinc-200 p-1 rounded-full flex mb-8 relative w-max">
        <style jsx>{`
          .input-groove {
            background: #e8e8e8;
            box-shadow:
              inset 1px 1px 3px rgba(0, 0, 0, 0.1),
              inset -1px -1px 3px rgba(255, 255, 255, 0.7);
          }
        `}</style>
        <button
          type="button"
          onClick={() => setRole("ops")}
          className={`relative z-10 px-6 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
            role === "ops" ? "text-white font-bold" : "text-zinc-500"
          }`}
        >
          Ops Center
        </button>
        <button
          type="button"
          onClick={() => setRole("pilot")}
          className={`relative z-10 px-6 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
            role === "pilot" ? "text-white font-bold" : "text-zinc-500"
          }`}
        >
          Flight Crew
        </button>
        <motion.div
          className="absolute top-1 bottom-1 bg-zinc-900 rounded-full shadow-sm"
          initial={false}
          animate={{
            left: role === "ops" ? "4px" : "auto",
            right: role === "pilot" ? "4px" : "auto",
            width: role === "ops" ? 110 : 115,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 ml-1">
            ID / Callsign
          </label>
          <div className="input-groove rounded-md px-4 py-3 flex items-center gap-3">
            <User size={16} className="text-zinc-400" strokeWidth={1.5} />
            <input
              type="text"
              className="bg-transparent border-none outline-none text-sm w-full font-mono text-zinc-800 placeholder-zinc-400"
              placeholder={role === "ops" ? "OPS-ID-000" : "PILOT-LIC-000"}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between ml-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Keycode
            </label>
            <button
              type="button"
              className="text-[10px] text-[#2563eb] hover:text-[#1d4ed8] uppercase tracking-wider font-bold"
            >
              Reset Key?
            </button>
          </div>
          <div className="input-groove rounded-md px-4 py-3 flex items-center gap-3">
            <Lock size={16} className="text-zinc-400" strokeWidth={1.5} />
            <input
              type="password"
              className="bg-transparent border-none outline-none text-sm w-full font-mono text-zinc-800 placeholder-zinc-400"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="eng-btn w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-sm py-4 font-medium text-sm tracking-wide flex items-center justify-center gap-2 group"
          >
            <style jsx>{`
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
            <span>ENGAGE SYSTEM</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <span>New to Avion?</span>
        <button className="text-zinc-900 font-semibold hover:underline">
          Request Access
        </button>
      </div>
    </motion.div>
  );
};

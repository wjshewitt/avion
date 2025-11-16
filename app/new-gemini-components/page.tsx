"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

const LucideIcon = ({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) => {
  const IconComp = (LucideIcons as any)[name];
  if (!IconComp) return null;
  return <IconComp size={size} className={className} />;
};

// 2.1 Mechanical Toggle Switch

interface MechanicalToggleProps {
  initialChecked?: boolean;
  onToggle?: (next: boolean) => void;
}

const MechanicalToggle = ({ initialChecked = false, onToggle }: MechanicalToggleProps) => {
  const [isOn, setIsOn] = useState(initialChecked);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    onToggle?.(newState);
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center w-12 h-6 rounded-full cursor-pointer transition-colors p-1 ${
        isOn ? "bg-[#F04E30]" : "bg-[#111113]"
      }`}
      style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-zinc-300 shadow-sm"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        style={{ x: isOn ? "100%" : "0%" }}
      />
    </div>
  );
};

// 2.2 System Button

interface SystemButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  iconName?: string;
  onClick?: () => void;
}

const SystemButton = ({ variant = "secondary", children, iconName, onClick }: SystemButtonProps) => {
  const isPrimary = variant === "primary";
  const IconComp = iconName ? (LucideIcons as any)[iconName] : null;

  return (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border
        transition-all
        ${
          isPrimary
            ? "bg-[#F04E30] text-white border-[#F04E30] shadow-md hover:bg-opacity-90"
            : "bg-[#222224] text-[#e5e5e5] border-[#333] hover:border-[#555] hover:bg-[#2a2a2a]"
        }
      `}
      whileTap={{ scale: 0.97, y: 1 }}
    >
      {IconComp && <IconComp size={14} />}
      <span>{children}</span>
    </motion.button>
  );
};

// 2.3 Recessed Text Input

interface RecessedInputProps {
  label: string;
  placeholder: string;
  type?: string;
  iconName?: string;
}

const RecessedInput = ({ label, placeholder, type = "text", iconName }: RecessedInputProps) => {
  const IconComp = iconName ? (LucideIcons as any)[iconName] : null;

  return (
    <div className="w-full">
      <label className="text-xs font-mono text-[#999] uppercase tracking-wider">{label}</label>
      <div
        className="
          flex items-center gap-2 mt-1 p-2 rounded-md border border-[#111]
          bg-[#111113] transition-all
          focus-within:border-[#F04E30]
        "
        style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
      >
        {IconComp && <IconComp size={16} className="text-[#999] shrink-0" />}
        <input
          type={type}
          placeholder={placeholder}
          className="
            w-full bg-transparent text-[#e5e5e5] text-sm
            focus:outline-none placeholder:text-[#555]
          "
        />
      </div>
    </div>
  );
};

// 3.1 Navigation Item

interface NavItemProps {
  iconName: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ iconName, children, isActive, onClick }: NavItemProps) => {
  const IconComp = (LucideIcons as any)[iconName];

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-4 py-3 cursor-pointer
        transition-colors group
        ${isActive ? "text-white" : "text-[#999] hover:text-white hover:bg-[#222224]"}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active-bar"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#F04E30] rounded-r-full"
          style={{ boxShadow: "0 0 12px rgba(240, 78, 48, 0.5)" }}
        />
      )}
      {IconComp && <IconComp size={18} className="shrink-0" />}
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};

// 3.2 Console Tabs

interface ConsoleTabsProps {
  tabs: string[];
  onTabChange?: (index: number) => void;
}

const ConsoleTabs = ({ tabs, onTabChange }: ConsoleTabsProps) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleSelect = (index: number) => {
    setSelectedTab(index);
    onTabChange?.(index);
  };

  return (
    <div className="flex w-full p-1 bg-[#111113] rounded-md border border-[#333]">
      {tabs.map((tab, i) => (
        <div
          key={tab}
          onClick={() => handleSelect(i)}
          className={`
            relative flex-1 px-3 py-1.5 text-xs font-mono text-center
            rounded-sm cursor-pointer transition-colors
            ${selectedTab === i ? "text-white" : "text-[#999] hover:text-white"}
          `}
        >
          {selectedTab === i && (
            <motion.div
              layoutId="tab-highlighter"
              className="absolute inset-0 bg-[#222224] border border-[#383838] rounded-sm"
              style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </div>
      ))}
    </div>
  );
};

// 4.1 Radial Gauge

interface RadialGaugeProps {
  value?: number;
  label?: string;
  unit?: string;
}

const RadialGauge = ({ value = 75, label = "Risk", unit = "%" }: RadialGaugeProps) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} stroke="#222224" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#F04E30"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-mono font-bold text-white">
          {Math.round(value)}
          <span className="text-base text-[#999]">{unit}</span>
        </span>
        <span className="text-xs font-mono uppercase text-[#999]">{label}</span>
      </div>
    </div>
  );
};

// 4.2 Linear Fuel Gauge

interface FuelGaugeProps {
  value?: number;
}

const FuelGauge = ({ value = 60 }: FuelGaugeProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-[#999]">E</span>
        <span className="text-xs font-mono text-[#999]">F</span>
      </div>
      <div className="relative w-full h-4 bg-[#111113] rounded-sm overflow-hidden border border-[#333]">
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-[#333]" />
          ))}
        </div>
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#F04E30]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </div>
      <div className="text-center mt-1">
        <span className="text-sm font-mono text-white">{value}%</span>
      </div>
    </div>
  );
};

// 4.3 LED Status Indicator

type StatusVariant = "success" | "warning" | "danger" | "offline";

interface StatusLEDProps {
  variant?: StatusVariant;
}

const StatusLED = ({ variant = "offline" }: StatusLEDProps) => {
  const colors: Record<StatusVariant, string> = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-rose-500",
    offline: "text-[#333]",
  };
  const shouldPulse = variant === "warning" || variant === "danger";

  return (
    <div
      className={`
        w-3 h-3 rounded-full transition-all
        ${colors[variant]}
        ${shouldPulse ? "animate-pulse" : ""}
      `}
      style={{
        backgroundColor: "currentColor",
        boxShadow: variant !== "offline" ? "0 0 8px currentColor" : "none",
      }}
    />
  );
};

export default function NewGeminiComponentsPage() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#050507] text-[#e5e5e5] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Avion Component Library <span className="text-xs text-[#999]">v3</span>
            </h1>
            <p className="text-xs text-[#999] mt-1">
              Tungsten / Glass Cockpit · Tactile, information-dense, generative controls for Gemini chat surfaces.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#777]">
            <StatusLED variant="success" />
            <span>Panel Status: Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-8">
          {/* Left Nav Panel */}
          <aside className="bg-[#111113] border border-[#333] rounded-lg p-3 flex flex-col gap-2">
            <div className="text-[10px] font-mono text-[#777] uppercase tracking-widest mb-1">
              Flight Console
            </div>
            <NavItem
              iconName="Gauge"
              isActive={activeNav === "dashboard"}
              onClick={() => setActiveNav("dashboard")}
            >
              Dashboard
            </NavItem>
            <NavItem
              iconName="Sliders"
              isActive={activeNav === "inputs"}
              onClick={() => setActiveNav("inputs")}
            >
              Inputs
            </NavItem>
            <NavItem
              iconName="RadioTower"
              isActive={activeNav === "instruments"}
              onClick={() => setActiveNav("instruments")}
            >
              Instruments
            </NavItem>
          </aside>

          {/* Main Content */}
          <main className="space-y-10">
            {/* Atomic Inputs */}
            <section className="bg-[#111113] border border-[#333] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-mono uppercase tracking-widest text-[#999]">
                  2.0 Atomic Components
                </h2>
                <ConsoleTabs
                  tabs={["Inputs", "Navigation", "Instrumentation"]}
                  onTabChange={() => {}}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#777] uppercase tracking-wider">
                    Mechanical Toggle
                  </div>
                  <MechanicalToggle />
                  <p className="text-xs text-[#777]">
                    Spring-based switch with tactile travel, tuned for mode toggles (e.g. auto-pilot, vectoring).
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#777] uppercase tracking-wider">
                    System Buttons
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <SystemButton variant="primary" iconName="Send">
                      Engage
                    </SystemButton>
                    <SystemButton variant="secondary" iconName="Settings2">
                      Configure
                    </SystemButton>
                  </div>
                  <p className="text-xs text-[#777]">
                    Primary (accent) and secondary (tungsten) buttons with a subtle depress animation on press.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-[#777] uppercase tracking-wider">
                    Recessed Input
                  </div>
                  <RecessedInput
                    label="Flight Query"
                    placeholder="KTEB → KJFK · 14:30Z"
                    iconName="Search"
                  />
                  <p className="text-xs text-[#777]">
                    Grooved text field for constrained prompts, ideal for structured Gemini instructions.
                  </p>
                </div>
              </div>
            </section>

            {/* Instrumentation */}
            <section className="bg-[#111113] border border-[#333] rounded-lg p-5">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#999] mb-4">
                4.0 Instrumentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center gap-3">
                  <RadialGauge value={68} label="Model Load" unit="%" />
                  <p className="text-xs text-center text-[#777] max-w-xs">
                    Cockpit-style radial gauge for utilization metrics: context window, latency budget, or risk.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <FuelGauge value={54} />
                  <p className="text-xs text-[#777]">
                    Segmented fuel gauge ideal for tokens, fuel, or confidence bands across the Gemini stack.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <StatusLED variant="success" />
                    <span className="text-xs text-[#e5e5e5]">Gemini Link</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusLED variant="warning" />
                    <span className="text-xs text-[#e5e5e5]">Tool Latency</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusLED variant="danger" />
                    <span className="text-xs text-[#e5e5e5]">Weather Feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusLED variant="offline" />
                    <span className="text-xs text-[#e5e5e5]">Aux Bus</span>
                  </div>
                  <p className="text-xs text-[#777]">
                    LED cluster for high-signal status at a glance across Gemini backends and aviation data feeds.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

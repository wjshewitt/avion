"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useFlights } from "@/lib/tanstack/hooks/useFlights";
import UserMenu from "@/components/user-menu";
import { ThemeToggleSimple } from "@/components/ui/theme-switch";

interface AdaptiveHeaderProps {
  currentRoute: string;
}

export function AdaptiveHeader({ currentRoute }: AdaptiveHeaderProps) {
  const router = useRouter();
  const { alerts, aiChatOpen, toggleAiChat } = useAppStore();
  const { data: flights = [] } = useFlights();
  const [utcTime, setUtcTime] = useState("");
  const [systemStatus] = useState<"nominal" | "degraded">("nominal");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      setUtcTime(`${hours}:${minutes} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        toggleAiChat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAiChat]);

  const activeFlightsCount = flights.filter((f) => f.status !== "Cancelled").length;

  const handleAlertsClick = () => {
    if (currentRoute !== "/") {
      router.push("/");
    }
    setTimeout(() => {
      const alertsSection = document.querySelector('[data-section="alerts"]');
      alertsSection?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleActiveFlightsClick = () => {
    router.push("/flights");
  };

  return (
    <header className="h-10 border-b border-border bg-card flex items-center px-6 gap-4 relative">
      {/* LEFT: Status + Controls */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {alerts.length > 0 && (
            <button
              onClick={handleAlertsClick}
              className="text-[12px] font-semibold uppercase tracking-wider text-red hover:underline decoration-2 underline-offset-4 transition-all"
            >
              {alerts.length} {alerts.length === 1 ? "ALERT" : "ALERTS"}
            </button>
          )}

          <button
            onClick={handleActiveFlightsClick}
            className="text-[12px] font-semibold uppercase tracking-wider hover:underline decoration-2 underline-offset-4 transition-all"
            style={{ color: "var(--primary)" }}
          >
            {activeFlightsCount} ACTIVE
          </button>

          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                systemStatus === "nominal" ? "bg-green" : "bg-red"
              }`}
            />
          </div>

          <div className="text-xs font-mono tabular-nums text-foreground">{utcTime}</div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Notifications Icon */}
          <button
            type="button"
            className="relative w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-card/80 hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {alerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--accent-primary)] border-2 border-card" />
            )}
          </button>

          <ThemeToggleSimple />

          {/* Profile Menu */}
          <UserMenu />
        </div>
      </div>

      {/* CENTER: Spacer */}
      <div className="flex-1" />

      {/* RIGHT: Space reserved for AI button + Search/Chat Bar (rendered by parent) */}
    </header>
  );
}

export default AdaptiveHeader;

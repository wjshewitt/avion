"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Settings, ChevronLeft, ChevronRight, Shield, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import type { UserPreferences } from "@/types/profile";

const navGroups = [
  {
    label: "Operations",
    items: [
      { href: "/", icon: Gauge, label: "Dashboard", count: null },
      { href: "/flights", icon: Plane, label: "Flights", count: null },
      { href: "/compliance", icon: Shield, label: "Compliance", count: null },
    ],
  },
  {
    label: "Information",
    items: [
      { href: "/weather", icon: Cloud, label: "Weather", count: null },
      { href: "/airports", icon: MapPin, label: "Airports", count: null },
      { href: "/risk", icon: AlertTriangle, label: "Risk", count: null },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/chat-enhanced", icon: MessageSquare, label: "Chat", count: null },
      { href: "/settings", icon: Settings, label: "Settings", count: null },
      { href: "/legal", icon: Info, label: "Legal", count: null },
    ],
  },
];

export function AdaptiveSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const { userProfile, isLoadingProfile } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialized) return;
    if (isLoadingProfile) return;

    const stored = window.localStorage.getItem("sidebar-expanded");
    if (stored !== null) {
      setIsExpanded(stored === "true");
      setInitialized(true);
      return;
    }

    const prefs = (userProfile?.preferences ?? {}) as UserPreferences;
    const fromProfile = prefs.sidebar_expanded_default ?? false;
    setIsExpanded(fromProfile);
    window.localStorage.setItem("sidebar-expanded", String(fromProfile));
    setInitialized(true);
  }, [initialized, isLoadingProfile, userProfile]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-expanded", String(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleExpanded();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleExpanded]);

  const shouldExpand = isExpanded || hovering;

  const getUserInitials = () => {
    if (isLoadingProfile || !userProfile) return "U";
    const name = userProfile.display_name || userProfile.username || "User";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (isLoadingProfile) return "Loading...";
    if (!userProfile) return "Guest User";
    return userProfile.display_name || userProfile.username || "User";
  };

  const getUserEmail = () => {
    if (isLoadingProfile) return "Loading...";
    if (!userProfile) return "guest@flightops.io";
    return "user@flightops.io";
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`
        bg-card border-r border-border
        flex flex-col overflow-hidden
        transition-all duration-500 ease-in-out
        ${shouldExpand ? "w-[200px]" : "w-14"}
      `}
    >
      {shouldExpand ? (
        /* EXPANDED STATE */
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="h-11 flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center text-white font-bold text-xs rounded-sm">
              Av
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground leading-tight">Avion</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground leading-tight">
                Flight Deck
              </span>
            </div>
          </div>

          {/* Segmented Navigation Groups */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pt-2">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5">
                {/* Group Label */}
                <div className="h-6 flex items-center px-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </div>
                </div>

                {/* Group Container with Groove */}
                <div 
                  className="border rounded-sm p-1 bg-surface"
                  style={{
                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)",
                  }}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          w-full h-11 flex items-center gap-2 px-3 rounded-sm
                          transition-all duration-200
                          ${active
                            ? "text-[color:var(--accent-primary)]"
                            : "text-muted-foreground hover:text-foreground"}
                        `}
                        style={active
                          ? {
                              backgroundColor:
                                "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                              boxShadow:
                                "0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent), 0 0 10px rgba(0,0,0,0.08)",
                            }
                          : undefined}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span className="text-xs font-medium flex-1 text-left">
                          {item.label}
                        </span>
                        {item.count !== null && (
                          <span className="text-[10px] font-mono tabular-nums text-muted-foreground font-semibold">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

  
          {/* Profile Section at Bottom */}
          <div className="pt-4 border-t border-border space-y-3">
            <div 
              className="border rounded-sm p-2 bg-surface"
              style={{
                boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)",
              }}
            >
              <div className="h-10 flex items-center gap-3">
                <div 
                  className="w-10 h-10 border flex items-center justify-center text-xs font-semibold rounded-sm flex-shrink-0"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate text-foreground">
                    {getDisplayName()}
                  </div>
                  <div className="text-[10px] font-mono truncate text-muted-foreground">
                    {getUserEmail()}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={toggleExpanded}
              className="w-full h-10 flex items-center justify-between px-3 rounded-sm transition-all hover:opacity-80 text-muted-foreground"
              title="Collapse sidebar (⌘B)"
            >
              <span className="text-xs font-medium">Collapse</span>
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            {/* Keyboard Shortcuts */}
            <div className="px-3 h-10 flex items-center border-t border-border text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              <div>⌘K Focus · ⌘J AI · ⌘B Toggle</div>
            </div>
          </div>
        </div>
      ) : (
        /* COLLAPSED STATE */
        <div className="flex flex-col h-full py-4 items-center relative">
          {/* Logo - Fixed h-11 to match expanded */}
          <div className="h-11 flex items-center justify-center w-full mb-2">
            <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center text-white font-bold text-xs rounded-sm">
              Av
            </div>
          </div>
          
          {/* Icon-Only Navigation - Matching expanded spacing */}
          <nav className="flex-1 px-2 w-full">
            <div className="flex flex-col gap-3 pt-2">
              {navGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-1.5">
                  {/* Invisible spacer for group label - matches expanded h-6 */}
                  <div className="h-6" />
                  
                  {/* Group Container with Groove - matching expanded state */}
                  <div 
                    className="border rounded-sm p-1.5 bg-surface"
                    style={{
                      boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)",
                    }}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            relative w-full h-11 flex items-center justify-center rounded
                            transition-all duration-200
                            ${active
                              ? "text-[color:var(--accent-primary)] border border-[color:var(--accent-primary)] bg-[color:color-mix(in_srgb,var(--accent-primary)_12%,transparent)] shadow-[0_0_10px_rgba(0,0,0,0.12)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }
                          `}
                          style={active
                            ? {
                                boxShadow:
                                  "0 0 0 1px color-mix(in srgb, var(--accent-primary) 35%, transparent), 0 6px 14px rgba(0,0,0,0.18)",
                              }
                            : undefined}
                          title={item.label}
                        >
                          <Icon size={18} strokeWidth={1.5} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Profile Avatar Only */}
          <div className="pt-4 border-t border-border w-full px-2 space-y-3">
            <div className="w-full flex justify-center">
              <div 
                className="w-10 h-10 border flex items-center justify-center text-xs font-semibold rounded-sm"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                {getUserInitials()}
              </div>
            </div>

            {/* Toggle Button - Icon Only */}
            <button
              onClick={toggleExpanded}
              className="w-full h-10 flex items-center justify-center rounded-sm transition-all text-muted-foreground hover:text-foreground"
              title="Expand sidebar (⌘B)"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AdaptiveSidebar;

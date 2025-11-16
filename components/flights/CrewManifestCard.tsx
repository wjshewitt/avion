"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

type CrewMember = {
  name: string;
  role: string;
  status?: "active" | "rest";
};

type Passenger = {
  name: string;
};

interface CrewManifestCardProps {
  crewCount: number | null;
  passengerCount: number | null;
  crewMembers: CrewMember[];
  passengers: Passenger[];
}

export default function CrewManifestCard({
  crewCount,
  passengerCount,
  crewMembers,
  passengers,
}: CrewManifestCardProps) {
  const totalCrew = crewCount ?? 0;
  const totalPax = passengerCount ?? 0;

  const hasCrewNames = crewMembers.length > 0;
  const hasPassengerNames = passengers.length > 0;

  const initials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  const formatCount = (value: number) => value.toString().padStart(2, "0");

  const emptyState =
    !totalCrew && !totalPax && !hasCrewNames && !hasPassengerNames;

  // Add custom styles for the grid pattern
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        }
        
        [data-theme="dark"] .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        }
        
        /* Enhanced contrast for tungsten theme */
        [data-theme="dark"] .ceramic {
          background: rgba(42, 42, 42, 0.95);
          border-color: rgba(96, 96, 96, 0.6);
        }
        
        [data-theme="dark"] .bg-zinc-800 {
          background-color: #3a3a3a;
        }
      `;
      document.head.appendChild(styleSheet);
      
      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, []);

  return (
    <div className="ceramic p-6 rounded-sm h-full flex flex-col border border-border relative overflow-hidden">
      {/* Subtle background pattern for tungsten theme */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Content positioned above the background pattern */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Crew Manifest
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            <span>
              Crew <span className="font-semibold text-foreground">{formatCount(totalCrew)}</span>
            </span>
            <span className="h-px w-4 bg-border" />
            <span>
              Pax <span className="font-semibold text-foreground">{formatCount(totalPax)}</span>
            </span>
          </div>
        </div>

        {emptyState ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] text-muted-foreground text-center max-w-xs leading-relaxed">
              Crew and passenger details are optional and can be added later.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Crew column */}
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
                <span>Crew</span>
                {hasCrewNames && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {crewMembers.length} listed
                  </span>
                )}
              </div>

              {hasCrewNames ? (
                <div className="space-y-4">
                  {crewMembers.slice(0, 5).map((member, idx) => (
                    <div
                      key={`${member.name}-${idx}`}
                      className="flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-zinc-800 dark:bg-zinc-300 dark:text-zinc-900 transition-colors"
                          aria-hidden
                        >
                          {initials(member.name)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {member.name || "Unnamed crew"}
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                            {member.role || "Crew"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`w-2 h-2 rounded-full inline-block mb-1 transition-shadow ${
                            member.status === "active"
                              ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]"
                              : member.status === "rest"
                                ? "bg-amber-400 shadow-[0_0_3px_rgba(251,191,36,0.4)]"
                                : "bg-zinc-400"
                          }`}
                        />
                        <div className="text-[8px] uppercase tracking-wider text-muted-foreground">
                          {member.status === "active"
                            ? "On Duty"
                            : member.status === "rest"
                              ? "Resting"
                              : "Status N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {crewMembers.length > 5 && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      + {crewMembers.length - 5} more
                    </div>
                  )}
                </div>
              ) : totalCrew > 0 ? (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {totalCrew === 1
                    ? "Crew manifest not specified. 1 crew member on board."
                    : `Crew manifest not specified. ${totalCrew} crew on board.`}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No crew listed.
                </p>
              )}
            </div>

            {/* Passenger column */}
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
                <span>Passengers</span>
                {hasPassengerNames && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {passengers.length} listed
                  </span>
                )}
              </div>

              {hasPassengerNames ? (
                <div className="space-y-2">
                  {passengers.slice(0, 6).map((pax, idx) => (
                    <div
                      key={`${pax.name}-${idx}`}
                      className="flex items-center gap-2 text-xs text-foreground"
                    >
                      <motion.span
                        className="w-1 h-1 rounded-full bg-zinc-400"
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                      />
                      <span className="truncate">{pax.name || "Unnamed passenger"}</span>
                    </div>
                  ))}
                  {passengers.length > 6 && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      + {passengers.length - 6} more
                    </div>
                  )}
                </div>
              ) : totalPax > 0 ? (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {totalPax === 1
                    ? "Passenger names not specified. 1 passenger on board."
                    : `Passenger names not specified. ${totalPax} passengers on board.`}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No passengers listed.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type ExperimentalSectionShellProps = {
  label: string;
  name: string;
  description: string;
  status?: "stable" | "experimental" | "beta";
  className?: string;
  children: ReactNode;
};

const statusConfig: Record<NonNullable<ExperimentalSectionShellProps["status"]>, { label: string; dotClass: string }> = {
  stable: { label: "STABLE", dotClass: "bg-emerald-500" },
  experimental: { label: "EXPERIMENTAL", dotClass: "bg-amber-500" },
  beta: { label: "BETA", dotClass: "bg-blue-500" },
};

export function ExperimentalSectionShell({
  label,
  name,
  description,
  status = "experimental",
  className,
  children,
}: ExperimentalSectionShellProps) {
  const statusInfo = statusConfig[status];

  return (
    <section
      className={cn(
        "flex flex-col justify-between rounded-sm border border-[#333] bg-[#2A2A2A] shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.2)] p-6 space-y-4",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
          {label}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          <span
            className={cn(
              "inline-flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.6)]",
              statusInfo.dotClass,
            )}
          />
          <span>{statusInfo.label}</span>
        </div>
      </header>

      <div className="min-h-[180px]">{children}</div>

      <footer className="border-t border-[#333] pt-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-white">{name}</h3>
          <p className="text-xs text-[#A1A1AA]">{description}</p>
        </div>
      </footer>
    </section>
  );
}

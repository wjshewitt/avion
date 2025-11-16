"use client";

import Link from "next/link";
import { Suspense } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <div className={`relative h-9 ${className}`}>
      <div
        className="h-full px-8 flex items-center relative bg-surface border-b border-border"
        style={{
          clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
          width: "fit-content",
          boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2 text-[10px] font-mono pr-4">
          <Suspense fallback={
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          }>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && <span className="text-muted-foreground/50">/</span>}
                </div>
              );
            })}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Breadcrumb;

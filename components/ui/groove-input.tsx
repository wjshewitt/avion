'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GrooveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  variant?: 'ceramic' | 'tungsten'
}

const GrooveInput = React.forwardRef<HTMLInputElement, GrooveInputProps>(
  ({ className, type, icon, variant = 'ceramic', ...props }, ref) => {
    return (
      <div className={cn(
        "relative flex items-center w-full rounded-sm overflow-hidden transition-all duration-200",
        variant === 'ceramic' && [
          "bg-[#F4F4F4] border border-zinc-200",
          "shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]",
          "dark:bg-[#2A2A2A] dark:border-[#333]",
          "dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]",
          "focus-within:bg-white dark:focus-within:bg-[#323232]",
          "focus-within:border-zinc-300 dark:focus-within:border-[#3a3a3a]",
          "focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_0_0_2px_rgba(240,78,48,0.1)]",
          "dark:focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]"
        ],
        variant === 'tungsten' && [
           "bg-[#2A2A2A] border border-[#333]",
           "shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]",
           "focus-within:bg-[#323232] focus-within:border-[#3a3a3a]",
           "focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]"
        ]
      )}>
        {icon && (
          <div className={cn(
            "pl-4 pr-2 flex items-center justify-center",
            variant === 'tungsten' ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500"
          )}>
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
             variant === 'tungsten' ? "text-zinc-200" : "text-zinc-900 dark:text-zinc-200",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
GrooveInput.displayName = "GrooveInput"

export { GrooveInput }

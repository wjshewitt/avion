import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avionCardVariants = cva(
  "rounded-sm p-6 transition-all duration-200",
  {
    variants: {
      variant: {
        ceramic: [
          "bg-[#F4F4F4] text-zinc-900",
          "border border-zinc-200",
          "shadow-[-2px_-2px_5px_rgba(255,255,255,0.8),2px_2px_5px_rgba(0,0,0,0.05)]",
          "dark:bg-[#2A2A2A] dark:text-zinc-200",
          "dark:border-[#333]",
          "dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.2)]"
        ],
        tungsten: [
          "bg-[#2A2A2A] text-zinc-200",
          "border border-[#333]",
          "shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.2)]"
        ],
        outline: [
          "bg-transparent",
          "border border-zinc-200 dark:border-[#333]",
        ]
      },
    },
    defaultVariants: {
      variant: "ceramic",
    },
  }
)

export interface AvionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avionCardVariants> {}

function AvionCard({ className, variant, ...props }: AvionCardProps) {
  return (
    <div className={cn(avionCardVariants({ variant }), className)} {...props} />
  )
}

export { AvionCard, avionCardVariants }

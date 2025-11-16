"use client"

import {
 CircleCheckIcon,
 InfoIcon,
 Loader2Icon,
 OctagonXIcon,
 TriangleAlertIcon,
} from"lucide-react"
import { useTheme } from"next-themes"
import { Toaster as Sonner, type ToasterProps } from"sonner"

const Toaster = ({ ...props }: ToasterProps) => {
 const { theme ="system" } = useTheme()

 return (
 <Sonner
 theme={theme as ToasterProps["theme"]}
 className="toaster group"
 icons={{
 success: <CircleCheckIcon className="size-4" />,
 info: <InfoIcon className="size-4" />,
 warning: <TriangleAlertIcon className="size-4" />,
 error: <OctagonXIcon className="size-4" />,
 loading: <Loader2Icon className="size-4 animate-spin" />,
 }}
 toastOptions={{
 classNames: {
 toast:
 "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-sm",
 description: "group-[.toast]:text-muted-foreground",
 actionButton:
 "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground rounded-sm",
 cancelButton:
 "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-sm",
 },
 }}
 style={
 {
"--normal-bg":"var(--card)",
"--normal-text":"var(--foreground)",
"--normal-border":"var(--border)",
"--success-bg":"var(--card)",
"--success-border":"#10b981",
"--error-bg":"var(--card)",
"--error-border":"#F04E30",
"--warning-bg":"var(--card)",
"--warning-border":"#f59e0b",
"--info-bg":"var(--card)",
"--info-border":"var(--primary)",
"--border-radius":"0.125rem",
"--toast-box-shadow":"inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.1)",
 } as React.CSSProperties
 }
 {...props}
 />
 )
}

export { Toaster }

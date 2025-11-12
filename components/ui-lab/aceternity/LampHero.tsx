"use client";

import * as React from"react";

type Props = { title: string; subtitle?: string } & React.HTMLAttributes<HTMLDivElement>;

export default function LampHero({ title, subtitle, className ="", ...rest }: Props) {
 return (
 <div
 {...rest}
 className={`relative overflow-hidden border border-border dark:border-slate-700 bg-white dark:bg-slate-900 p-8 ${className}`}
 >
 <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 bg-gradient-to-r from-blue-200 via-white to-indigo-200 opacity-70 blur-3xl" />
 <h2 className="relative text-2xl font-bold tracking-tight text-text-primary dark:text-slate-50">
 {title}
 </h2>
 {subtitle && (
 <p className="relative mt-2 text-sm text-text-secondary dark:text-slate-400">{subtitle}</p>
 )}
 </div>
 );
}

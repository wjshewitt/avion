"use client";

import * as React from"react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function AuroraBackground({ className ="", ...rest }: Props) {
 return (
 <div {...rest} className={`relative overflow-hidden ${className}`}>
 <div className="absolute inset-0 -z-10">
 <div className="absolute -top-16 -left-16 h-56 w-56 bg-blue-300/40 blur-3xl" />
 <div className="absolute -bottom-10 left-1/3 h-52 w-52 bg-indigo-300/40 blur-3xl" />
 <div className="absolute -right-20 top-0 h-64 w-64 bg-cyan-300/40 blur-3xl" />
 <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 to-transparent" />
 </div>
 <div className="relative text-center">
 <h4 className="text-lg font-semibold text-text-primary dark:text-slate-50">Aurora Background</h4>
 <p className="text-sm text-text-secondary dark:text-slate-400">Soft animated gradient blobs</p>
 </div>
 </div>
 );
}

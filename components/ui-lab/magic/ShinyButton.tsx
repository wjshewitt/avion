"use client";

import * as React from"react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
 children: React.ReactNode;
};

export default function ShinyButton({ children, className ="", ...props }: Props) {
 return (
 <button
 {...props}
 className={`group relative overflow-hidden px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow hover:from-blue-500 hover:to-indigo-500 transition-colors ${className}`}
 >
 <span className="relative z-10">{children}</span>
 <span
 aria-hidden
 className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.6),transparent)] transition-transform duration-700 group-hover:translate-x-full"
 />
 </button>
 );
}

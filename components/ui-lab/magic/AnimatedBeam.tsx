"use client";

import * as React from"react";

// Simple animated SVG beams connecting nodes
export default function AnimatedBeam() {
 return (
 <div className="relative h-40">
 <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 160">
 <defs>
 <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
 <stop offset="0%" stopColor="#60a5fa" />
 <stop offset="100%" stopColor="#a78bfa" />
 </linearGradient>
 </defs>
 <path
 d="M40 120 C140 20, 260 20, 360 120"
 fill="none"
 stroke="url(#beam)"
 strokeWidth="3"
 className="[stroke-dasharray:8_8] animate-[dash_2s_linear_infinite]"
 />
 <path
 d="M40 40 C140 140, 260 140, 360 40"
 fill="none"
 stroke="url(#beam)"
 strokeWidth="2"
 className="opacity-60 [stroke-dasharray:6_10] animate-[dash_3s_linear_infinite]"
 />
 </svg>
 <div className="absolute left-6 top-28 h-3 w-3 bg-blue-500 shadow" />
 <div className="absolute right-6 top-28 h-3 w-3 bg-indigo-500 shadow" />
 <style>{`
 @keyframes dash { to { stroke-dashoffset: -100; } }
 `}</style>
 </div>
 );
}

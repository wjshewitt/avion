"use client";

import * as React from"react";

const items = [
 { title:"Flights", desc:"Live ops", color:"bg-blue-50" },
 { title:"Weather", desc:"METAR/TAF", color:"bg-amber-50" },
 { title:"Airports", desc:"Runways", color:"bg-emerald-50" },
 { title:"Chat", desc:"AI assist", color:"bg-indigo-50" },
];

export default function BentoGridMini() {
 return (
 <div className="grid grid-cols-2 gap-3">
 {items.map((it) => (
 <div
 key={it.title}
 className={`group border border-border dark:border-slate-700 ${it.color} p-4 transition-transform hover:-translate-y-0.5`}
 >
 <div className="text-sm font-semibold text-text-primary dark:text-slate-50">{it.title}</div>
 <div className="text-xs text-text-secondary dark:text-slate-400">{it.desc}</div>
 <div className="mt-3 h-1 w-10 origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform group-hover:scale-x-100" />
 </div>
 ))}
 </div>
 );
}
